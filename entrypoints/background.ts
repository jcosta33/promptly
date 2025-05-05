import { EventType } from "../src/modules/messaging/models/event_types";
import { listen_for_streams } from "../src/modules/messaging/repositories/message_bus";
import { DEFAULT_INFERENCE_PARAMETERS } from "../src/modules/inference/models/inference_model";
import type { Message } from "../src/modules/inference/models/inference_model";
import { get_settings } from "../src/modules/configuration/use_cases/get_settings";
import { MLCEngine } from "@mlc-ai/web-llm";
import { generate_text_stream } from "../src/modules/inference/repositories/generate_text_stream";
import { initialize_messaging } from "../src/modules/messaging/use_cases/initialize_messaging";
import { logger } from "../src/utils/logger";

export default defineBackground(() => {
  logger.log("Promptly background service starting...", {
    id: browser.runtime.id,
  });

  initialize_messaging();

  let llmEngine: MLCEngine | null = null;
  let currentModel = "";

  listen_for_streams("promptly-inference", async (stream, identifier) => {
    logger.log("Inference connection established", { identifier });

    stream.onMessage(EventType.MODEL_LOAD_REQUEST, async (payload) => {
      const { modelId, requestId, useStream } = payload;
      logger.log("Received MODEL_LOAD_REQUEST via stream:", {
        modelId,
        requestId,
        useStream,
      });

      try {
        let effectiveModelId = modelId;
        if (!effectiveModelId) {
          const settings = await get_settings();
          effectiveModelId = settings.selectedModelId;
          logger.log("Using model ID from settings:", effectiveModelId);

          if (!effectiveModelId) {
            logger.error("No model ID specified in request or settings");
            stream.send(EventType.INFERENCE_ERROR, {
              requestId,
              error: "No model ID specified",
            });
            return;
          }
        }

        logger.log("Sending initial loading progress update");
        stream.send(EventType.MODEL_LOADING_PROGRESS, {
          requestId,
          model: effectiveModelId,
          progress: 0,
          status: "Starting model load...",
        });

        logger.log("Creating MLCEngine instance");
        try {
          llmEngine = new MLCEngine();
          logger.log("MLCEngine instance created successfully");
        } catch (engineError) {
          logger.error("Error creating MLCEngine instance:", engineError);
          stream.send(EventType.INFERENCE_ERROR, {
            requestId,
            error: `Failed to create engine: ${engineError instanceof Error ? engineError.message : String(engineError)}`,
          });
          return;
        }

        logger.log("Setting up progress callback");

        llmEngine.setInitProgressCallback((report) => {
          logger.debug("Model loading progress report:", report);
          try {
            stream.send(EventType.MODEL_LOADING_PROGRESS, {
              requestId,
              model: effectiveModelId,
              progress: report.progress,
              status: report.text,
            });
          } catch (progressError) {
            logger.error("Error sending progress update:", progressError);
          }
        });

        logger.log(`Starting model load for: ${effectiveModelId}`);
        try {
          await llmEngine.reload(effectiveModelId);
          currentModel = effectiveModelId;
          logger.log(`Model ${effectiveModelId} loaded successfully`);
        } catch (loadError) {
          logger.error(`Error loading model ${effectiveModelId}:`, loadError);
          stream.send(EventType.INFERENCE_ERROR, {
            requestId,
            error: `Error loading model: ${loadError instanceof Error ? loadError.message : String(loadError)}`,
          });
          return;
        }

        stream.send(EventType.MODEL_LOADING_PROGRESS, {
          requestId,
          model: effectiveModelId,
          progress: 1,
          status: "Model loaded successfully",
        });
        logger.log("Final progress update sent");
      } catch (error) {
        logger.error("Top-level error in model loading:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        stream.send(EventType.INFERENCE_ERROR, {
          requestId,
          error: "Failed to load model: " + errorMessage,
        });
      }
    });

    stream.onMessage(EventType.REQUEST_ACTION, async (payload) => {
      const { messages, parameters, action, modelId } = payload;
      const requestId =
        payload.requestId ||
        `request-${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      logger.log("Received REQUEST_ACTION event:", {
        action,
        modelId,
        requestId,
        payload,
      });

      try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          logger.error("No valid messages provided for text generation", {
            requestId,
          });
          stream.send(EventType.INFERENCE_ERROR, {
            requestId,
            error: "No valid messages provided for text generation",
          });
          return;
        }

        const settings = await get_settings();
        const selectedModelId = settings.selectedModelId;
        logger.debug("Current settings for inference:", {
          selectedModelId,
          currentModel,
        });

        if (
          !llmEngine ||
          (selectedModelId && selectedModelId !== currentModel)
        ) {
          logger.info(
            "LLM engine not loaded or model changed, initiating load...",
            { selectedModelId, currentModel }
          );
          stream.send(EventType.MODEL_LOADING_PROGRESS, {
            requestId,
            model: selectedModelId,
            progress: 0,
            status: "Loading model...",
          });

          try {
            logger.log("Creating MLCEngine instance");
            llmEngine = new MLCEngine();

            llmEngine.setInitProgressCallback((report) => {
              logger.debug("Model loading progress:", report);
              stream.send(EventType.MODEL_LOADING_PROGRESS, {
                requestId,
                model: selectedModelId,
                progress: report.progress,
                status: report.text,
              });
            });

            logger.log(`Starting model load for: ${selectedModelId}`);

            await llmEngine.reload(selectedModelId);
            currentModel = selectedModelId;

            logger.log(`Model ${selectedModelId} loaded successfully`);

            stream.send(EventType.MODEL_LOADING_PROGRESS, {
              requestId,
              model: selectedModelId,
              progress: 1,
              status: "Model loaded successfully",
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            logger.error(
              "Failed to load model during inference request:",
              error
            );
            stream.send(EventType.INFERENCE_ERROR, {
              requestId,
              error: "Failed to load model: " + errorMessage,
            });
            return;
          }
        }

        const cancelUnsubscribe = stream.onMessage(
          EventType.STOP_INFERENCE,
          async (cancelPayload) => {
            if (cancelPayload.requestId === requestId) {
              logger.log("Received inference cancellation request", {
                requestId,
              });
              await llmEngine?.interruptGenerate();
              logger.log("Inference interrupted", { requestId });
              cancelPayload.onStop?.();
            }
          }
        );

        try {
          logger.debug("Starting generate_text_stream", { requestId });
          let fullResponseText = "";
          let usage:
            | {
                prompt_tokens?: number;
                completion_tokens?: number;
                total_tokens?: number;
              }
            | undefined = undefined;

          const inferenceParams = {
            ...DEFAULT_INFERENCE_PARAMETERS,
            ...(parameters || {}),
          };

          await generate_text_stream({
            engine: llmEngine,
            messages,
            parameters: inferenceParams,
            onToken: (token) => {
              stream.send(EventType.INFERENCE_CHUNK, {
                requestId,
                token,
              });
            },
            onComplete: (text, usageInfo) => {
              fullResponseText = text;
              usage = usageInfo;
            },
          });
          logger.debug("generate_text_stream completed", { requestId });

          if (!usage) {
            logger.warn("Usage info not provided by WebLLM, approximating...", {
              requestId,
            });
            const inputLength = messages.reduce(
              (acc, msg: Message) => acc + (msg.content?.length || 0),
              0
            );
            usage = {
              prompt_tokens: Math.floor(inputLength / 4),
              completion_tokens: Math.floor(fullResponseText.length / 4),
              total_tokens: Math.floor(
                (inputLength + fullResponseText.length) / 4
              ),
            };
          }

          logger.log("Sending inference complete event", { requestId });
          stream.send(EventType.INFERENCE_COMPLETE, {
            requestId,
            fullResponse: fullResponseText,
            usage,
          });

          cancelUnsubscribe();
        } catch (inferenceError) {
          const errorMessage =
            inferenceError instanceof Error
              ? inferenceError.message
              : String(inferenceError);
          logger.error("Error during inference execution:", {
            requestId,
            error: errorMessage,
          });
          stream.send(EventType.INFERENCE_ERROR, {
            requestId,
            error: "Error during inference: " + errorMessage,
          });
          cancelUnsubscribe();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error("Error processing REQUEST_ACTION:", {
          requestId,
          error: errorMessage,
        });
        stream.send(EventType.INFERENCE_ERROR, {
          requestId,
          error: "Error processing request: " + errorMessage,
        });
      }
    });

    return () => {
      logger.log("Inference connection disconnected", { identifier });
    };
  });

  // keep alive

  setInterval(
    () => {
      logger.log("Keep alive");
    },
    1000 * 60 * 5
  );
});

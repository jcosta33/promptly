import { EventType } from "../src/modules/messaging/models/event_types";
import { listen_for_streams } from "../src/modules/messaging/repositories/message_bus";
import {
  DEFAULT_INFERENCE_PARAMETERS,
  Message,
} from "../src/modules/inference/models/inference_model";
import { get_settings } from "../src/modules/configuration/use_cases/get_settings";
import { MLCEngine } from "@mlc-ai/web-llm";
import { generate_text_stream } from "../src/modules/inference/repositories/generate_text_stream";
import { initialize_messaging } from "../src/modules/messaging/use_cases/initialize_messaging";

export default defineBackground(() => {
  console.log("Promptly background service starting...", {
    id: browser.runtime.id,
  });

  // Initialize the messaging system before setting up any listeners
  initialize_messaging();

  // Keep track of the loaded model instance
  let llmEngine: MLCEngine | null = null;
  let currentModel = "";

  // Handle connections for inference using our message bus system
  listen_for_streams("promptly-inference", async (stream, identifier) => {
    console.log("Inference connection established", { identifier });

    // Handle model load requests via stream
    stream.onMessage(EventType.MODEL_LOAD_REQUEST, async (payload) => {
      const { modelId, requestId, useStream } = payload;
      console.log("Received MODEL_LOAD_REQUEST via stream:", {
        modelId,
        requestId,
        useStream,
      });

      try {
        if (!modelId) {
          const settings = await get_settings();
          const selectedModelId = settings.selectedModelId;
          console.log("Using model ID from settings:", selectedModelId);

          if (!modelId) {
            console.error("No model ID specified in request or settings");
            stream.send(EventType.INFERENCE_ERROR, {
              requestId,
              error: "No model ID specified",
            });
            return;
          }
        }

        // Let the client know we're loading a model
        console.log("Sending initial loading progress update");
        stream.send(EventType.MODEL_LOADING_PROGRESS, {
          requestId,
          model: modelId,
          progress: 0,
          status: "Starting model load...",
        });

        // Create and initialize the WebLLM engine
        console.log("Creating MLCEngine instance");
        try {
          llmEngine = new MLCEngine();
          console.log("MLCEngine instance created successfully");
        } catch (engineError) {
          console.error("Error creating MLCEngine instance:", engineError);
          stream.send(EventType.INFERENCE_ERROR, {
            requestId,
            error: `Failed to create engine: ${engineError instanceof Error ? engineError.message : String(engineError)}`,
          });
          return;
        }

        // Set up a progress callback
        console.log("Setting up progress callback");

        llmEngine.setInitProgressCallback((report) => {
          console.log("Model loading progress report:", report);
          try {
            stream.send(EventType.MODEL_LOADING_PROGRESS, {
              requestId,
              model: modelId,
              progress: report.progress,
              status: report.text,
            });
            console.log("Progress update sent successfully");
          } catch (progressError) {
            console.error("Error sending progress update:", progressError);
          }
        });

        // Load the model
        console.log(`Starting model load for: ${modelId}`);
        try {
          await llmEngine.reload(modelId);
          currentModel = modelId;
          console.log(`Model ${modelId} loaded successfully`);
        } catch (loadError) {
          console.error(`Error loading model ${modelId}:`, loadError);
          stream.send(EventType.INFERENCE_ERROR, {
            requestId,
            error: `Error loading model: ${loadError instanceof Error ? loadError.message : String(loadError)}`,
          });
          return;
        }

        stream.send(EventType.MODEL_LOADING_PROGRESS, {
          requestId,
          model: modelId,
          progress: 1,
          status: "Model loaded successfully",
        });
        console.log("Final progress update sent");
      } catch (error) {
        console.error("Top-level error in model loading:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        stream.send(EventType.INFERENCE_ERROR, {
          requestId,
          error: "Failed to load model: " + errorMessage,
        });
      }
    });

    // Continue with the existing handler for REQUEST_ACTION
    stream.onMessage(EventType.REQUEST_ACTION, async (payload) => {
      const { messages, parameters, action, modelId } = payload;
      const requestId =
        payload.requestId ||
        `request-${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      console.log("Received REQUEST_ACTION event:", {
        action,
        modelId,
        requestId,
        payload,
      });

      try {
        // The load_model action is now handled by the MODEL_LOAD_REQUEST event handler
        // For text generation requests, verify we have messages to process
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          stream.send(EventType.INFERENCE_ERROR, {
            requestId,
            error: "No valid messages provided for text generation",
          });
          return;
        }

        // Get user settings to determine which model to use
        const settings = await get_settings();
        const selectedModelId = settings.selectedModelId;

        // Check if we need to load a model
        if (
          !llmEngine ||
          (selectedModelId && selectedModelId !== currentModel)
        ) {
          // Let the client know we're loading a model
          stream.send(EventType.MODEL_LOADING_PROGRESS, {
            requestId,
            model: selectedModelId,
            progress: 0,
            status: "Loading model...",
          });

          try {
            // Create and initialize the WebLLM engine
            console.log("Creating MLCEngine instance");
            llmEngine = new MLCEngine();

            // Set up a progress callback
            llmEngine.setInitProgressCallback((report) => {
              console.log("Model loading progress:", report);
              stream.send(EventType.MODEL_LOADING_PROGRESS, {
                requestId,
                model: selectedModelId,
                progress: report.progress,
                status: report.text,
              });
            });

            // Load the model
            console.log(`Starting model load for: ${selectedModelId}`);
            await llmEngine.reload(selectedModelId);
            currentModel = selectedModelId;
            console.log(`Model ${selectedModelId} loaded successfully`);

            stream.send(EventType.MODEL_LOADING_PROGRESS, {
              requestId,
              model: selectedModelId,
              progress: 1,
              status: "Model loaded successfully",
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            stream.send(EventType.INFERENCE_ERROR, {
              requestId,
              error: "Failed to load model: " + errorMessage,
            });
            return;
          }
        }

        // Set up a handler for cancellation
        const cancelUnsubscribe = stream.onMessage(
          EventType.CANCEL_INFERENCE,
          (cancelPayload) => {
            if (cancelPayload.requestId === requestId) {
              // Stop inference if requested
              llmEngine?.interruptGenerate();
            }
          }
        );

        // Run the inference with WebLLM
        try {
          // Set up tracking variables
          let fullResponseText = "";
          let usage: any = undefined;

          // Merge parameters with defaults
          const inferenceParams = {
            ...DEFAULT_INFERENCE_PARAMETERS,
            ...(parameters || {}),
          };

          // Use the generate_text function from the repository
          await generate_text_stream({
            engine: llmEngine,
            messages,
            parameters: inferenceParams,
            onToken: (token) => {
              // Send token back to client
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

          // Calculate approximate token counts if usage data isn't provided
          if (!usage) {
            const inputLength = messages.reduce(
              (acc, msg) => acc + msg.content.length,
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

          // Send completion message
          stream.send(EventType.INFERENCE_COMPLETE, {
            requestId,
            fullResponse: fullResponseText,
            usage,
          });

          // Remove the cancel handler
          cancelUnsubscribe();
        } catch (inferenceError) {
          const errorMessage =
            inferenceError instanceof Error
              ? inferenceError.message
              : String(inferenceError);
          stream.send(EventType.INFERENCE_ERROR, {
            requestId,
            error: "Error during inference: " + errorMessage,
          });

          // Remove the cancel handler
          cancelUnsubscribe();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        stream.send(EventType.INFERENCE_ERROR, {
          requestId,
          error: "Error processing request: " + errorMessage,
        });
      }
    });

    // Handle connection clean-up
    return () => {
      console.log("Inference connection disconnected", { identifier });
    };
  });
});

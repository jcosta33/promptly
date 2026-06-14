import { useState, useEffect, FC, useRef } from "react";
import { PiXCircleBold, PiChatCircleTextBold } from "react-icons/pi";

import {
  Message,
  type InferenceParameters,
} from "$/modules/inference/models/inference_model";
import { useDraggable } from "$/modules/selection/presentations/hooks/useDraggable";
import { logger } from "$/utils/logger";
import { Box } from "@/src/components/Box/Box";
import { Button } from "@/src/components/Button/Button";
import { Flex } from "@/src/components/Flex/Flex";
import { Text } from "@/src/components/Text/Text";
import { ActionDefinition } from "@/src/modules/actions/models/action_models";
import { get_applicable_actions } from "@/src/modules/actions/use_cases/get_applicable_actions";
import { get_settings } from "@/src/modules/configuration/use_cases/get_settings";
import { PageCategory } from "@/src/modules/context/models/context";
import { get_page_context } from "@/src/modules/context/use_cases/get_page_context";
import { SelectionData } from "@/src/modules/selection/models/selection";

import { ResponseDisplay } from "../../components/ResponseDisplay/ResponseDisplay";
import { useInference } from "../../hooks/useInference";

import styles from "./PromptOverlay.module.css";

export type PromptlyOverlayProps = {
  selectionData: SelectionData;
  position: { x: number; y: number };
  onClose: () => void;
  initialActionId?: string;
};

type Position = {
  x: number;
  y: number;
};

type LastInferenceRequest = {
  messages: Message[];
  parameters?: Partial<InferenceParameters>;
};

const OVERLAY_MARGIN = 12;
const DEFAULT_OVERLAY_SIZE = {
  width: 400,
  height: 520,
};

const clampOverlayPosition = (
  position: Position,
  element: HTMLElement | null,
): Position => {
  if (typeof window === "undefined") {
    return position;
  }

  const width = element?.offsetWidth || DEFAULT_OVERLAY_SIZE.width;
  const height = element?.offsetHeight || DEFAULT_OVERLAY_SIZE.height;
  const minX = window.scrollX + OVERLAY_MARGIN;
  const minY = window.scrollY + OVERLAY_MARGIN;
  const maxX = Math.max(
    minX,
    window.scrollX + window.innerWidth - width - OVERLAY_MARGIN,
  );
  const maxY = Math.max(
    minY,
    window.scrollY + window.innerHeight - height - OVERLAY_MARGIN,
  );

  return {
    x: Math.min(Math.max(position.x, minX), maxX),
    y: Math.min(Math.max(position.y, minY), maxY),
  };
};

/**
 * Overlay component that displays actions and inference results
 */
export const PromptlyOverlay: FC<PromptlyOverlayProps> = ({
  selectionData,
  position,
  onClose,
  initialActionId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pageContext, setPageContext] = useState<{ category: PageCategory }>();

  const [customActions, setCustomActions] = useState<ActionDefinition[]>([]);

  useEffect(() => {
    get_settings().then((settings) => {
      if (settings.customActions) {
        const mappedActions: ActionDefinition[] = settings.customActions.map(ca => ({
          id: ca.id,
          name: ca.name,
          description: "Custom Action",
          icon: PiChatCircleTextBold as any,
          contextTypes: ["text", "code", "image", "link", "input", "unknown"] as any,
          dataTypes: ["text", "code", "image", "url", "unknown"] as any,
          pageCategories: ["article", "documentation", "code_repository", "social_media", "video", "shopping", "search_results", "unknown"] as any,
          llmParams: {},
          systemPrompt: ca.prompt,
          userPrompt: "{{text}}"
        }));
        setCustomActions(mappedActions);
      }
    });
  }, []);

  const [hideFirstMessage, setHideFirstMessage] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionDefinition | null>(
    null,
  );
  const [lastInferenceRequest, setLastInferenceRequest] =
    useState<LastInferenceRequest | null>(null);

  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Hydrate conversation from local storage on mount
  useEffect(() => {
    chrome.storage.local.get(["promptly_active_conversation", "promptly_last_inference_request"]).then((result) => {
      // Only hydrate if we are not being forced to trigger an initial action
      if (!initialActionId && result.promptly_active_conversation && (result.promptly_active_conversation as Message[]).length > 0) {
        setMessages(result.promptly_active_conversation as Message[]);
        setHideFirstMessage(true); // Hide system prompts from history
        if (result.promptly_last_inference_request) {
          setLastInferenceRequest(result.promptly_last_inference_request as LastInferenceRequest);
        }
      }
    });
  }, [initialActionId]);

  // Persist conversation whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      const MAX_HISTORY = 50;
      let truncatedMessages = messages;
      if (messages.length > MAX_HISTORY + 1) {
        const systemMessage = messages[0];
        let recentMessages = messages.slice(-MAX_HISTORY);
        if (recentMessages.length > 0 && recentMessages[0].role === "assistant") {
          recentMessages = recentMessages.slice(1);
        }
        truncatedMessages = [systemMessage, ...recentMessages];
      }

      chrome.storage.local.set({ 
        promptly_active_conversation: truncatedMessages,
        promptly_last_inference_request: lastInferenceRequest
      });
    }
  }, [messages, lastInferenceRequest]);


  const {
    position: currentPosition,
    elementRef,
    isDragging,
  } = useDraggable({
    handleRef: dragHandleRef,
  });

  const handleInferenceUpdate = (chunk: string) => {
    logger.debug("Inference update:", chunk);

    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      if (lastMessage?.role === "assistant") {
        return [
          ...prevMessages.slice(0, -1),
          { ...lastMessage, content: lastMessage.content + chunk },
        ];
      }
      return prevMessages;
    });
  };

  const { inferenceState, runInference, cancelInference, stopInference } =
    useInference({
      onUpdate: handleInferenceUpdate,
    });

  useEffect(() => {
    const context = get_page_context();
    setPageContext(context);
  }, [selectionData]);



  let actions: ActionDefinition[] = [];

  if (pageContext && selectionData) {
    const predefinedActions = get_applicable_actions({
      contextTypes: selectionData.contextTypes,
      dataTypes: selectionData.dataTypes,
      pageCategory: pageContext.category,
    });
    actions = [...predefinedActions, ...customActions];
  }

  const handleActionSelect = async (action: ActionDefinition) => {
    setActiveAction(action);
    setHideFirstMessage(true);

    const contextString = `Consider the following context when formulating your response:
                          --- CONTEXT ---
                            Page URL: ${selectionData.pageUrl}
                            Page Title: ${selectionData.pageTitle || "N/A"}
                            Selection Types: ${selectionData.contextTypes.join(", ")}
                          --- END CONTEXT ---`;

    let customInstructions = "";
    let memoryInstructions = "";
    try {
      const settings = await get_settings();
      if (settings.customInstructions) {
        customInstructions = `\n\n--- GLOBAL CUSTOM INSTRUCTIONS ---\n${settings.customInstructions}`;
      }
      if (settings.persistentMemories && settings.persistentMemories.length > 0) {
        const facts = settings.persistentMemories.map((m: any) => `- ${m.fact}`).join("\n");
        memoryInstructions = `\n\n--- USER PERSISTENT MEMORY ---\nThe user has explicitly asked you to remember the following facts about them. You must strictly adhere to these facts in your response:\n${facts}`;
      }
    } catch (e) {
      logger.warn("Could not fetch settings for custom instructions", e);
    }

    // Combine the action's system prompt with the context and custom instructions
    const systemContent = `${action.systemPrompt}${customInstructions}${memoryInstructions}\n\n${contextString}`;

    const initialMessages: Message[] = [
      { role: "system", content: systemContent }, // Use the enhanced system content
      { role: "user", content: selectionData.llmFormattedText },
      { role: "assistant", content: "" },
    ];

    setMessages(initialMessages);

    if (pageContext) {
      const request = {
        messages: initialMessages.slice(0, -1),
        parameters: action.llmParams,
      };
      setLastInferenceRequest(request);
      runInference(request);
    }
  };

  const handleSendFollowUp = async (message: string, includeContext?: boolean, performWebSearch?: boolean, imageUri?: string) => {
    let finalMessageContent = message;


    if (includeContext) {
      // 1. Existing Page Context
      const pageText = document.body.innerText.substring(0, 15000);
      finalMessageContent = `--- PAGE CONTEXT (First 15,000 chars) ---\n${pageText}\n--- END PAGE CONTEXT ---\n\nUser: ${message}`;
      
      // 2. Workspace Knowledge Base RAG
      try {
        // Multi-turn context: we use the user's message as the primary semantic driver.
        // We append the last user message if the current is too short to provide context,
        // but avoid appending the assistant's response to prevent bias.
        const searchQuery = message.length > 20 ? message : `${messages.filter(m => m.role === 'user').pop()?.content || ''} ${message}`.trim();

        const searchResponse = await chrome.runtime.sendMessage({
          type: "perform_knowledge_search",
          payload: { text: searchQuery }
        });
        
        if (searchResponse && searchResponse.chunks && searchResponse.chunks.length > 0) {
          const kbContext = searchResponse.chunks.join("\n\n");
          finalMessageContent = `--- KNOWLEDGE BASE RESULTS ---\n${kbContext}\n--- END KNOWLEDGE BASE RESULTS ---\n\n${finalMessageContent}`;
        }
      } catch (err) {
        logger.warn("Knowledge Base Search Error", err);
      }
    }

    if (performWebSearch) {
      try {
        const response = await chrome.runtime.sendMessage({
          type: "PERFORM_WEB_SEARCH",
          payload: { query: message }
        });
        if (response && response.results) {
          finalMessageContent = `--- REAL-TIME WEB SEARCH RESULTS ---\n${response.results}\n--- END WEB SEARCH RESULTS ---\n\n${finalMessageContent}`;
        }
      } catch (e) {
        logger.warn("Web search error in PromptOverlay", e);
      }
    }

    const contentArray: any[] = [];
    if (imageUri) {
      contentArray.push({ type: "image_url", image_url: { url: imageUri } });
    }
    contentArray.push({ type: "text", text: finalMessageContent });

    const userMessage: Message = { 
      role: "user", 
      content: imageUri ? contentArray : finalMessageContent 
    };

    const newMessages: Message[] = [...messages];

    if (messages.length === 0) {
      const firstContentArray: any[] = [];
      if (imageUri) {
        firstContentArray.push({ type: "image_url", image_url: { url: imageUri } });
      }
      firstContentArray.push({ type: "text", text: `${selectionData.llmFormattedText}\n\n${finalMessageContent}` });

      newMessages.push(
        {
          role: "user",
          content: imageUri ? firstContentArray : `${selectionData.llmFormattedText}\n\n${finalMessageContent}`,
        },
        { role: "assistant", content: "" },
      );
    } else {
      newMessages.push(userMessage, { role: "assistant", content: "" });
    }

    setMessages(newMessages);

    const request = {
      messages: newMessages.slice(0, -1),
    };
    setLastInferenceRequest(request);
    runInference(request);
  };

  const handleStop = () => {
    stopInference();
  };

  const handleCancelInference = () => {
    cancelInference();

    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];

      if (
        lastMessage?.role === "assistant" &&
        (typeof lastMessage.content === "string" ? lastMessage.content : "").trim().length === 0
      ) {
        return prevMessages.slice(0, -1);
      }

      return prevMessages;
    });
  };

  const handleClose = () => {
    if (
      inferenceState.status === "streaming" ||
      inferenceState.status === "loading"
    ) {
      cancelInference();
    }
    setMessages([]);
    onClose();
  };

  const handleRetryLatest = () => {
    if (!lastInferenceRequest) {
      return;
    }

    if (isLoading) {
      cancelInference();
    }

    setMessages([
      ...lastInferenceRequest.messages,
      { role: "assistant", content: "" },
    ]);
    runInference(lastInferenceRequest);
  };

    const handleClearConversation = () => {
    if (isLoading) {
      cancelInference();
    }
    setMessages([]);
    setHideFirstMessage(false);
    setActiveAction(null);
    setLastInferenceRequest(null);
    chrome.storage.local.remove(["promptly_active_conversation", "promptly_last_inference_request"]);
  };

  const isLoading =
    inferenceState.status === "loading" ||
    inferenceState.status === "streaming";
  const clampedPosition = clampOverlayPosition(
    currentPosition ?? position,
    elementRef.current,
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inferenceState.status]);

  
  // Trigger initial action if provided
  useEffect(() => {
    if (initialActionId && actions.length > 0 && !activeAction && !messages.length) {
      const actionToTrigger = actions.find((a) => {return a.id === initialActionId}) || actions[0];
      if (actionToTrigger) {
        handleActionSelect(actionToTrigger);
      }
    }
  }, [initialActionId, actions, activeAction, messages.length]);

  return (
    <div
      ref={elementRef}
      className={styles.overlayContainer}
      style={{
        left: clampedPosition.x,
        top: clampedPosition.y,
        position: "absolute",
        userSelect: isDragging ? "none" : "auto",
      }}
    >
      <Box p="md" elevation="3">
        <Flex direction="column" gap="md">
          <Flex
            ref={dragHandleRef}
            align="start"
            justify="between"
            gap="sm"
            className={styles.overlayHeader}
          >
            <Text
              as="blockquote"
              size="xs"
              color="muted"
              className={styles.selectionPreview}
            >
              &quot;{selectionData.text.substring(0, 100)}
              {selectionData.text.length > 100 ? "..." : ""}&quot;
            </Text>
            <Button
              className={styles.closeButton}
              color="tertiary"
              size="sm"
              onClick={handleClose}
              aria-label="Close Promptly overlay"
            >
              <PiXCircleBold />
            </Button>
          </Flex>

          <ResponseDisplay
            messages={messages}
            hideFirstMessage={hideFirstMessage}
            isLoading={isLoading}
            isStalled={inferenceState.isStalled}
            error={inferenceState.error}
            onSendFollowUp={handleSendFollowUp}
            onStop={handleStop}
            onCancel={handleCancelInference}
            onRetryLatest={handleRetryLatest}
            onClearConversation={handleClearConversation}
            canRetry={Boolean(lastInferenceRequest)}
            usage={inferenceState.usage}
            startedAt={inferenceState.startedAt}
            completedAt={inferenceState.status === 'complete' ? inferenceState.lastActivityAt : undefined}
          />

          <Flex wrap="wrap" gap="sm">
            {actions.map((action) => {
              return (
                <Button
                  key={action.id}
                  onClick={() => {
                    return handleActionSelect(action);
                  }}
                  active={activeAction?.id === action.id}
                  style={{ width: "calc(50% - 4px)" }}
                >
                  <Flex align="center" gap="sm">
                    <action.icon className={styles.actionIcon} />
                    {action.name}
                  </Flex>
                </Button>
              );
            })}

            {actions.length === 0 && !pageContext && (
              <Text>Loading context...</Text>
            )}

            {actions.length === 0 && pageContext && (
              <Text>No actions available for this selection/page.</Text>
            )}
          </Flex>
        </Flex>
      </Box>
    </div>
  );
};

import { useState, useEffect, FC, useRef } from "react";

import {
  Message,
  type InferenceParameters,
} from "$/modules/inference/models/inference_model";
import { Box } from "@/src/components/Box/Box";
import { Button } from "@/src/components/Button/Button";
import { Flex } from "@/src/components/Flex/Flex";
import { Text } from "@/src/components/Text/Text";
import { ActionDefinition } from "@/src/modules/actions/models/action_models";
import { get_applicable_actions } from "@/src/modules/actions/use_cases/get_applicable_actions";
import { PageCategory } from "@/src/modules/context/models/context";
import { get_page_context } from "@/src/modules/context/use_cases/get_page_context";
import { SelectionData } from "@/src/modules/selection/models/selection";
import { useDraggable } from "$/modules/selection/presentations/hooks/useDraggable";

import { ResponseDisplay } from "../../components/ResponseDisplay/ResponseDisplay";
import { useInference } from "../../hooks/useInference";

import styles from "./PromptOverlay.module.css";
import { logger } from "$/utils/logger";
import { PiXCircleBold } from "react-icons/pi";

export type PromptlyOverlayProps = {
  selectionData: SelectionData;
  position: { x: number; y: number };
  onClose: () => void;
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
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pageContext, setPageContext] = useState<{ category: PageCategory }>();
  const [hideFirstMessage, setHideFirstMessage] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionDefinition | null>(
    null,
  );
  const [lastInferenceRequest, setLastInferenceRequest] =
    useState<LastInferenceRequest | null>(null);

  const dragHandleRef = useRef<HTMLDivElement>(null);

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
    actions = get_applicable_actions({
      contextTypes: selectionData.contextTypes,
      dataTypes: selectionData.dataTypes,
      pageCategory: pageContext.category,
    });
  }

  const handleActionSelect = (action: ActionDefinition) => {
    setActiveAction(action);
    setHideFirstMessage(true);

    const contextString = `Consider the following context when formulating your response:
                          --- CONTEXT ---
                            Page URL: ${selectionData.pageUrl}
                            Page Title: ${selectionData.pageTitle || "N/A"}
                            Selection Types: ${selectionData.contextTypes.join(", ")}
                          --- END CONTEXT ---`;

    // Combine the action's system prompt with the context
    const systemContent = `${action.systemPrompt}\n\n${contextString}`;

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

  const handleSendFollowUp = (message: string) => {
    const userMessage: Message = { role: "user", content: message };

    const newMessages: Message[] = [...messages];

    if (messages.length === 0) {
      newMessages.push(
        {
          role: "user",
          content: `${selectionData.llmFormattedText}\n\n${message}`,
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
    if (!lastInferenceRequest || isLoading) {
      return;
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
            error={inferenceState.error}
            onSendFollowUp={handleSendFollowUp}
            onStop={handleStop}
            onRetryLatest={handleRetryLatest}
            onClearConversation={handleClearConversation}
            canRetry={Boolean(lastInferenceRequest)}
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

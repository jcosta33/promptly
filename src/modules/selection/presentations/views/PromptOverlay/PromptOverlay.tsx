import { useState, useEffect, FC, useRef } from "react";

import { Message } from "$/modules/inference/models/inference_model";
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
import { PiSkipBackBold, PiXCircleBold } from "react-icons/pi";

export type PromptlyOverlayProps = {
  selectionData: SelectionData;
  position: { x: number; y: number };
  onClose: () => void;
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
      runInference({
        messages: initialMessages.slice(0, -1),
        parameters: action.llmParams,
      });
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
        { role: "assistant", content: "" }
      );
    } else {
      newMessages.push(userMessage, { role: "assistant", content: "" });
    }

    setMessages(newMessages);

    runInference({
      messages: newMessages.slice(0, -1),
    });
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

  const isLoading =
    inferenceState.status === "loading" ||
    inferenceState.status === "streaming";

  return (
    <div
      ref={elementRef}
      className={styles.overlayContainer}
      style={{
        left: currentPosition?.x || position.x,
        top: currentPosition?.y || position.y,
        position: "absolute",
        userSelect: isDragging ? "none" : "auto",
      }}
    >
      <Box p="md" bg="secondary" elevation="2">
        <Flex direction="column" gap="md">
          <Flex ref={dragHandleRef} justify="between">
            {messages.length > 0 && (
              <Button
                size="sm"
                onClick={() => {
                  cancelInference();
                  setMessages([]);
                }}
                aria-label="Back"
              >
                <PiSkipBackBold />
              </Button>
            )}

            <Text as="h2" weight="bold" size="xl">
              Promptly
            </Text>

            <button
              onClick={handleClose}
              aria-label="Close"
              className={styles.closeButton}
            >
              <PiXCircleBold />
            </button>
          </Flex>

          <Text as="blockquote" size="xs" color="muted">
            &quot;{selectionData.text.substring(0, 100)}
            {selectionData.text.length > 100 ? "..." : ""}&quot;
          </Text>

          {messages.length === 0 && (
            <Flex wrap="wrap" gap="sm">
              {actions.map((action) => {
                return (
                  <Button
                    key={action.id}
                    onClick={() => {
                      return handleActionSelect(action);
                    }}
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
          )}

          <ResponseDisplay
            messages={messages}
            isLoading={isLoading}
            error={inferenceState.error}
            onSendFollowUp={handleSendFollowUp}
            onStop={handleStop}
          />
        </Flex>
      </Box>
    </div>
  );
};

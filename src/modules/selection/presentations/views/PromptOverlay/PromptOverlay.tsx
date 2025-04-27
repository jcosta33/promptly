import React, { useState, useEffect, FC } from "react";

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

import { ResponseDisplay } from "../../components/ResponseDisplay/ResponseDisplay";
import { useInference } from "../../hooks/useInference";

import styles from "./PromptOverlay.module.css";

// Convert PromptlyOverlayProps interface to type alias
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
  const [selectedAction, setSelectedAction] = useState<ActionDefinition | null>(
    null
  );
  const [pageContext, setPageContext] = useState<{ category: PageCategory }>();

  // --- Inference Hook & Callbacks ---
  const handleInferenceUpdate = (chunk: string) => {
    // console.log("Inference update:", chunk);
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      if (lastMessage?.role === "assistant") {
        return [
          ...prevMessages.slice(0, -1),
          { ...lastMessage, content: lastMessage.content + chunk },
        ];
      }
      return prevMessages; // Should not happen if placeholder is added correctly
    });
  };

  const { inferenceState, runInference, resetInference, cancelInference } =
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
      selectionTypes: selectionData.types,
      pageCategory: pageContext.category,
    });
  }

  const handleActionSelect = (action: ActionDefinition) => {
    setSelectedAction(action);

    // Construct the context string for the LLM, instructing it to use the context
    const contextString = `Consider the following context when formulating your response:
--- CONTEXT ---
Page URL: ${selectionData.pageUrl}
Page Title: ${selectionData.pageTitle || "N/A"}
Selection Types: ${selectionData.types.join(", ")}
--- END CONTEXT ---`;

    // Combine the action's system prompt with the context
    const systemContent = `${action.systemPrompt}

${contextString}`;

    const initialMessages: Message[] = [
      { role: "system", content: systemContent }, // Use the enhanced system content
      { role: "user", content: selectionData.llmFormattedText },
      { role: "assistant", content: "" }, // Placeholder for streaming
    ];

    setMessages(initialMessages);

    if (pageContext) {
      runInference({
        messages: initialMessages.slice(0, -1),
        parameters: action.llmParams,
      });
    }
  };

  // Defined sendFollowUp function
  const sendFollowUp = (followUpText: string) => {
    if (!selectedAction) {
      return;
    } // Should have an action selected for follow-ups

    const userMessage: Message = { role: "user", content: followUpText };
    const assistantPlaceholder: Message = { role: "assistant", content: "" };

    // Append user message and placeholder
    const newMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(newMessages);

    // Run inference with the updated history (excluding placeholder)
    runInference({
      messages: newMessages.slice(0, -1),
      parameters: selectedAction.llmParams, // Reuse params from original action
    });
  };

  // Wrapper passed to ResponseDisplay
  const handleSendFollowUp = (message: string) => {
    sendFollowUp(message);
  };

  const handleClose = () => {
    if (
      inferenceState.status === "streaming" ||
      inferenceState.status === "loading"
    ) {
      cancelInference();
    }
    resetInference(); // Reset hook state
    setMessages([]); // Clear local messages
    setSelectedAction(null);
    onClose(); // Call parent handler
  };

  const isLoading =
    inferenceState.status === "loading" ||
    inferenceState.status === "streaming";

  return (
    <div
      className={styles.overlayContainer}
      style={{ left: position.x, top: position.y }}
    >
      <Box p="md" bg="secondary" elevation="2">
        <Flex direction="column" gap="md">
          <Flex justify="between" align="center">
            <Text as="h2" weight="bold" size="xl">
              Promptly
            </Text>
            <Button size="sm" onClick={handleClose} aria-label="Close">
              ✕
            </Button>
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
                    size="sm"
                    disabled={inferenceState.status === "loading"} // Disable during initial action loading maybe?
                  >
                    {action.emoji}
                    {action.name}
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

          {/* Response area - Show when messages exist */}
          {messages.length > 0 && (
            <ResponseDisplay
              messages={messages}
              isLoading={isLoading}
              error={inferenceState.error}
              onSendFollowUp={handleSendFollowUp}
            />
          )}
        </Flex>
      </Box>
    </div>
  );
};

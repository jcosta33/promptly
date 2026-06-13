import { useState, useRef, useEffect, KeyboardEvent, FC } from "react";
import {
  PiCheckBold,
  PiArrowCounterClockwiseBold,
  PiCopyBold,
  PiPlayBold,
  PiPlayPauseBold,
  PiTrashBold,
  PiWarningBold,
  PiXCircleBold,
} from "react-icons/pi";

import { Box } from "$/components/Box/Box";
import { Button } from "$/components/Button/Button";
import { Flex } from "$/components/Flex/Flex";
import { Input } from "$/components/Input/Input";
import { Markdown } from "$/components/Markdown/Markdown";
import { Message } from "$/modules/inference/models/inference_model";

import styles from "./ResponseDisplay.module.css";

export type ResponseDisplayProps = {
  messages: Message[];
  hideFirstMessage: boolean;
  isLoading: boolean;
  isStalled: boolean;
  error?: string;
  onSendFollowUp: (message: string) => void;
  onStop: () => void;
  onCancel: () => void;
  onRetryLatest: () => void;
  onClearConversation: () => void;
  canRetry: boolean;
};

type CopyStatus = "idle" | "copied" | "error";

/**
 * Component to display chat messages and allow follow-up interactions
 */
export const ResponseDisplay: FC<ResponseDisplayProps> = ({
  messages,
  hideFirstMessage,
  isLoading,
  isStalled,
  error,
  onSendFollowUp,
  onStop,
  onCancel,
  onRetryLatest,
  onClearConversation,
  canRetry,
}) => {
  const [followUpText, setFollowUpText] = useState("");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestAssistantMessage = messages.toReversed().find((message) => {
    return message.role === "assistant" && message.content.trim().length > 0;
  });
  const canCopyLatestResponse = Boolean(latestAssistantMessage);

  useEffect(() => {
    setCopyStatus("idle");
  }, [latestAssistantMessage?.content]);

  useEffect(() => {
    if (copyStatus === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyStatus("idle");
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyStatus]);

  const handleSubmit = () => {
    if (followUpText.trim() && !isLoading) {
      onSendFollowUp(followUpText);
      setFollowUpText("");
    }
  };

  const handleStop = () => {
    onStop();
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleCopyLatestResponse = async () => {
    if (!latestAssistantMessage) {
      return;
    }

    if (!navigator.clipboard?.writeText) {
      setCopyStatus("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(latestAssistantMessage.content);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && event.ctrlKey) {
      event.preventDefault();
      handleSubmit();
    } else if (event.key === "Enter" && !event.shiftKey && !isLoading) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {messages.length > 0 ? (
        <>
          <Flex
            direction="row"
            align="center"
            justify="end"
            gap="xs"
            className={styles.responseActions}
          >
            {copyStatus !== "idle" && latestAssistantMessage ? (
              <span className={styles.copyStatus} role="status">
                {copyStatus === "copied" ? "Copied" : "Copy failed"}
              </span>
            ) : null}
            <Button
              color="tertiary"
              size="sm"
              onClick={onRetryLatest}
              disabled={(isLoading && !isStalled) || !canRetry}
              aria-label="Retry latest response"
              title="Retry latest response"
            >
              <PiArrowCounterClockwiseBold />
            </Button>
            <Button
              color="tertiary"
              size="sm"
              onClick={onClearConversation}
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <PiTrashBold />
            </Button>
            {canCopyLatestResponse ? (
              <Button
                color={copyStatus === "error" ? "danger" : "tertiary"}
                size="sm"
                onClick={handleCopyLatestResponse}
                aria-label="Copy latest response"
              >
                {copyStatus === "copied" ? (
                  <PiCheckBold />
                ) : copyStatus === "error" ? (
                  <PiWarningBold />
                ) : (
                  <PiCopyBold />
                )}
              </Button>
            ) : null}
          </Flex>

          {isStalled ? (
            <Box className={styles.stalledContainer} elevation="0">
              <div
                className={styles.stalledMessage}
                role="status"
                aria-live="polite"
              >
                <PiWarningBold className={styles.stalledIcon} />
                <span>
                  Response activity has paused. You can keep waiting, retry, or
                  cancel.
                </span>
              </div>
              <Flex
                direction="row"
                align="center"
                gap="xs"
                wrap="wrap"
                className={styles.stalledActions}
              >
                <Button
                  className={styles.stalledActionButton}
                  color="tertiary"
                  size="sm"
                  onClick={onRetryLatest}
                  disabled={!canRetry}
                  aria-label="Retry stalled response"
                >
                  <PiArrowCounterClockwiseBold />
                  <span>Retry</span>
                </Button>
                <Button
                  className={styles.stalledActionButton}
                  color="danger"
                  size="sm"
                  onClick={handleCancel}
                  aria-label="Cancel stalled response"
                >
                  <PiXCircleBold />
                  <span>Cancel</span>
                </Button>
                {canCopyLatestResponse ? (
                  <Button
                    className={styles.stalledActionButton}
                    color={copyStatus === "error" ? "danger" : "tertiary"}
                    size="sm"
                    onClick={handleCopyLatestResponse}
                    aria-label="Copy partial response"
                  >
                    {copyStatus === "copied" ? (
                      <PiCheckBold />
                    ) : copyStatus === "error" ? (
                      <PiWarningBold />
                    ) : (
                      <PiCopyBold />
                    )}
                    <span>
                      {copyStatus === "copied"
                        ? "Copied"
                        : copyStatus === "error"
                          ? "Failed"
                          : "Copy"}
                    </span>
                  </Button>
                ) : null}
              </Flex>
            </Box>
          ) : null}

          <Box
            className={styles.responseContainer}
            elevation="0"
            bg="secondary"
          >
            {messages
              .filter((msg, index) => {
                return (
                  (!hideFirstMessage || index !== 1) && msg.role !== "system"
                );
              })
              .toReversed()
              .map((msg, index) => {
                return msg.role !== "system" ? (
                  msg.role === "user" ? (
                    <Box
                      key={index}
                      className={styles.message}
                      elevation="0"
                      data-role={msg.role}
                    >
                      {msg.content}
                    </Box>
                  ) : msg.content ? (
                    <Markdown className={styles.message}>
                      {msg.content}
                    </Markdown>
                  ) : (
                    <span className={styles.thinking}>Thinking...</span>
                  )
                ) : null;
              })}

            {error && (
              <Box className={styles.errorContainer}>
                <div className={styles.errorIcon}>!</div>
                <div className={styles.errorMessage}>{error}</div>
                <Button
                  color="tertiary"
                  size="sm"
                  onClick={onRetryLatest}
                  disabled={isLoading || !canRetry}
                  aria-label="Retry after error"
                >
                  <PiArrowCounterClockwiseBold />
                </Button>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>
        </>
      ) : null}

      <Flex direction="row" gap="xs" className={styles.followUpContainer}>
        <Input
          placeholder="Ask a question..."
          value={followUpText}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            return setFollowUpText(e.target.value);
          }}
          disabled={isLoading}
        />
        {isLoading ? (
          <Button
            color="primary"
            onClick={handleStop}
            aria-label="Stop response"
          >
            <PiPlayPauseBold />
          </Button>
        ) : (
          <Button
            color="primary"
            onClick={handleSubmit}
            disabled={!followUpText.trim()}
            aria-label="Send message"
          >
            <PiPlayBold />
          </Button>
        )}
      </Flex>
    </>
  );
};

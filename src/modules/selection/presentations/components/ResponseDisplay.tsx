import { useState, useRef, KeyboardEvent, FC } from "react";

import { Box } from "$/components/Box/Box";
import { Button } from "$/components/Button/Button";
import { Flex } from "$/components/Flex/Flex";
import { Input } from "$/components/Input/Input";
import { Markdown } from "$/components/Markdown/Markdown";
import { Message } from "$/modules/inference/models/inference_model";

import styles from "./ResponseDisplay.module.css";

export type ResponseDisplayProps = {
  messages: Message[];
  isLoading: boolean;
  error?: string;
  onSendFollowUp: (message: string) => void;
};

/**
 * Component to display chat messages and allow follow-up interactions
 */
export const ResponseDisplay: FC<ResponseDisplayProps> = ({
  messages,
  isLoading,
  error,
  onSendFollowUp,
}) => {
  const [followUpText, setFollowUpText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (followUpText.trim() && !isLoading) {
      onSendFollowUp(followUpText);
      setFollowUpText("");
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
      <Box className={styles.responseContainer} elevation="1" bg="secondary">
        {messages.map((msg, index) => {
          return (
            msg.role !== "system" &&
            index !== 1 && (
              <Box key={index} className={styles.message} data-role={msg.role}>
                <Markdown>{String(msg.content || "Thinking...")}</Markdown>
              </Box>
            )
          );
        })}

        {isLoading && (
          <Flex
            className={`${styles.message} ${styles.loadingContainer}`}
            data-role="assistant"
            justify="center"
            align="center"
          >
            <div className={styles.loadingSpinner} />
          </Flex>
        )}

        {error && (
          <Box className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <div className={styles.errorMessage}>{error}</div>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Flex direction="row" gap="xs" className={styles.followUpContainer}>
        <Input
          placeholder="Ask a follow-up question... (Ctrl+Enter for newline)"
          value={followUpText}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            return setFollowUpText(e.target.value);
          }}
          disabled={isLoading}
        />
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={isLoading || !followUpText.trim()}
          aria-label="Send follow-up message"
        >
          Send
        </Button>
      </Flex>
    </>
  );
};

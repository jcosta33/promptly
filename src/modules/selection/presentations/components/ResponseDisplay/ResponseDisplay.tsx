import { useState, useRef, KeyboardEvent, FC } from "react";

import { Box } from "$/components/Box/Box";
import { Button } from "$/components/Button/Button";
import { Flex } from "$/components/Flex/Flex";
import { Input } from "$/components/Input/Input";
import { Markdown } from "$/components/Markdown/Markdown";
import { Message } from "$/modules/inference/models/inference_model";
import { PiPlayBold, PiPlayPauseBold } from "react-icons/pi";

import styles from "./ResponseDisplay.module.css";

export type ResponseDisplayProps = {
  messages: Message[];
  isLoading: boolean;
  error?: string;
  onSendFollowUp: (message: string) => void;
  onStop: () => void;
};

/**
 * Component to display chat messages and allow follow-up interactions
 */
export const ResponseDisplay: FC<ResponseDisplayProps> = ({
  messages,
  isLoading,
  error,
  onSendFollowUp,
  onStop,
}) => {
  const [followUpText, setFollowUpText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (followUpText.trim() && !isLoading) {
      onSendFollowUp(followUpText);
      setFollowUpText("");
    }
  };

  const handleStop = () => {
    onStop();
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
        <Box className={styles.responseContainer} elevation="1" bg="secondary">
          {messages.toReversed().map((msg, index) => {
            return msg.role !== "system" ? (
              msg.role === "user" ? (
                <Box
                  key={index}
                  className={styles.message}
                  data-role={msg.role}
                >
                  {String(msg.content || "Thinking...")}
                </Box>
              ) : (
                <Box
                  key={index}
                  className={styles.message}
                  data-role={msg.role}
                >
                  <Markdown>{String(msg.content || "Thinking...")}</Markdown>
                </Box>
              )
            ) : null;
          })}

          {error && (
            <Box className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <div className={styles.errorMessage}>{error}</div>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>
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

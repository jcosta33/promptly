import { useState, useRef, useEffect, KeyboardEvent, FC } from "react";
import {
  PiCheckBold,
  PiArrowCounterClockwiseBold,
  PiDownloadBold,
  PiCopyBold,
  PiPlayBold,
  PiPlayPauseBold,
  PiTrashBold,
  PiWarningBold,
  PiXCircleBold,
  PiSpeakerHighBold,
  PiSpeakerSlashBold,
  PiMicrophoneBold,
  PiMicrophoneSlashBold,
} from "react-icons/pi";

import { Box } from "$/components/Box/Box";
import { Button } from "$/components/Button/Button";
import { Flex } from "$/components/Flex/Flex";
import { Input } from "$/components/Input/Input";
import { Markdown } from "$/components/Markdown/Markdown";
import { Text } from "$/components/Text/Text";
import { Message } from "$/modules/inference/models/inference_model";

import styles from "./ResponseDisplay.module.css";

export type ResponseDisplayProps = {
  messages: Message[];
  hideFirstMessage: boolean;
  isLoading: boolean;
  isStalled: boolean;
  error?: string;
  onSendFollowUp: (message: string, includeContext: boolean) => void;
  onStop: () => void;
  onCancel: () => void;
  onRetryLatest: () => void;
  onClearConversation: () => void;
  canRetry: boolean;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number; };
  startedAt?: number;
  completedAt?: number;
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
  usage,
  startedAt,
  completedAt,
}) => {
  const [followUpText, setFollowUpText] = useState("");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [includeContext, setIncludeContext] = useState(false);
  const recognitionRef = useRef<any>(null);
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
      onSendFollowUp(followUpText, includeContext);
      setFollowUpText("");
    }
  };

  const handleStop = () => {
    onStop();
  };

  const handleCancel = () => {
    onCancel();
  };

  
  const handleDownload = () => {
    try {
      const chatText = messages
        .map((m) => {return `**${m.role === "user" ? "You" : "Promptly"}**:\n\n${m.content}`})
        .join("\n\n---\n\n");
      chrome.runtime.sendMessage({ type: "DOWNLOAD_MARKDOWN", payload: { text: chatText } });
    } catch (e) {
      console.error("Failed to trigger download:", e);
    }
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

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (!latestAssistantMessage) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Basic markdown removal for speech
      const textToSpeak = latestAssistantMessage.content.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => {return setIsSpeaking(false)};
      utterance.onerror = () => {return setIsSpeaking(false)};
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Setup Speech Recognition
  useEffect(() => {
    // @ts-ignore - Vendor prefixes
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setFollowUpText((prev) => {return prev + (prev ? " " : "") + finalTranscript});
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed") {
          alert("Microphone access blocked by the current website.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setFollowUpText(""); // Clear before dictating, or leave it. Let's just append.
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };




  const stabilizeMarkdown = (content: string, isLatest: boolean) => {
    if (!isLoading || !isLatest || !content) return content;
    const codeBlockCount = (content.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      return content + "\n```";
    }
    return content;
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
              onClick={handleDownload}
              aria-label="Download conversation"
              title="Download conversation"
              disabled={messages.length === 0}
            >
              <PiDownloadBold />
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
                color={isSpeaking ? "primary" : "tertiary"}
                size="sm"
                onClick={handleToggleSpeech}
                title={isSpeaking ? "Stop speaking" : "Read aloud"}
                aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking ? <PiSpeakerSlashBold /> : <PiSpeakerHighBold />}
              </Button>
            ) : null}

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
                      {stabilizeMarkdown(msg.content, index === 0)}
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

        {usage && completedAt && startedAt && (
          <Text size="xs" color="muted" style={{ textAlign: "right", marginTop: "4px" }}>
            {usage.total_tokens} tokens • {((usage.completion_tokens || 0) / (Math.max(completedAt - startedAt, 1) / 1000)).toFixed(1)} tokens/sec
          </Text>
        )}

          </Box>
        </>
      ) : null}

      <Flex direction="row" gap="xs" className={styles.followUpContainer}>

        <Button
          color={isListening ? "danger" : "secondary"}
          onClick={handleToggleListening}
          aria-label={isListening ? "Stop dictation" : "Start dictation"}
          disabled={!recognitionRef.current || isLoading}
        >
          {isListening ? <PiMicrophoneSlashBold /> : <PiMicrophoneBold />}
        </Button>

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

      <Flex direction="row" gap="xs" align="center" style={{ marginTop: '4px', justifyContent: 'flex-end' }}>
        <input 
          type="checkbox" 
          id="include-context" 
          checked={includeContext} 
          onChange={(e) => setIncludeContext(e.target.checked)} 
        />
        <label htmlFor="include-context" style={{ cursor: "pointer", userSelect: "none" }}><Text size="xs" color="muted">
          Include Page Context
        </Text></label>
      </Flex>
    </>
  );
};

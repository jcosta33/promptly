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
  PiCameraBold,
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
  onSendFollowUp: (message: string, includeContext: boolean, performWebSearch: boolean, imageUri?: string) => void;
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
  const [performWebSearch, setPerformWebSearch] = useState(false);
  const [imageUri, setImageUri] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMessageString = (content: any): string => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n');
    }
    return "";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 512;
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        setImageUri(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestAssistantMessage = messages.toReversed().find((message) => {
    return message.role === "assistant" && getMessageString(message.content).trim().length > 0;
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
      onSendFollowUp(followUpText, includeContext, performWebSearch, imageUri);
      setFollowUpText("");
      setImageUri(undefined);
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
      await navigator.clipboard.writeText(getMessageString(latestAssistantMessage.content));
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
      const textToSpeak = getMessageString(latestAssistantMessage.content).replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => {return setIsSpeaking(false)};
      utterance.onerror = () => {return setIsSpeaking(false)};
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Setup Whisper WebGPU Web Audio API Recorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleToggleListening = async () => {
    if (isListening) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsListening(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          try {
            if (!audioContextRef.current) {
              audioContextRef.current = new AudioContext({ sampleRate: 16000 });
            }
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            const float32Array = audioBuffer.getChannelData(0);
            
            setFollowUpText((prev) => (prev ? prev + " [Transcribing...]" : "[Transcribing...]"));

            chrome.runtime.sendMessage(
              { 
                type: "transcribe_audio", 
                payload: { audioData: Array.from(float32Array) } 
              },
              (response) => {
                setFollowUpText((prev) => prev.replace(" [Transcribing...]", "").replace("[Transcribing...]", ""));
                if (response && response.text) {
                  setFollowUpText((prev) => (prev ? prev + " " + response.text.trim() : response.text.trim()));
                } else if (response && response.error) {
                  console.error("Transcription error:", response.error);
                }
              }
            );
          } catch (error) {
            console.error("Error processing audio:", error);
            setFollowUpText((prev) => prev.replace(" [Transcribing...]", "").replace("[Transcribing...]", ""));
          }
        };

        mediaRecorder.start();
        setIsListening(true);
      } catch (err) {
        console.error("Microphone access denied:", err);
      }
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
                      {getMessageString(msg.content)}
                    </Box>
                  ) : msg.content ? (
                    <Markdown className={styles.message}>
                      {stabilizeMarkdown(getMessageString(msg.content), index === 0)}
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

      
      {imageUri && (
        <Flex direction="row" gap="xs" align="center" style={{ marginBottom: '8px', padding: '4px', background: 'var(--promptly-bg-secondary)', borderRadius: '4px', width: 'fit-content' }}>
          <img src={imageUri} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
          <Button size="sm" color="tertiary" onClick={() => setImageUri(undefined)}><PiXCircleBold /></Button>
        </Flex>
      )}
      <Flex direction="row" gap="xs" className={styles.followUpContainer}>
        <input 
          type="checkbox" 
          id="perform-web-search" 
          checked={performWebSearch} 
          onChange={(e) => setPerformWebSearch(e.target.checked)} 
        />
        <label htmlFor="perform-web-search" style={{ cursor: "pointer", userSelect: "none", marginRight: '8px' }}>
          <Text size="xs" color="muted">Search Web</Text>
        </label>
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
        <Button color="secondary" onClick={() => fileInputRef.current?.click()} aria-label="Upload Image" disabled={isLoading} title="Upload Image"><PiCameraBold /></Button>


        <Button
          color={isListening ? "danger" : "secondary"}
          onClick={handleToggleListening}
          aria-label={isListening ? "Stop dictation" : "Start dictation"}
          disabled={isLoading}
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

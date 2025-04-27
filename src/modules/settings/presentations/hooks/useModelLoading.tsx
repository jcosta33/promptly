import { EventType } from "$/modules/messaging/models/event_types";
import { create_stream_connection } from "$/modules/messaging/use_cases/create_stream_connection";

export function useModelLoading() {
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to load a model
  const loadModel = async (modelId: string) => {
    if (!modelId) {
      setError("No model ID provided");
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setStatus("Preparing to load model...");
    setError(null);

    try {
      console.log("Starting model load for:", modelId);

      // Generate a random request ID for tracking
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log("Generated request ID:", requestId);

      // Create a persistent connection for the model loading process
      const connection = create_stream_connection({
        connectionName: "promptly-inference",
      });

      // Set up listeners for progress and errors
      connection.onMessage(EventType.MODEL_LOADING_PROGRESS, (payload) => {
        console.log("Received model loading progress:", payload);
        setProgress(payload.progress * 100);
        setStatus(payload.status || payload.text || "Loading model...");

        // If progress is 100%, mark as complete
        if (payload.progress >= 1) {
          setIsLoading(false);
          setError(null);
        }
      });

      // Send the load model request
      connection.send(EventType.MODEL_LOAD_REQUEST, {
        requestId,
        modelId,
        useStream: true,
      });

      console.log("Model load request sent via stream");

      // Set up a timeout to close the connection if no response
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setError("Model loading timed out");
          setIsLoading(false);
          connection.close();
        }
      }, 60000); // 1 minute timeout

      // Clean up timeout if component unmounts
      return () => {
        clearTimeout(timeoutId);
        connection.close();
      };
    } catch (err) {
      console.error("Error loading model:", err);
      setError(
        `Error loading model: ${err instanceof Error ? err.message : String(err)}`
      );
      setIsLoading(false);
    }
  };

  return {
    loadModel,
    progress,
    status,
    isLoading,
    error,
  };
}

import { MLCEngine } from "@mlc-ai/web-llm";
import {
    InferenceParameters,
    Message,
} from "../models/inference_model";


/**
 * Check if WebGPU is available
 */
export function is_webgpu_available(): boolean {
    return "gpu" in navigator;
}

/**
 * Arguments for generating text
 */
type GenerateTextArgs = {
    /**
     * The LLM engine
     */
    engine: MLCEngine;

    /**
     * Conversation messages
     */
    messages: Message[];

    /**
     * Inference parameters
     */
    parameters: InferenceParameters;

    /**
     * Callback for each token in streaming mode
     */
    onToken?: (token: string) => void;

    /**
     * Callback for completion
     */
    onComplete?: (text: string, usage?: any) => void;
}

/**
 * Generate text using the LLM engine
 */
export async function generate_text_stream(args: GenerateTextArgs): Promise<string> {
    const { engine, messages, parameters, onToken, onComplete } = args;

    try {
        let completeText = "";
        let usage = undefined;

        // Convert messages to the format expected by WebLLM
        const chatMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Create completion with the specified parameters
        const response = await engine.chat.completions.create({
            messages: chatMessages,
            temperature: parameters.temperature,
            top_p: parameters.top_p,
            presence_penalty: parameters.presence_penalty,
            frequency_penalty: parameters.frequency_penalty,
            stream: true,
            stream_options: { include_usage: true }
        });

        // Handle async iterator (streaming)
        for await (const chunk of response) {
            if (chunk.usage) {
                usage = chunk.usage;
            }

            const token = chunk.choices?.[0]?.delta?.content || "";
            if (token) {
                completeText += token;
                if (onToken) {
                    onToken(token);
                }
            }
        }

        // Call completion callback if provided
        if (onComplete) {
            onComplete(completeText, usage);
        }

        return completeText;
    } catch (error) {
        console.error("Error generating text:", error);
        throw error;
    }
}


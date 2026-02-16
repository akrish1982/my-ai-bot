import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Initialize standard OpenAI provider
const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize vLLM provider if configured
let vllm: ReturnType<typeof createOpenAI> | null = null;
if (process.env.VLLM_API_URL) {
    vllm = createOpenAI({
        baseURL: process.env.VLLM_API_URL,
        apiKey: process.env.VLLM_API_KEY || 'dummy',
    });
}

interface GatewayOptions {
    messages: any[]; // relaxed typing for now
    system?: string;
    temperature?: number;
    model?: string; // model ID for OpenAI fallback
}

export class ModelGateway {
    /**
     * Streams text using vLLM first, falling back to OpenAI.
     */
    static async streamText(options: GatewayOptions) {
        const { messages, system, temperature, model } = options;

        // 1. Try vLLM
        if (vllm) {
            try {
                const vllmModelId = process.env.VLLM_MODEL_NAME || 'meta-llama/Llama-2-7b-chat-hf';
                return await streamText({
                    model: vllm(vllmModelId),
                    messages,
                    system,
                    temperature,
                });
            } catch (error) {
                console.warn('vLLM Gateway failed, falling back to OpenAI:', error);
            }
        }

        // 2. Fallback to OpenAI
        const openaiModelId = model || 'gpt-4o-mini';
        return await streamText({
            model: openai(openaiModelId),
            messages,
            system,
            temperature,
        });
    }
}

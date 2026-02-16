import { createClient } from '@/lib/supabase/server'
import { OpenAI } from 'openai' // Keep for embeddings
import { NextResponse } from 'next/server'
import { ModelGateway } from '@/lib/model-gateway'

// Initialize OpenAI client for Embeddings
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(req: Request) {
    try {
        const { messages, botId } = await req.json()
        const lastMessage = messages[messages.length - 1]
        const userQuery = lastMessage.content

        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Fetch Bot Logic
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .select('system_prompt, tone, name')
            .eq('id', botId)
            .single()

        if (botError || !bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
        }

        // 2. Generate Embedding
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: userQuery,
        })
        const queryEmbedding = embeddingResponse.data[0].embedding

        // 3. RAG Retrieval
        const { data: chunks, error: matchError } = await supabase.rpc('match_knowledge_chunks', {
            query_embedding: JSON.stringify(queryEmbedding),
            query_text: userQuery,
            match_threshold: 0.5,
            match_count: 5,
            p_bot_id: botId
        })

        if (matchError) {
            // console.error('Vector search error:', matchError)
            // Proceed without context
        }

        // 4. Construct Context
        let contextText = ''
        if (chunks && chunks.length > 0) {
            const uniqueChunks = Array.from(new Set(chunks.map((c: any) => c.chunk_text)))
            contextText = `\n\nContext from knowledge base:\n${uniqueChunks.join('\n---\n')}`
        }

        const systemPrompt = `
    You are ${bot.name}.
    ${bot.system_prompt || ''}
    
    Use the following pieces of context to answer the user's question. 
    If you don't know the answer based on the context, check your internal knowledge but prioritize the context.
    Keep your answer concise and matching the requested tone.
    
    ${contextText}
    `

        // 5. Stream Response using AI SDK Core
        // Manual conversion to CoreMessage-like format
        const coreMessages = messages
            .filter((m: any) => m.role !== 'system')
            .map((m: any) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content
            }));

        const result = await ModelGateway.streamText({
            messages: coreMessages,
            system: systemPrompt,
            temperature: 0.7,
        })

        // Cast to any to bypass type check if needed
        return (result as any).toDataStreamResponse()

    } catch (error: any) {
        console.error('Chat API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

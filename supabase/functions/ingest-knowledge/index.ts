// Follows Supabase Edge Functions structure
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OpenAI } from 'https://esm.sh/openai@4.28.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple recursive character text splitter for MVP
// In production, use langchain/text-splitter
function splitText(text: string, chunkSize = 1000, overlap = 200): string[] {
    const chunks: string[] = []
    let startIndex = 0

    while (startIndex < text.length) {
        let endIndex = startIndex + chunkSize
        if (endIndex >= text.length) {
            chunks.push(text.slice(startIndex))
            break
        }

        // Try to break at a newline or space
        const lastNewline = text.lastIndexOf('\n', endIndex)
        const lastSpace = text.lastIndexOf(' ', endIndex)

        if (lastNewline > startIndex + overlap) {
            endIndex = lastNewline
        } else if (lastSpace > startIndex + overlap) {
            endIndex = lastSpace
        }

        chunks.push(text.slice(startIndex, endIndex).trim())
        startIndex = endIndex - overlap // Move back for overlap
    }

    return chunks.filter(c => c.length > 50) // Filter tiny chunks
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { record } = await req.json() // Expecting a database webhook payload or direct call
        // record should be a knowledge_source row

        if (!record || !record.content) {
            return new Response(JSON.stringify({ error: 'No record or content provided' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // Initialize clients
        // In Edge Runtime, process.env is Deno.env
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Must use service role to write chunks
        const openaiKey = Deno.env.get('OPENAI_API_KEY')

        if (!supabaseUrl || !supabaseKey || !openaiKey) {
            throw new Error('Missing environment variables')
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const openai = new OpenAI({ apiKey: openaiKey })

        console.log(`Processing source ${record.id} of type ${record.type}`)

        // 1. Fetch/Extract Text
        let textContent = ''
        if (record.type === 'url') {
            const response = await fetch(record.content)
            const html = await response.text()
            // Very basic HTML to text for MVP. In prod use cheerio/jsdom
            textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        } else if (record.type === 'text') {
            textContent = record.content
        } else {
            // File handling requires downloading from storage
            // Skip for MVP step 1
            textContent = "File processing not implemented yet"
        }

        // 2. Chunking
        const chunks = splitText(textContent)
        console.log(`Generated ${chunks.length} chunks`)

        // 3. Generate Embeddings & Store
        for (const chunk of chunks) {
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: chunk,
            })
            const embedding = embeddingResponse.data[0].embedding

            // 4. Insert into DB
            const { error } = await supabase.from('knowledge_chunks').insert({
                source_id: record.id,
                chunk_text: chunk,
                embedding, // pgvector handles arrays
                token_count: chunk.length / 4, // Rough estimate
                // search_vector is generated automatically by DB trigger/generated column
            })

            if (error) {
                console.error('Error inserting chunk:', error)
                throw error
            }
        }

        // 5. Update Source Status
        await supabase.from('knowledge_sources')
            .update({ status: 'completed' })
            .eq('id', record.id)

        return new Response(JSON.stringify({ success: true, chunks: chunks.length }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})

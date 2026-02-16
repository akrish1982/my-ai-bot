import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createBotSchema = z.object({
    name: z.string().min(1, "Name is required"),
    tagline: z.string().optional(),
    description: z.string().optional(),
    tone: z.object({
        friendly: z.number(),
        professional: z.number(),
        funny: z.number(),
    }),
    is_public: z.boolean().default(false),
    urls: z.array(z.string().url()).optional(),
    guardrails: z.object({
        topics: z.array(z.string()),
        ctas: z.array(z.string()),
    }).optional(),
})

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validation = createBotSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 })
        }

        const { name, tagline, description, tone, is_public, urls, guardrails } = validation.data

        // 1. Create Bot
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .insert({
                user_id: user.id,
                name,
                tagline,
                description,
                tone,
                is_public,
                system_prompt: `You are a helper bot. Description: ${description}. Tone: Friendly: ${tone.friendly}, Professional: ${tone.professional}, Funny: ${tone.funny}. Guardrails: Do not discuss: ${guardrails?.topics.join(', ')}. Always encourage: ${guardrails?.ctas.join(', ')}.`
            })
            .select()
            .single()

        if (botError) {
            console.error('Error creating bot:', botError)
            return NextResponse.json({ error: 'Failed to create bot' }, { status: 500 })
        }

        // 2. Add URLs as Knowledge Sources
        if (urls && urls.length > 0) {
            const sources = urls.map(url => ({
                bot_id: bot.id,
                type: 'url',
                content: url,
                status: 'pending'
            }))

            const { error: sourceError } = await supabase
                .from('knowledge_sources')
                .insert(sources)

            if (sourceError) {
                console.error('Error adding sources:', sourceError)
                // We don't fail the whole request, but we should log it
            }
        }

        // 3. Trigger Async Ingestion (for now just returning success, worker will pick up)
        // In a real implementation, we might call an Edge Function here to start processing immediately

        return NextResponse.json({ success: true, bot })

    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

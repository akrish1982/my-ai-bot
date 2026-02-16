import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ChatInterface from '@/components/public/chat-interface'
import styles from './page.module.css'

interface Props {
    params: Promise<{ username: string }>
}

// Generate metadata for social sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params
    // Handle URI encoding if needed, though Next.js usually decodes params
    const decodedUsername = decodeURIComponent(username)
    // Strip @ if present (e.g. /@john) or handle it as part of the username logic
    // Our logic: url is /%40john which decodes to @john.
    // We'll strip the @ for the database lookup if our usernames don't have @ 
    const cleanUsername = decodedUsername.startsWith('@') ? decodedUsername.slice(1) : decodedUsername

    return {
        title: `Chat with ${cleanUsername}'s Bot`,
        description: `Ask me anything about ${cleanUsername}'s expertise.`,
    }
}

export default async function PublicBotPage({ params }: Props) {
    const { username } = await params
    const decodedUsername = decodeURIComponent(username)
    const cleanUsername = decodedUsername.startsWith('@') ? decodedUsername.slice(1) : decodedUsername

    const supabase = await createClient()

    // 1. Find profile by username
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('username', cleanUsername)
        .single()

    if (profileError || !profile) {
        console.error('Profile not found:', cleanUsername)
        notFound()
    }

    // 2. Find PUBLIC bot for this user
    // For MVP, we assume the first public bot is the "main" one
    const { data: bot, error: botError } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_public', true)
        .limit(1)
        .single()

    if (botError || !bot) {
        // User exists but no public bot
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <h1>{profile.full_name} hasn&apos;t published a bot yet.</h1>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <div className={styles.header}>
                    <div className={styles.avatar}>
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name || 'User'} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>{(profile.full_name || 'U')[0]}</div>
                        )}
                    </div>
                    <div>
                        <h1 className={styles.botName}>{bot.name}</h1>
                        <p className={styles.tagline}>{bot.tagline}</p>
                        <div className={styles.byline}>
                            By {profile.full_name}
                            {/* Follow CTA placeholder */}
                            <button className={styles.followBtn}>Follow</button>
                        </div>
                    </div>
                </div>

                <ChatInterface
                    botId={bot.id}
                    initialMessage={bot.system_prompt ? "Hi! I'm ready to help." : "Hello!"}
                    creatorName={profile.full_name || 'Creator'}
                    suggestions={["Who are you?", "What do you know?"]} // We can make this dynamic later
                />
            </main>
        </div>
    )
}

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    subscription_tier: string
                    username: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    subscription_tier?: string
                    username?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    subscription_tier?: string
                    username?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            bots: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    tagline: string | null
                    description: string | null
                    avatar_url: string | null
                    tone: Json | null
                    system_prompt: string | null
                    is_public: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    tagline?: string | null
                    description?: string | null
                    avatar_url?: string | null
                    tone?: Json | null
                    system_prompt?: string | null
                    is_public?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    tagline?: string | null
                    description?: string | null
                    avatar_url?: string | null
                    tone?: Json | null
                    system_prompt?: string | null
                    is_public?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            bot_access: {
                Row: {
                    id: string
                    bot_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    bot_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    bot_id?: string
                    user_id?: string
                    created_at?: string
                }
            }
            knowledge_sources: {
                Row: {
                    id: string
                    bot_id: string
                    type: 'file' | 'url' | 'text'
                    content: string | null
                    file_path: string | null
                    status: 'pending' | 'processing' | 'completed' | 'failed' | null
                    metadata: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    bot_id: string
                    type: 'file' | 'url' | 'text'
                    content?: string | null
                    file_path?: string | null
                    status?: 'pending' | 'processing' | 'completed' | 'failed' | null
                    metadata?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    bot_id?: string
                    type?: 'file' | 'url' | 'text'
                    content?: string | null
                    file_path?: string | null
                    status?: 'pending' | 'processing' | 'completed' | 'failed' | null
                    metadata?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            knowledge_chunks: {
                Row: {
                    id: string
                    source_id: string
                    chunk_text: string
                    token_count: number | null
                    embedding: string | null // Vector type is string in JS representation usually
                    metadata: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    source_id: string
                    chunk_text: string
                    token_count?: number | null
                    embedding?: string | null
                    metadata?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    source_id?: string
                    chunk_text?: string
                    token_count?: number | null
                    embedding?: string | null
                    metadata?: Json | null
                    created_at?: string
                }
            }
            conversations: {
                Row: {
                    id: string
                    bot_id: string
                    user_id: string | null
                    visitor_id: string | null
                    started_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    bot_id: string
                    user_id?: string | null
                    visitor_id?: string | null
                    started_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    bot_id?: string
                    user_id?: string | null
                    visitor_id?: string | null
                    started_at?: string
                    updated_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    role: 'user' | 'assistant' | 'system'
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    role: 'user' | 'assistant' | 'system'
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    role?: 'user' | 'assistant' | 'system'
                    content?: string
                    created_at?: string
                }
            }
            usage_events: {
                Row: {
                    id: string
                    bot_id: string
                    user_id: string | null
                    tokens_input: number | null
                    tokens_output: number | null
                    model: string | null
                    cost_usd: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    bot_id: string
                    user_id?: string | null
                    tokens_input?: number | null
                    tokens_output?: number | null
                    model?: string | null
                    cost_usd?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    bot_id?: string
                    user_id?: string | null
                    tokens_input?: number | null
                    tokens_output?: number | null
                    model?: string | null
                    cost_usd?: number | null
                    created_at?: string
                }
            }
            bot_integrations: {
                Row: {
                    id: string
                    bot_id: string
                    platform: 'telegram'
                    config: Json
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    bot_id: string
                    platform: 'telegram'
                    config: Json
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    bot_id?: string
                    platform?: 'telegram'
                    config?: Json
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            match_knowledge_chunks: {
                Args: {
                    query_embedding: string
                    query_text: string
                    match_threshold: number
                    match_count: number
                    p_bot_id: string
                }
                Returns: {
                    id: string
                    chunk_text: string
                    similarity: number
                    rank: number
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}

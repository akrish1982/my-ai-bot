"use client"

import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, User, Bot, Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ChatInterfaceProps {
    botId: string
    initialMessage?: string
    creatorName?: string
    suggestions?: string[]
}

export default function ChatInterface({ botId, initialMessage, creatorName, suggestions }: ChatInterfaceProps) {
    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput } = useChat({
        api: '/api/chat',
        body: { botId },
        onError: (error: any) => {
            console.error('Chat error:', error)
        }
    } as any) as any

    const scrollingDiv = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Scroll to bottom when messages change
        if (scrollingDiv.current) {
            scrollingDiv.current.scrollTop = scrollingDiv.current.scrollHeight
        }
    }, [messages])

    // Set initial message if provided (e.g. greeting)
    useEffect(() => {
        if (initialMessage && messages.length === 0) {
            setMessages([
                {
                    id: 'greeting',
                    role: 'assistant',
                    content: initialMessage
                }
            ])
        }
    }, [initialMessage, setMessages, messages.length])

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion)
        // Optionally auto-submit:
        // handleSubmit({ preventDefault: () => {} } as any)
    }

    return (
        <div className="flex flex-col h-[600px] border rounded-lg bg-background shadow-sm">
            {/* Header Optional */}
            {creatorName && (
                <div className="p-3 border-b text-xs text-muted-foreground bg-muted/20 text-center">
                    Bot created by {creatorName}
                </div>
            )}

            {/* Messages Area */}
            <div ref={scrollingDiv} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !initialMessage && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-4">
                        <Bot className="w-12 h-12 mb-2 mx-auto" />
                        <p>Start a conversation...</p>

                        {suggestions && suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center mt-4">
                                {suggestions.map((s: string, i: number) => (
                                    <Button
                                        key={i}
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleSuggestionClick(s)}
                                    >
                                        {s}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {messages.map((m: any) => (
                    <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role !== 'user' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                        )}

                        <div className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : 'bg-muted rounded-bl-none'
                            }`}>
                            <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                        </div>

                        {m.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-muted p-3 rounded-lg rounded-bl-none">
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-muted/20">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="bg-background"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    )
}

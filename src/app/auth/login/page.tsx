"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import styles from './login.module.css'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const supabase = createClient()

    const handleLogin = async () => {
        setLoading(true)
        setMessage('')

        // Simple email/password sign up/in for MVP testing
        // Try sign in first
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (signInError) {
            // If sign in fails, try sign up (lazy dev mode for MVP)
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            })

            if (signUpError) {
                setMessage(signUpError.message)
            } else {
                setMessage('Account created! Please check your email to verify (if enabled) or sign in.')
            }
        } else {
            setMessage('Logged in! Redirecting...')
            window.location.href = '/create'
        }
        setLoading(false)
    }

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>Sign in to manage your bots</CardDescription>
                </CardHeader>
                <CardContent className={styles.form}>
                    <Input
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <Input
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    {message && <p className={styles.message}>{message}</p>}

                    <Button onClick={handleLogin} isLoading={loading}>
                        Sign In / Sign Up
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

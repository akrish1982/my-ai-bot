"use client"

import { useWizardStore } from "@/lib/store/wizard-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "./steps.module.css"
import { Plus, X } from "lucide-react"
import { useState } from "react"

export default function GuardrailsStep() {
    const { guardrails, setField } = useWizardStore()
    const [topicInput, setTopicInput] = useState("")
    const [ctaInput, setCtaInput] = useState("")

    const addTopic = () => {
        if (topicInput.trim()) {
            setField('guardrails', {
                ...guardrails,
                topics: [...guardrails.topics, topicInput.trim()]
            })
            setTopicInput("")
        }
    }

    const removeTopic = (index: number) => {
        setField('guardrails', {
            ...guardrails,
            topics: guardrails.topics.filter((_, i) => i !== index)
        })
    }

    const addCta = () => {
        if (ctaInput.trim()) {
            setField('guardrails', {
                ...guardrails,
                ctas: [...guardrails.ctas, ctaInput.trim()]
            })
            setCtaInput("")
        }
    }

    const removeCta = (index: number) => {
        setField('guardrails', {
            ...guardrails,
            ctas: guardrails.ctas.filter((_, i) => i !== index)
        })
    }

    return (
        <div className={styles.stepContainer}>
            <Card>
                <CardHeader>
                    <CardTitle>Safety & Guardrails</CardTitle>
                    <CardDescription>
                        Set boundaries for your bot and define what it should promote.
                    </CardDescription>
                </CardHeader>
                <CardContent className={styles.formGrid}>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Forbidden Topics</h3>
                        <p className={styles.helperText}>What should your bot refuse to discuss?</p>
                        <div className={styles.row}>
                            <Input
                                placeholder="e.g. Politics, Competitors"
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                            />
                            <Button onClick={addTopic} type="button" size="sm" variant="secondary">
                                <Plus size={16} />
                            </Button>
                        </div>

                        <div className={styles.tagsContainer}>
                            {guardrails.topics.map((topic, i) => (
                                <div key={i} className={styles.tag}>
                                    <span>{topic}</span>
                                    <button onClick={() => removeTopic(i)} className={styles.tagRemoveBtn}>
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Call to Actions (CTAs)</h3>
                        <p className={styles.helperText}>What should the bot encourage users to do?</p>
                        <div className={styles.row}>
                            <Input
                                placeholder="e.g. Subscribe to my newsletter"
                                value={ctaInput}
                                onChange={(e) => setCtaInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCta()}
                            />
                            <Button onClick={addCta} type="button" size="sm" variant="secondary">
                                <Plus size={16} />
                            </Button>
                        </div>

                        <div className={styles.tagsContainer}>
                            {guardrails.ctas.map((cta, i) => (
                                <div key={i} className={styles.tag}>
                                    <span>{cta}</span>
                                    <button onClick={() => removeCta(i)} className={styles.tagRemoveBtn}>
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}

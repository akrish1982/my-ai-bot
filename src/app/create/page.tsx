"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWizardStore } from "@/lib/store/wizard-store"
import { Button } from "@/components/ui/button"
import BasicInfoStep from "@/components/wizard/basic-info-step"
import KnowledgeStep from "@/components/wizard/knowledge-step"
import GuardrailsStep from "@/components/wizard/guardrails-step"
import styles from "./page.module.css"

export default function CreateBotPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const totalSteps = 3
    const router = useRouter()

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(curr => curr + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(curr => curr - 1)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const state = useWizardStore.getState() // Access state directly to get latest values

            const payload = {
                name: state.name,
                tagline: state.tagline,
                description: state.description,
                tone: state.tone,
                is_public: state.isPublic,
                urls: state.urls,
                guardrails: state.guardrails
            }

            const res = await fetch('/api/bots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to create bot')
            }

            const data = await res.json()
            alert(`Bot Created! Redirecting...`)
            // Redirect to dashboard or the new bot page
            // router.push(`/dashboard`) 
        } catch (error) {
            console.error(error)
            alert('Something went wrong. Please check the console.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Create Your AI Bot</h1>
                <div className={styles.progress}>
                    Step {currentStep} of {totalSteps}
                </div>
            </header>

            <main className={styles.main}>
                {currentStep === 1 && <BasicInfoStep />}
                {currentStep === 2 && <KnowledgeStep />}
                {currentStep === 3 && <GuardrailsStep />}
            </main>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <Button
                        variant="secondary"
                        onClick={prevStep}
                        disabled={currentStep === 1 || isSubmitting}
                    >
                        Back
                    </Button>

                    {currentStep === totalSteps ? (
                        <Button onClick={handleSubmit} disabled={isSubmitting} isLoading={isSubmitting}>
                            Create Bot
                        </Button>
                    ) : (
                        <Button onClick={nextStep} disabled={isSubmitting}>
                            Next
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    )
}

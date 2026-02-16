"use client"

import { useWizardStore } from "@/lib/store/wizard-store"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "./steps.module.css"

export default function BasicInfoStep() {
    const { name, tagline, description, tone, setField, setTone } = useWizardStore()

    return (
        <div className={styles.stepContainer}>
            <Card>
                <CardHeader>
                    <CardTitle>Bot Persona</CardTitle>
                    <CardDescription>
                        Give your bot a name and personality. This is how users will recognize it.
                    </CardDescription>
                </CardHeader>
                <CardContent className={styles.formGrid}>
                    <Input
                        label="Bot Name"
                        placeholder="e.g. Chef Ramsey Bot"
                        value={name}
                        onChange={(e) => setField('name', e.target.value)}
                    />

                    <Input
                        label="Tagline"
                        placeholder="e.g. I roast your cooking... constructively."
                        value={tagline}
                        onChange={(e) => setField('tagline', e.target.value)}
                    />

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="What can this bot do?"
                            value={description}
                            onChange={(e) => setField('description', e.target.value)}
                        />
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.toneSection}>
                        <h3 className={styles.sectionTitle}>Personality Tone</h3>

                        <Slider
                            label="Friendly vs. Direct"
                            leftLabel="Direct"
                            rightLabel="Friendly"
                            value={tone.friendly}
                            onChange={(val) => setTone('friendly', val)}
                        />

                        <Slider
                            label="Professional vs. Casual"
                            leftLabel="Casual"
                            rightLabel="Professional"
                            value={tone.professional}
                            onChange={(val) => setTone('professional', val)}
                        />

                        <Slider
                            label="Serious vs. Funny"
                            leftLabel="Serious"
                            rightLabel="Funny"
                            value={tone.funny}
                            onChange={(val) => setTone('funny', val)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

"use client"

import { useWizardStore } from "@/lib/store/wizard-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "./steps.module.css"
import { Plus, Trash2, FileText, Globe } from "lucide-react"
import { useState } from "react"

export default function KnowledgeStep() {
    const { urls, files, addUrl, removeUrl, addFile, removeFile } = useWizardStore()
    const [urlInput, setUrlInput] = useState("")

    const handleAddUrl = () => {
        if (urlInput.trim()) {
            addUrl(urlInput.trim())
            setUrlInput("")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(addFile)
        }
    }

    return (
        <div className={styles.stepContainer}>
            <Card>
                <CardHeader>
                    <CardTitle>Knowledge Base</CardTitle>
                    <CardDescription>
                        Teach your bot what it knows. Upload documents or add links to your content.
                    </CardDescription>
                </CardHeader>
                <CardContent className={styles.formGrid}>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Add Links</h3>
                        <div className={styles.row}>
                            <Input
                                placeholder="https://example.com/my-article"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                            />
                            <Button onClick={handleAddUrl} type="button" size="sm">
                                <Plus size={16} /> Add
                            </Button>
                        </div>

                        {urls.length > 0 && (
                            <ul className={styles.list}>
                                {urls.map((url, i) => (
                                    <li key={i} className={styles.listItem}>
                                        <div className={styles.itemInfo}>
                                            <Globe size={16} className={styles.icon} />
                                            <span className={styles.itemText}>{url}</span>
                                        </div>
                                        <button
                                            onClick={() => removeUrl(i)}
                                            className={styles.deleteBtn}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Upload Files</h3>
                        <div className={styles.uploadArea}>
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                accept=".pdf,.txt,.md"
                                onChange={handleFileChange}
                                className={styles.hiddenInput}
                            />
                            <label htmlFor="file-upload" className={styles.uploadLabel}>
                                <div className={styles.uploadContent}>
                                    <FileText size={24} />
                                    <span>Click to upload PDF, TXT, or MD files</span>
                                </div>
                            </label>
                        </div>

                        {files.length > 0 && (
                            <ul className={styles.list}>
                                {files.map((file, i) => (
                                    <li key={i} className={styles.listItem}>
                                        <div className={styles.itemInfo}>
                                            <FileText size={16} className={styles.icon} />
                                            <span className={styles.itemText}>{file.name}</span>
                                            <span className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(i)}
                                            className={styles.deleteBtn}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}

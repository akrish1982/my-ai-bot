"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import styles from "./slider.module.css"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    min?: number
    max?: number
    step?: number
    value?: number
    onChange?: (value: number) => void
    label?: string
    leftLabel?: string
    rightLabel?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, min = 0, max = 100, step = 1, value = 50, onChange, label, leftLabel, rightLabel, ...props }, ref) => {

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(Number(e.target.value))
        }

        return (
            <div className={cn(styles.container, className)}>
                {label && <label className={styles.label}>{label}</label>}
                <div className={styles.sliderWrapper}>
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={handleChange}
                        className={styles.slider}
                        ref={ref}
                        {...props}
                    />
                </div>
                {(leftLabel || rightLabel) && (
                    <div className={styles.labels}>
                        <span className={styles.subLabel}>{leftLabel}</span>
                        <span className={styles.subLabel}>{rightLabel}</span>
                    </div>
                )}
            </div>
        )
    }
)
Slider.displayName = "Slider"

export { Slider }

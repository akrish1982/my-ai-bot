import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import styles from './input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        return (
            <div className={styles.container}>
                {label && <label htmlFor={id} className={styles.label}>{label}</label>}
                <input
                    id={id}
                    ref={ref}
                    className={cn(styles.input, error && styles.hasError, className)}
                    {...props}
                />
                {error && <span className={styles.error}>{error}</span>}
            </div>
        )
    }
)
Input.displayName = 'Input'

export { Input }

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import styles from './button.module.css'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(styles.button, styles[variant], styles[size], className)}
                disabled={props.disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className={styles.loader} size={16} />}
                {children}
            </button>
        )
    }
)
Button.displayName = 'Button'

export { Button }

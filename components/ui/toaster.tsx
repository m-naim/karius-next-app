'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 w-full pr-2">
              {variant === 'destructive' && (
                <div className="mt-0.5 rounded-full p-1.5 bg-red-500/20 text-red-400 shrink-0 border border-red-500/30">
                  <AlertCircle className="h-4 w-4" />
                </div>
              )}
              {variant === 'success' && (
                <div className="mt-0.5 rounded-full p-1.5 bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
              {variant === 'warning' && (
                <div className="mt-0.5 rounded-full p-1.5 bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/30">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              )}
              {(!variant || variant === 'default') && (
                <div className="mt-0.5 rounded-full p-1.5 bg-primary/20 text-primary shrink-0 border border-primary/30">
                  <Info className="h-4 w-4" />
                </div>
              )}
              <div className="grid gap-1 min-w-0 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

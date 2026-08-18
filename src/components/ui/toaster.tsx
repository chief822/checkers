import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>

            <div className="flex min-w-0 items-start gap-3">

              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ebe7df]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#292722]" />
              </div>

              <div className="grid min-w-0 gap-0.5">
                {title && <ToastTitle>{title}</ToastTitle>}

                {description && (
                  <ToastDescription>
                    {description}
                  </ToastDescription>
                )}
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
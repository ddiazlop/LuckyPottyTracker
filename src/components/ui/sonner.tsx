import { Toaster as Sonner, type ToasterProps } from "sonner"
import type { CSSProperties } from "react"

const toasterWidthStyle = { "--width": "24rem" } as CSSProperties

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-center"
      offset={{ bottom: 96 }}
      mobileOffset={{ bottom: 96, left: 40, right: 40 }}
      style={toasterWidthStyle}
      duration={8000}
      gap={10}
      visibleToasts={3}
      swipeDirections={["left", "right"]}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl! group-[.toaster]:shadow-xl! [&:not([data-type=success])]:border-slate-800! [&:not([data-type=success])]:bg-slate-900! [&:not([data-type=success])]:text-slate-100!",
          success:
            "border-lime-600/50! bg-lime-800! text-lime-50!",
          title:
            "group-[.toast]:text-xs! group-[.toast]:font-semibold! [.toast:not([data-type=success])_&]:text-slate-100! group-data-[type=success]:text-lime-50!",
          description:
            "group-[.toast]:text-[11px]! [.toast:not([data-type=success])_&]:text-slate-400! group-data-[type=success]:text-lime-100/80!",
          actionButton:
            "group-[.toast]:rounded-lg! group-[.toast]:font-semibold! [.toast:not([data-type=success])_&]:bg-slate-800! [.toast:not([data-type=success])_&]:text-amber-400! [.toast:not([data-type=success])_&]:hover:bg-slate-700! group-data-[type=success]:bg-lime-950/40! group-data-[type=success]:text-lime-50! group-data-[type=success]:hover:bg-lime-950/60!",
          cancelButton:
            "group-[.toast]:rounded-lg! [.toast:not([data-type=success])_&]:bg-slate-800! [.toast:not([data-type=success])_&]:text-slate-300!",
          closeButton:
            "group-[.toast]:border-slate-700! [.toast:not([data-type=success])_&]:bg-slate-800! [.toast:not([data-type=success])_&]:text-slate-400!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

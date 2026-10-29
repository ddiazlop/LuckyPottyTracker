import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-center"
      offset={96}
      mobileOffset={96}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl! group-[.toaster]:border-slate-800! group-[.toaster]:bg-slate-900! group-[.toaster]:text-slate-100! group-[.toaster]:shadow-xl!",
          title: "group-[.toast]:text-xs! group-[.toast]:font-semibold! group-[.toast]:text-slate-100!",
          description: "group-[.toast]:text-[11px]! group-[.toast]:text-slate-400!",
          actionButton:
            "group-[.toast]:rounded-lg! group-[.toast]:bg-slate-800! group-[.toast]:text-amber-400! group-[.toast]:font-semibold! hover:group-[.toast]:bg-slate-700!",
          cancelButton:
            "group-[.toast]:rounded-lg! group-[.toast]:bg-slate-800! group-[.toast]:text-slate-300!",
          closeButton:
            "group-[.toast]:border-slate-700! group-[.toast]:bg-slate-800! group-[.toast]:text-slate-400!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

"use client";

import { Toast } from "@base-ui/react/toast";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toastManager } from "@/lib/toast";

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      className={cn(
        "pointer-events-auto flex w-80 items-start gap-2 rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg transition-all duration-150",
        "data-ending-style:opacity-0 data-starting-style:opacity-0 data-starting-style:translate-y-1",
      )}
    >
      {toast.type === "success" && (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden="true" />
      )}
      {toast.type === "error" && (
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
      )}
      <div className="flex-1 space-y-0.5">
        {toast.title && <Toast.Title className="text-sm font-medium" />}
        {toast.description && <Toast.Description className="text-xs text-muted-foreground" />}
      </div>
      <Toast.Close aria-label="Cerrar" className="text-muted-foreground hover:text-foreground">
        <X className="size-4" aria-hidden="true" />
      </Toast.Close>
    </Toast.Root>
  ));
}

export function Toaster() {
  return (
    <Toast.Provider toastManager={toastManager}>
      <Toast.Portal>
        <Toast.Viewport className="fixed right-4 bottom-4 z-100 flex flex-col-reverse gap-2">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

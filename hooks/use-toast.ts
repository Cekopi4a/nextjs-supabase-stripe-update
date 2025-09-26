import { useState, useCallback } from "react";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function toast({ title, description, variant = "default" }: ToastProps) {
  // Simple console logging for now - could be replaced with a proper toast system
  if (variant === "destructive") {
    console.error(`${title}: ${description}`);
  } else {
    console.log(`${title}: ${description}`);
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = useCallback((props: ToastProps) => {
    toast(props);
    setToasts(prev => [...prev, props]);
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3000);
  }, []);

  return {
    toast: showToast,
    toasts
  };
}
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Toast } from "../hooks/useToast";

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: "bg-green-500/10 border-green-500/30 text-green-400",
  error:   "bg-red-500/10 border-red-500/30 text-red-400",
  warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  info:    "bg-blue-500/10 border-blue-500/30 text-blue-400",
};

interface Props {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed bottom-6 left-6 z-[1000] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div key={t.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              className={cn("flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl", STYLES[t.type])}>
              <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button onClick={() => onDismiss(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

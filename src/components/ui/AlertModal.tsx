"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

type AlertType = "success" | "error" | "warning" | "info" | "confirm";

interface AlertConfig {
  type: AlertType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

interface AlertState extends AlertConfig {
  onConfirm: () => void;
  onCancel: () => void;
}

let globalAlertState: AlertState | null = null;
const alertListeners: Set<(state: AlertState | null) => void> = new Set();

export function showConfirm(config: AlertConfig): Promise<boolean> {
  return new Promise((resolve) => {
    globalAlertState = {
      ...config,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    };
    alertListeners.forEach((listener) => listener(globalAlertState));
  });
}

export function AlertModal() {
  const [alert, setAlert] = useState<AlertState | null>(null);

  useEffect(() => {
    const updateAlert = (state: AlertState | null) => setAlert(state);
    alertListeners.add(updateAlert);
    return () => {
      alertListeners.delete(updateAlert);
    };
  }, []);

  const close = useCallback((result: boolean) => {
    if (alert) {
      if (result) {
        alert.onConfirm();
      } else {
        alert.onCancel();
      }
    }
    globalAlertState = null;
    setAlert(null);
  }, [alert]);

  const icons = {
    success: <CheckCircle className="w-12 h-12 text-green-400" />,
    error: <XCircle className="w-12 h-12 text-red-400" />,
    warning: <AlertTriangle className="w-12 h-12 text-yellow-400" />,
    info: <Info className="w-12 h-12 text-blue-400" />,
    confirm: <AlertTriangle className="w-12 h-12 text-yellow-400" />,
  };

  const borderColors = {
    success: "border-green-500/30",
    error: "border-red-500/30",
    warning: "border-yellow-500/30",
    info: "border-blue-500/30",
    confirm: "border-yellow-500/30",
  };

  const buttonColors = {
    success: "bg-green-500 hover:bg-green-600",
    error: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-black",
    info: "bg-blue-500 hover:bg-blue-600",
    confirm: "bg-primary hover:bg-primary/90",
  };

  return (
    <AnimatePresence>
      {alert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => close(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative glass-panel rounded-3xl p-8 w-full max-w-md mx-4 border ${borderColors[alert.type]}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">{icons[alert.type]}</div>
              <h3 className="text-xl font-bold mb-2">{alert.title}</h3>
              {alert.message && (
                <p className="text-muted-foreground mb-6">{alert.message}</p>
              )}
              <div className="flex gap-3 w-full">
                {(alert.type === "confirm" || alert.type === "warning") && (
                  <button
                    onClick={() => close(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-bold rounded-xl transition-all"
                  >
                    {alert.cancelText || "Cancelar"}
                  </button>
                )}
                <button
                  onClick={() => close(true)}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all text-white ${buttonColors[alert.type]}`}
                >
                  {alert.confirmText || "Aceptar"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Check, AlertCircle } from "lucide-react";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function NotificationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 3000
}: NotificationModalProps) {
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  const bgColor = {
    success: "bg-emerald-50 border-emerald-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200"
  }[type];

  const textColor = {
    success: "text-emerald-900",
    error: "text-red-900",
    info: "text-blue-900"
  }[type];

  const iconColor = {
    success: "text-emerald-600",
    error: "text-red-600",
    info: "text-blue-600"
  }[type];

  const Icon = type === "success" ? Check : AlertCircle;

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeButton={true} className="max-w-sm">
      <div className={`rounded-lg border p-4 ${bgColor}`}>
        <div className="flex gap-3">
          <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />
          <div className="flex-1">
            <h3 className={`font-semibold ${textColor}`}>{title}</h3>
            <p className={`mt-1 text-sm ${textColor}`}>{message}</p>
          </div>
        </div>
      </div>
      {autoClose && (
        <div className="mt-4 text-center">
          <Button size="sm" variant="outline" onClick={onClose}>
            Dismiss
          </Button>
        </div>
      )}
    </Modal>
  );
}

"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onContinueToLogin: () => void;
}

export function EmailVerificationModal({ isOpen, onContinueToLogin }: EmailVerificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle size={32} className="text-green-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Email Verified</h2>
          <p className="text-sm text-slate-600">
            Your email has been verified successfully. You can now log in.
          </p>
        </div>

        {/* Action */}
        <Button onClick={onContinueToLogin} className="w-full">
          Continue to Login
        </Button>
      </div>
    </div>
  );
}

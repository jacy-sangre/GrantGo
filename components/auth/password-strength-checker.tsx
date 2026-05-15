"use client";

import { Check, X } from "lucide-react";
import { checkPasswordStrength } from "@/lib/validations/auth";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrengthChecker({ password }: PasswordStrengthProps) {
  const { level, checks } = checkPasswordStrength(password);

  const getStrengthColor = () => {
    switch (level) {
      case "weak":
        return "bg-red-500";
      case "fair":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
    }
  };

  const getStrengthLabel = () => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Password Strength</span>
          <span className={`text-xs font-semibold ${
            level === "weak" ? "text-red-600" : level === "fair" ? "text-yellow-600" : "text-green-600"
          }`}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{
              width: level === "weak" ? "33%" : level === "fair" ? "66%" : "100%"
            }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {checks.minLength ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <X size={16} className="text-slate-300" />
          )}
          <span className={`text-xs ${checks.minLength ? "text-green-700" : "text-slate-500"}`}>
            At least 8 characters
          </span>
        </div>
        <div className="flex items-center gap-2">
          {checks.hasUppercase ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <X size={16} className="text-slate-300" />
          )}
          <span className={`text-xs ${checks.hasUppercase ? "text-green-700" : "text-slate-500"}`}>
            Contains uppercase letter
          </span>
        </div>
        <div className="flex items-center gap-2">
          {checks.hasLowercase ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <X size={16} className="text-slate-300" />
          )}
          <span className={`text-xs ${checks.hasLowercase ? "text-green-700" : "text-slate-500"}`}>
            Contains lowercase letter
          </span>
        </div>
        <div className="flex items-center gap-2">
          {checks.hasNumber ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <X size={16} className="text-slate-300" />
          )}
          <span className={`text-xs ${checks.hasNumber ? "text-green-700" : "text-slate-500"}`}>
            Contains number
          </span>
        </div>
        <div className="flex items-center gap-2">
          {checks.hasSpecialChar ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <X size={16} className="text-slate-300" />
          )}
          <span className={`text-xs ${checks.hasSpecialChar ? "text-green-700" : "text-slate-500"}`}>
            Contains special character
          </span>
        </div>
      </div>
    </div>
  );
}

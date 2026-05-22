"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { DotfileVariable } from "@/types";

interface VariableFieldProps {
  variable: DotfileVariable;
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function VariableField({
  variable,
  value,
  onChange,
  inputRef,
}: VariableFieldProps) {
  const [showSensitive, setShowSensitive] = useState(false);
  const inputId = `variable-${variable.name}`;
  const descriptionId = `${inputId}-description`;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-zinc-300 mb-1.5"
      >
        {variable.label}
        {variable.required && (
          <span className="text-rose-400 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {variable.description && (
        <p id={descriptionId} className="text-xs text-zinc-500 mb-2">
          {variable.description}
        </p>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type={variable.sensitive && !showSensitive ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={variable.default || `Enter ${variable.label.toLowerCase()}`}
          required={variable.required}
          aria-required={variable.required}
          aria-describedby={variable.description ? descriptionId : undefined}
          className="w-full px-3 py-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-lg text-sm text-zinc-100 font-mono placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:border-cyan-500/40 transition-all"
        />
        {variable.sensitive && (
          <button
            type="button"
            onClick={() => setShowSensitive((prev) => !prev)}
            aria-label={
              showSensitive ? `Hide ${variable.label}` : `Show ${variable.label}`
            }
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            {showSensitive ? (
              <EyeOff size={16} aria-hidden="true" />
            ) : (
              <Eye size={16} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useCallback } from "react";

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  size?: "sm" | "md";
  variant?: "default" | "inline";
  className?: string;
}

export default function CopyButton({
  textToCopy,
  label = "Copy",
  size = "sm",
  variant = "default",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [textToCopy]);

  const sizeClasses = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  if (variant === "inline") {
    return (
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-1 p-1 rounded transition-all duration-200 cursor-pointer ${
          copied
            ? "text-accent"
            : "text-text-muted hover:text-text-secondary"
        } ${className}`}
        title={copied ? "Copied!" : `Copy ${label}`}
      >
        {copied ? (
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${
        copied
          ? "bg-accent/10 text-accent border border-accent/20"
          : "bg-bg-surface2 text-text-secondary border border-border-default hover:text-text-primary hover:border-border-hover"
      } ${className}`}
      title={copied ? "Copied!" : `Copy ${label}`}
    >
      {copied ? (
        <>
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

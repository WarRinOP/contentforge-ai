import React from "react";

interface CardProps {
  title?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function Card({ title, headerAction, children, className = "", noPadding = false }: CardProps) {
  return (
    <div className={`bg-bg-surface border border-border-default rounded-xl overflow-hidden ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
          {title && <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{title}</h3>}
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
}

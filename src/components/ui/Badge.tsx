import React from "react";

type BadgeVariant =
  | "green"
  | "blue"
  | "orange"
  | "purple"
  | "gray"
  | "red"
  | "emerald";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: "bg-success/10 text-success border-success/20",
  blue: "bg-info/10 text-info border-info/20",
  orange: "bg-warning/10 text-warning border-warning/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  gray: "bg-text-muted/10 text-text-secondary border-text-muted/20",
  red: "bg-danger/10 text-danger border-danger/20",
  emerald: "bg-accent/10 text-accent border-accent/20",
};

export default function Badge({
  variant = "gray",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

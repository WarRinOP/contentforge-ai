"use client";

import toast from "react-hot-toast";

// Re-export toast for convenient usage
export { toast };

// Convenience helpers
export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showToast = (message: string) => toast(message);

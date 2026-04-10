import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-body font-medium text-text-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full px-4 py-2.5 rounded-btn border border-border bg-surface font-body text-text-900",
          "placeholder:text-text-500 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-200",
          "transition-all duration-200",
          className
        )}
        {...props}
      />
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-body font-medium text-text-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "w-full px-4 py-2.5 rounded-btn border border-border bg-surface font-body text-text-900",
          "placeholder:text-text-500 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-200",
          "transition-all duration-200 resize-none",
          className
        )}
        {...props}
      />
    </div>
  );
}

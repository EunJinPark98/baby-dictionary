"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./button";

interface SubmitButtonProps {
  children: ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
}

/** 폼 제출 중 상태를 표시하는 버튼 (중복 제출 방지) */
export function SubmitButton({
  children,
  pendingText = "저장 중…",
  variant = "primary",
  size = "md",
  className = "",
  name,
  value,
  disabled,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending || disabled}
      aria-busy={pending}
      className={buttonClass(variant, size, className)}
    >
      {pending ? pendingText : children}
    </button>
  );
}

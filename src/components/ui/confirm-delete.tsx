"use client";

import { useState } from "react";
import { buttonClass } from "./button";
import { SubmitButton } from "./submit-button";

/**
 * 모달 없이 2단계로 확인하는 삭제 버튼. (첫 탭 → 확인 버튼 노출)
 */
export function ConfirmDeleteButton({
  action,
  label = "삭제",
  confirmLabel = "삭제할게요",
  size = "md",
}: {
  action: () => Promise<void>;
  label?: string;
  confirmLabel?: string;
  size?: "sm" | "md";
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={buttonClass("danger", size, "mt-3")}>
        {label}
      </button>
    );
  }

  return (
    <form action={action} className="mt-3 flex flex-wrap gap-2">
      <SubmitButton variant="danger" size={size} pendingText="삭제 중…">
        {confirmLabel}
      </SubmitButton>
      <button type="button" onClick={() => setConfirming(false)} className={buttonClass("ghost", size)}>
        취소
      </button>
    </form>
  );
}

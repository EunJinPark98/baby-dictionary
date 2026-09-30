"use client";

import { useEffect, useId, useRef, useState } from "react";
import { resizeImage } from "@/lib/image/resize";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "baby-photos";
const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024;

interface PhotoPickerProps {
  userId: string;
  /** 저장 경로 하위 폴더 (profile, milestones 등) */
  folder: string;
  name?: string;
  label?: string;
  initialPath?: string | null;
  initialUrl?: string | null;
  onUploadingChange?: (uploading: boolean) => void;
}

/**
 * 비공개 버킷에 사진을 올리고 경로를 hidden input 으로 폼에 전달한다.
 * 경로 규칙: {userId}/{folder}/{uuid}.jpg (Storage RLS 가 본인 폴더만 허용)
 */
export function PhotoPicker({
  userId,
  folder,
  name = "photo_path",
  label = "사진",
  initialPath = null,
  initialUrl = null,
  onUploadingChange,
}: PhotoPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState<string | null>(initialPath);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 올릴 수 있어요.");
      return;
    }
    if (file.size > MAX_ORIGINAL_BYTES) {
      setError("20MB 이하의 사진을 선택해 주세요.");
      return;
    }

    setUploading(true);
    try {
      const blob = await resizeImage(file);
      const newPath = `${userId}/${folder}/${crypto.randomUUID()}.jpg`;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(newPath, blob, { contentType: "image/jpeg", upsert: false });
      if (uploadError) throw uploadError;
      setPath(newPath);
      setPreview(URL.createObjectURL(blob));
    } catch {
      setError("사진을 올리지 못했어요. 다시 시도해 주세요.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    setPath(null);
    setPreview(null);
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-ink">
        {label} <span className="font-normal text-ink-faint">(선택)</span>
      </span>
      <input type="hidden" name={name} value={path ?? ""} />
      <div className="flex items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-line bg-gold-50 text-3xl">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- 비공개 signed URL/blob 미리보기라 next/image 최적화 대상이 아님
            <img src={preview} alt="선택한 사진 미리보기" className="size-full object-cover" />
          ) : (
            <span aria-hidden>👶</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={inputId}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-2xl border border-gold-200 bg-surface px-4 text-sm font-semibold text-gold-700 hover:bg-gold-50"
          >
            {uploading ? "올리는 중…" : preview ? "사진 바꾸기" : "사진 선택"}
          </label>
          {preview && !uploading ? (
            <button type="button" onClick={handleRemove} className="min-h-11 rounded-2xl px-3 text-sm font-medium text-ink-soft hover:bg-gold-50">
              삭제
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleChange}
          disabled={uploading}
        />
      </div>
      <p className="text-[13px] text-ink-faint">사진은 나만 볼 수 있게 비공개로 저장되고, 위치 정보는 지워져요.</p>
      {error ? (
        <p className="text-[13px] font-medium text-blush-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

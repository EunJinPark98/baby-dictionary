import { addMonths, compareIsoDate, isValidIsoDate, type IsoDate } from "@/lib/date/date-only";
import type { BabySex } from "@/lib/supabase/database.types";

export interface BabyInput {
  name: string;
  birth_date: IsoDate;
  sex: BabySex | null;
  photo_path: string | null;
}

export type BabyValidationResult =
  | { ok: true; value: BabyInput }
  | { ok: false; errors: Partial<Record<keyof BabyInput, string>> };

/** 서비스 대상: 0세 중심, 기록 보존을 위해 최대 만 3세까지 등록 허용 */
export const MAX_BABY_AGE_MONTHS = 36;

export function validateBabyInput(
  raw: { name: string; birth_date: string; sex: string; photo_path: string },
  context: { today: IsoDate; userId: string },
): BabyValidationResult {
  const errors: Partial<Record<keyof BabyInput, string>> = {};
  const name = raw.name.trim();

  if (name.length === 0) errors.name = "이름이나 애칭을 입력해 주세요.";
  else if (name.length > 20) errors.name = "이름은 20자 이내로 입력해 주세요.";

  if (!isValidIsoDate(raw.birth_date)) {
    errors.birth_date = "생년월일을 선택해 주세요.";
  } else if (compareIsoDate(raw.birth_date, context.today) > 0) {
    errors.birth_date = "생년월일은 오늘 이후일 수 없어요.";
  } else if (compareIsoDate(raw.birth_date, addMonths(context.today, -MAX_BABY_AGE_MONTHS)) < 0) {
    errors.birth_date = "아기별 지도는 만 3세 이하 아기를 위한 서비스예요.";
  }

  let sex: BabySex | null = null;
  if (raw.sex === "female" || raw.sex === "male") sex = raw.sex;
  else if (raw.sex !== "") errors.sex = "성별 값을 확인해 주세요.";

  const photoPath = raw.photo_path.trim() || null;
  if (photoPath && !isOwnPhotoPath(photoPath, context.userId)) {
    errors.photo_path = "사진을 다시 올려 주세요.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name, birth_date: raw.birth_date, sex, photo_path: photoPath } };
}

/** Storage 경로가 본인 폴더인지 확인 ({userId}/...) — 다른 사람 사진 경로를 저장하지 못하게 한다 */
export function isOwnPhotoPath(path: string, userId: string): boolean {
  return path.startsWith(`${userId}/`) && !path.includes("..") && /^[\w\-./]+$/.test(path);
}

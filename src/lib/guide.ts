/** 월령별 공개 가이드 URL 규칙: /guide/{n}-month-development (n = 0~12) */
export const GUIDE_MAX_MONTH = 12;

export function guideSlug(month: number): string {
  return `${month}-month-development`;
}

export function parseGuideSlug(slug: string): number | null {
  const match = /^(\d{1,2})-month-development$/.exec(slug);
  if (!match) return null;
  const month = Number(match[1]);
  return month <= GUIDE_MAX_MONTH ? month : null;
}

export function guideMonths(): number[] {
  return Array.from({ length: GUIDE_MAX_MONTH + 1 }, (_, i) => i);
}

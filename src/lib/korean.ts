/**
 * 한국어 조사 처리. 이름의 마지막 글자 받침 유무에 따라 조사를 고른다.
 * 한글이 아닌 글자로 끝나면 받침이 없는 것으로 본다.
 */
export function hasFinalConsonant(word: string): boolean {
  const last = word.trim().at(-1);
  if (!last) return false;
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

/** 서준 → 서준은, 한별이 → 한별이는 */
export function withTopic(word: string): string {
  return `${word}${hasFinalConsonant(word) ? "은" : "는"}`;
}

/** 서준 → 서준이, 한별이 → 한별이가 */
export function withSubject(word: string): string {
  return `${word}${hasFinalConsonant(word) ? "이" : "가"}`;
}

/** 서준 → 서준의 */
export function withPossessive(word: string): string {
  return `${word}의`;
}

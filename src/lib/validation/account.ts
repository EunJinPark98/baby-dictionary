export const MIN_PASSWORD_LENGTH = 8;
/** 회원 탈퇴 확인 문구 */
export const DELETE_CONFIRM_PHRASE = "탈퇴합니다";

/** 새 비밀번호 검증. 문제가 없으면 null */
export function validateNewPassword(password: string, confirm: string): Record<string, string> | null {
  const errors: Record<string, string> = {};
  if (password.length < MIN_PASSWORD_LENGTH) errors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상으로 입력해 주세요.`;
  else if (password.length > 72) errors.password = "비밀번호는 72자 이하로 입력해 주세요.";
  if (password !== confirm) errors.passwordConfirm = "비밀번호가 서로 달라요.";
  return Object.keys(errors).length > 0 ? errors : null;
}

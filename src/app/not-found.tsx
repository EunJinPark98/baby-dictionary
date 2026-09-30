import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl" aria-hidden>
        🌌
      </p>
      <h1 className="mt-4 text-2xl font-extrabold text-ink">이 별은 지도에 없어요</h1>
      <p className="mt-2 text-ink-soft">주소가 바뀌었거나 삭제된 페이지예요.</p>
      <Link href="/" className={buttonClass("primary", "lg", "mt-8")}>
        처음으로
      </Link>
    </main>
  );
}

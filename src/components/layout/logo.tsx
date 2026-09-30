import Link from "next/link";
import { Star } from "@/components/ui/star";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl text-lg font-extrabold tracking-tight text-ink">
      <Star className="size-7" />
      아기별 지도
    </Link>
  );
}

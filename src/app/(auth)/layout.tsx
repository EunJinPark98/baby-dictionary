import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-lavender-50 to-ivory">
      <header className="mx-auto flex h-14 w-full max-w-md items-center px-4">
        <Logo />
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-16 pt-4">{children}</main>
    </div>
  );
}

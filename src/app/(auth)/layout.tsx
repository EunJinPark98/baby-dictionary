import type { ReactNode } from "react";
import { BrandFooter, Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-14 w-full max-w-md items-center px-4">
        <Logo />
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-6 pt-4">{children}</main>
      <BrandFooter />
    </div>
  );
}

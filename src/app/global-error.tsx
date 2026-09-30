"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: "sans-serif", background: "#fbf8f1", color: "#2a2530", textAlign: "center", padding: "4rem 1.5rem" }}>
        <p style={{ fontSize: "3rem" }} aria-hidden>
          🌧️
        </p>
        <h1 style={{ fontSize: "1.4rem" }}>잠시 문제가 생겼어요</h1>
        <p>잠시 후 다시 시도해 주세요.</p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: "1.5rem", minHeight: 48, padding: "0 1.5rem", borderRadius: 999, border: 0, background: "linear-gradient(135deg,#ffe9a8,#f5c542 55%,#d9a215)", color: "#14100a", fontWeight: 700 }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}

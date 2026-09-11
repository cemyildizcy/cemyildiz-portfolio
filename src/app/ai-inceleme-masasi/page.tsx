import type { Metadata } from "next";
import { CLAIMS } from "@/data/review-desk/claims";
import { ReviewDeskClient } from "@/components/review-desk/ReviewDeskClient";
import "@/components/review-desk/review-desk.css";

export const metadata: Metadata = {
  title: "AI İnceleme Masası",
  description:
    "Cem Yıldız'ın yapay zekâ araştırma, eleştiri ve bağımsız kaynak doğrulama masası. Her iddia bağımsız rollerle incelenir, insan denetimiyle karara bağlanır.",
};

export default function AiIncelemeMasasiPage() {
  return (
    <main className="review-desk-page">
      <ReviewDeskClient initialClaims={CLAIMS} />
    </main>
  );
}

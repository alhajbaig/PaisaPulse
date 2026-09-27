import type { Metadata } from "next";
import PaisaPulseApp from "@/components/PaisaPulseApp";

export const metadata: Metadata = {
  title: "Insights & Spend Value — PaisaPulse | AI Cashflow Guardian",
  description: "Spend Value Intelligence, personal value mapping, and granular lifestyle expense analysis.",
};

export default function InsightsPage() {
  return <PaisaPulseApp initialTab="insights" />;
}

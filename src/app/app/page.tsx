import type { Metadata } from "next";
import PaisaPulseApp from "@/components/PaisaPulseApp";

export const metadata: Metadata = {
  title: "PaisaPulse — AI Cashflow Guardian",
  description: "Real-time forward cashflow permission and digital twin command center.",
};

export default function AppPage() {
  return <PaisaPulseApp />;
}

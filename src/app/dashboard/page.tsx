import type { Metadata } from "next";
import PaisaPulseApp from "@/components/PaisaPulseApp";

export const metadata: Metadata = {
  title: "Dashboard — PaisaPulse | AI Cashflow Guardian",
  description: "Real-time forward cashflow permission and digital twin command center.",
};

export default function DashboardPage() {
  return <PaisaPulseApp />;
}

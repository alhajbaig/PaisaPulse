import type { Metadata } from "next";
import PaisaPulseApp from "@/components/PaisaPulseApp";

export const metadata: Metadata = {
  title: "Transactions Ledger — PaisaPulse | AI Cashflow Guardian",
  description: "Granular transaction records, statements, duplicate detection, and category tracking.",
};

export default function TransactionsPage() {
  return <PaisaPulseApp initialTab="transactions" />;
}

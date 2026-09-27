import type { Metadata } from "next";
import AuthPortal from "@/components/AuthPortal";

export const metadata: Metadata = {
  title: "Sign In — PaisaPulse | AI Cashflow Guardian",
  description: "Enter your PaisaPulse Cashflow Guardian. Know what is safe to spend today.",
};

export default function LoginPage() {
  return <AuthPortal initialMode="login" />;
}

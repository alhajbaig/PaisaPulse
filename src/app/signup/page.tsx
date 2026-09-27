import type { Metadata } from "next";
import AuthPortal from "@/components/AuthPortal";

export const metadata: Metadata = {
  title: "Create Account — PaisaPulse | AI Cashflow Guardian",
  description: "Activate your PaisaPulse Cashflow Guardian. Never ask where your money went again.",
};

export default function SignUpPage() {
  return <AuthPortal initialMode="signup" />;
}

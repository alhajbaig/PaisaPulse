import type { Metadata } from "next";
import { Instrument_Serif, Manrope, Space_Grotesk, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./app.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PaisaPulse — AI Cashflow Guardian | Know What is Safe to Spend",
  description:
    "Paise sirf aaj ke nahi hote. Kal ke bhi hote hain. PaisaPulse looks forward, deciding what you can safely spend today.",
  keywords: [
    "PaisaPulse",
    "Cashflow Guardian",
    "Safe to spend",
    "Personal Finance India",
    "AI Budgeting",
    "Next gen finance",
  ],
  authors: [{ name: "PaisaPulse" }],
  openGraph: {
    title: "PaisaPulse — AI Cashflow Guardian",
    description: "Account mein ₹10,000 hain. Par kya woh actually tumhare hain?",
    siteName: "PaisaPulse",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${instrumentSerif.variable} ${manrope.variable} ${spaceGrotesk.variable} scroll-smooth`}
    >
      <body className="bg-ivory text-ink selection:bg-coral selection:text-ivory antialiased">
        {children}
      </body>
    </html>
  );
}

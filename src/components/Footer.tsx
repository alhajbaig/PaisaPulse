import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative py-16 px-6 sm:px-10 bg-ivory text-ink border-t border-line-light">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-xs font-sans">
        {/* Left: Brand Identity & Vision */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-accent uppercase font-bold text-xs tracking-[0.2em] text-ink">
              PAISAPULSE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
          </div>
          <p className="font-editorial italic text-base text-ink-muted">
            &ldquo;Your money. Your decisions. A clearer tomorrow.&rdquo;
          </p>
        </div>

        {/* Center: Subtle Navigation */}
        <div className="flex flex-wrap items-center gap-6 text-ink-muted">
          <Link href="/login" className="hover:text-coral transition-colors font-medium">
            Sign In
          </Link>
          <Link href="/signup" className="hover:text-coral transition-colors font-medium">
            Activate Guardian
          </Link>
          <a href="/#how-it-works" className="hover:text-ink transition-colors">
            Methodology
          </a>
          <a href="/#safe-to-spend" className="hover:text-ink transition-colors">
            Safe-to-Spend
          </a>
          <a href="/#what-if" className="hover:text-ink transition-colors">
            What-If Simulator
          </a>
          <a href="/#philosophy" className="hover:text-ink transition-colors">
            Credo
          </a>
        </div>

        {/* Right: Technical Architecture & Region */}
        <div className="text-left md:text-right space-y-1 font-accent text-[11px] text-ink-subtle uppercase tracking-wider">
          <div>Bengaluru / Delhi / Mumbai · Made for India</div>
          <div>© {new Date().getFullYear()} PaisaPulse Inc. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}

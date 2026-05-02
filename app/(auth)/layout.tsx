import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-neon-pink/15 to-neon-purple/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-neon-blue/15 to-neon-cyan/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-neon-pink/30 bg-white/50 backdrop-blur-sm px-4 py-2 mb-6">
            <Sparkles size={16} className="text-neon-pink" />
            <span className="text-xs font-semibold text-slate-700">GrantGo - Your Scholarship Journey</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-lg relative overflow-hidden">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/5 to-neon-purple/5 opacity-0 transition-opacity duration-300"></div>
          
          <div className="relative">
            {children}
          </div>
        </div>

        {/* Bottom decorative text */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Securing your future, one scholarship at a time ✨
        </p>
      </div>
    </main>
  );
}

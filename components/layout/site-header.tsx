"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function SiteHeader() {
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    window.location.href = "/login";
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900">
          GrantGo
        </Link>

        <nav className="flex flex-1 items-center justify-end gap-3 text-sm text-slate-700">
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>
          <a href="/scholarships" className="hover:text-slate-900">
            Scholarships
          </a>
          <a href="/saved" className="hover:text-slate-900">
            Saved
          </a>
          <a href="/applied" className="hover:text-slate-900">
            Applications
          </a>
          <a href="/dashboard" className="hover:text-slate-900">
            Dashboard
          </a>
          <a href="/profile" className="hover:text-slate-900">
            Profile
          </a>
          {session?.user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-md px-3 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900">
                Login
              </Link>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

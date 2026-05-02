import Link from "next/link";
import { ArrowRight, GraduationCap, MapPin, Sparkles, BookOpen, Target, Zap } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Scholarship = {
  id: string;
  title: string;
  amount: number;
  deadline: string | null;
};

export default async function Page() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const [scholarshipsRes, scholarshipCountRes, providerCountRes, regionCountRes] = await Promise.all([
    supabase.from("scholarships").select("id,title,amount,deadline").eq("status", "active").order("deadline", { ascending: true }).limit(6),
    supabase.from("scholarships").select("id", { head: true, count: "exact" }),
    supabase.from("providers").select("id", { head: true, count: "exact" }),
    supabase.from("regions").select("id", { head: true, count: "exact" })
  ]);

  const scholarships = scholarshipsRes.data ?? [];
  const scholarshipCount = scholarshipCountRes.count ?? 0;
  const providerCount = providerCountRes.count ?? 0;
  const regionCount = regionCountRes.count ?? 0;
  const isAuthenticated = Boolean(session?.user);

  return (
    <main className="mx-auto max-w-full px-0 py-0">
      {/* Hero Section with Bold Gradient */}
      <section className="relative overflow-hidden px-6 py-24 sm:px-12 sm:py-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-neon-pink/20 to-neon-purple/10 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-cyan/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-neon-purple/10 to-neon-pink/10 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block">
            <div className="flex items-center gap-2 rounded-full border border-neon-pink/30 bg-white/50 backdrop-blur-sm px-4 py-2">
              <Sparkles size={16} className="text-neon-pink" />
              <span className="text-sm font-semibold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
                Your Scholarship Journey Starts Here
              </span>
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold leading-tight mb-6">
            Find Your{" "}
            <span className="bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue bg-clip-text text-transparent">
              Perfect Grant
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 leading-relaxed mb-10">
            Discover scholarships that match your dreams. Save opportunities, track applications, and unlock your future with GrantGo's modern platform built for ambitious students.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link href={'/dashboard' as any} className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple px-8 py-4 text-lg font-semibold text-white transition-all hover:shadow-neon-md hover:scale-105">
                Go to Dashboard
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link href="/signup" className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple px-8 py-4 text-lg font-semibold text-white transition-all hover:shadow-neon-md hover:scale-105">
                  Get Started Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neon-pink/50 bg-white px-8 py-4 text-lg font-semibold text-neon-pink transition-all hover:border-neon-pink hover:bg-neon-pink/5">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats under CTA */}
          <div className="mt-16 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">{scholarshipCount}+</div>
              <p className="text-sm text-slate-600 mt-1">Active Scholarships</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-neon-cyan bg-clip-text text-transparent">{providerCount}+</div>
              <p className="text-sm text-slate-600 mt-1">Trusted Providers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">{regionCount}</div>
              <p className="text-sm text-slate-600 mt-1">Supported Regions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative px-6 py-20 sm:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why Choose GrantGo?</h2>
            <p className="text-xl text-slate-600">Everything you need to find and win scholarships</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Feature 1 */}
            <div className="group relative rounded-2xl border border-white/50 bg-white/50 backdrop-blur-sm p-8 hover:border-neon-pink/50 hover:shadow-lg transition-all">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-pink/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 mb-4">
                  <Target size={24} className="text-neon-pink" />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Matching</h3>
                <p className="text-slate-600">Get personalized scholarship recommendations based on your profile and preferences</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-2xl border border-white/50 bg-white/50 backdrop-blur-sm p-8 hover:border-neon-blue/50 hover:shadow-lg transition-all">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-blue/5 to-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-cyan/20 mb-4">
                  <BookOpen size={24} className="text-neon-blue" />
                </div>
                <h3 className="text-xl font-bold mb-3">Track Applications</h3>
                <p className="text-slate-600">Keep all your applications organized in one beautiful dashboard</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-2xl border border-white/50 bg-white/50 backdrop-blur-sm p-8 hover:border-neon-purple/50 hover:shadow-lg transition-all">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-purple/5 to-neon-pink/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 mb-4">
                  <Zap size={24} className="text-neon-purple" />
                </div>
                <h3 className="text-xl font-bold mb-3">Never Miss Deadlines</h3>
                <p className="text-slate-600">Get smart notifications and reminders for all your scholarship deadlines</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Scholarships Preview */}
      <section className="relative px-6 py-20 sm:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-2">Latest Opportunities</h2>
              <p className="text-lg text-slate-600">Recent scholarships you might love</p>
            </div>
            <Link href="/dashboard" className="hidden sm:inline-flex items-center gap-2 text-neon-pink font-semibold hover:gap-4 transition-all">
              View all <ArrowRight size={20} />
            </Link>
          </div>

          {scholarships.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/30 backdrop-blur-sm p-12 text-center">
              <p className="text-slate-600 text-lg">No active scholarships yet. Check back soon for amazing opportunities!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {scholarships.map((item, idx) => (
                <Link
                  key={item.id}
                  href={`/scholarships/${item.id}` as any}
                  className="group relative rounded-2xl border border-white/50 bg-white/50 backdrop-blur-sm p-6 hover:border-neon-pink/50 hover:shadow-lg hover:bg-white transition-all"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-pink/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-neon-pink transition-colors">{item.title}</h3>
                      <p className="mt-1 text-slate-600 flex items-center gap-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
                          ₱{item.amount.toLocaleString()}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className="inline-flex rounded-full bg-gradient-to-r from-neon-pink/10 to-neon-purple/10 px-4 py-2 text-sm font-semibold text-neon-pink">
                        {item.deadline ? new Date(item.deadline).toLocaleDateString() : "No deadline"}
                      </span>
                      <ArrowRight size={20} className="text-neon-pink opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="sm:hidden flex justify-center mt-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-neon-pink font-semibold bg-gradient-to-r from-neon-pink/10 to-neon-purple/10 px-6 py-3 rounded-xl hover:from-neon-pink/20 hover:to-neon-purple/20 transition-all">
              View All Scholarships <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:px-12">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/10 via-neon-purple/10 to-neon-blue/10 blur-3xl"></div>
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Find Your Scholarship?</h2>
          <p className="text-xl text-slate-600 mb-10">Join thousands of students discovering their next opportunity with GrantGo</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <>
                <Link href="/signup" className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple px-8 py-4 text-lg font-semibold text-white transition-all hover:shadow-neon-md hover:scale-105">
                  Create Free Account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neon-pink/50 bg-white px-8 py-4 text-lg font-semibold text-neon-pink transition-all hover:border-neon-pink hover:bg-neon-pink/5">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg font-medium bg-[#0f172a] text-white">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white flex flex-col justify-center py-12">
      {/* Hero Section */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center">
        {/* Fixed Badge Padding */}
        <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/80 px-4 py-1.5 text-sm font-medium text-slate-300 backdrop-blur-sm">
          🎓 Academic Resource Sharing Platform
        </span>

        <h1 className="mt-8 text-5xl font-extrabold tracking-tight md:text-7xl leading-[1.15]">
          Find your next,
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Study Resource
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Upload, discover and bookmark study resources tailored to your branch
          and semester.
        </p>

        {/* Fixed Button Layout and Typo'd Paddings */}
        <div className="mt-10 flex flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-800 hover:border-slate-600 hover:scale-[1.02] active:scale-[0.98]"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 mt-20 w-full">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <FeatureCard
            icon="📚"
            title="Share Resources"
            description="Upload notes, PDFs and study material to help your classmates."
          />

          <FeatureCard
            icon="🔍"
            title="Discover Faster"
            description="Browse resources using branch, semester and subject filters."
          />

          <FeatureCard
            icon="⭐"
            title="Bookmark"
            description="Save useful resources and access them anytime."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8 transition duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-800/60 hover:shadow-xl hover:shadow-blue-500/5">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-5 text-xl font-bold text-slate-100">{title}</h3>
      <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
}
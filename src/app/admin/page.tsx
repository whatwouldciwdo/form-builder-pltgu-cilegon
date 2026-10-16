"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NeuCard, NeuButton, NeuInput } from "@/components/ui/NeuComponents";
import { Lock, Mail, ArrowLeft, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk ke sistem.");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8EDF2] flex flex-col justify-between items-center p-6 sm:p-10">
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between">
        <Link
          href="/"
          className="neu-button px-4 py-2 text-xs font-semibold text-[#718096] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
        </Link>
      </div>

      {/* Login Card */}
      <main className="w-full max-w-md my-auto">
        <NeuCard size="lg" className="p-8 sm:p-10">
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <div className="bg-white p-3 rounded-2xl shadow-[4px_4px_10px_#C5CDD8,-4px_-4px_10px_#FFFFFF] flex items-center justify-center">
              <Image
                src="/logo-pln-indonesiapower.png"
                alt="Logo PLN Indonesia Power"
                width={150}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2D3748]">
                Portal Pengelola Form
              </h2>
              <p className="text-xs font-medium text-[#718096]">
                Masuk untuk membuat form dan melihat respon
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 neu-inset bg-red-50 text-red-600 rounded-xl text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <NeuInput
                id="email"
                type="email"
                label="Email Perusahaan"
                placeholder="nama@pltgu-cilegon.co.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <NeuInput
                id="password"
                type="password"
                label="Kata Sandi"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="pt-2">
              <NeuButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center"
                disabled={loading}
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
              </NeuButton>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[#D5DCE5] text-center text-xs text-[#A0AEC0]">
            Akun bawaan sistem: <br />
            <span className="font-mono text-[#718096]">admin@pltgu-cilegon.co.id</span>
          </div>
        </NeuCard>
      </main>

      {/* Footer */}
      <footer className="text-xs text-[#718096] text-center py-2">
        &copy; 2026 PT PLN Indonesia Power - Sistem Informasi UBP Cilegon
      </footer>
    </div>
  );
}

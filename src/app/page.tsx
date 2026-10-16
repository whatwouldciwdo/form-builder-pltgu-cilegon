import Image from "next/image";
import Link from "next/link";
import { NeuCard, NeuButton } from "@/components/ui/NeuComponents";
import { FileSpreadsheet, ShieldCheck, PenTool, LayoutDashboard, Send } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#E8EDF2] flex flex-col items-center justify-between p-6 sm:p-12">
      {/* Top Header with PLN Indonesia Power Official Logo */}
      <header className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-[4px_4px_10px_#C5CDD8,-4px_-4px_10px_#FFFFFF] flex items-center justify-center">
            <Image
              src="/logo-pln-indonesiapower.png"
              alt="Logo PLN Indonesia Power"
              width={160}
              height={50}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#2D3748]">
              PLTGU Cilegon
            </h1>
            <p className="text-xs font-semibold text-[#00779E] tracking-wider uppercase">
              Internal Enterprise Form Builder
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin">
            <NeuButton variant="primary">
              <LayoutDashboard className="w-4 h-4" /> Masuk Portal Admin
            </NeuButton>
          </Link>
        </div>
      </header>

      {/* Hero Presentation */}
      <main className="w-full max-w-4xl my-auto py-12">
        <NeuCard size="lg" className="text-center p-8 sm:p-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D3748] tracking-tight leading-tight">
            Platform Pengumpulan Data & Formulir Digital On-Premise
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#718096] max-w-2xl mx-auto leading-relaxed">
            Data tersimpan aman di server internal database PLTGU Cilegon. Lengkap dengan tanda tangan digital langsung, ekspor dokumen resmi <strong>Word (.docx)</strong> &amp; <strong>PDF</strong> berkop surat, serta spreadsheet Excel.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/admin">
              <NeuButton variant="primary" size="lg">
                <PenTool className="w-4 h-4" /> Buat &amp; Kelola Formulir
              </NeuButton>
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-left">
            <div className="neu-inset p-5 rounded-2xl space-y-2">
              <div className="w-9 h-9 rounded-xl neu-card flex items-center justify-center text-[#00779E]">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#2D3748]">Digital Signature</h3>
              <p className="text-xs text-[#718096] leading-relaxed">
                Bubuhkan tanda tangan via touch screen smartphone atau mouse. Otomatis tersemat di berkas resmi.
              </p>
            </div>

            <div className="neu-inset p-5 rounded-2xl space-y-2">
              <div className="w-9 h-9 rounded-xl neu-card flex items-center justify-center text-[#00779E]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#2D3748]">Export Word, PDF &amp; Excel</h3>
              <p className="text-xs text-[#718096] leading-relaxed">
                Format tabel rapi lengkap dengan kop surat resmi PLN Indonesia Power dan verifikasi tanda tangan.
              </p>
            </div>

            <div className="neu-inset p-5 rounded-2xl space-y-2">
              <div className="w-9 h-9 rounded-xl neu-card flex items-center justify-center text-[#00779E]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#2D3748]">100% Server Lokal</h3>
              <p className="text-xs text-[#718096] leading-relaxed">
                Terkoneksi langsung ke PostgreSQL internal (10.8.140.69). Siap jalan di Docker Ubuntu.
              </p>
            </div>
          </div>
        </NeuCard>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-[#718096]">
        &copy; 2026 PT PLN Indonesia Power - Unit Bisnis Pembangkitan Cilegon. Sistem Informasi UBP Cilegon. All rights reserved.
      </footer>
    </div>
  );
}

"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NeuCard, NeuButton } from "@/components/ui/NeuComponents";
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Download,
  Users,
  Search,
  CheckCircle,
  Clock,
  Eye,
  FileDown,
  Archive,
} from "lucide-react";

interface AnswerItem {
  id: string;
  fieldId: string;
  value: string;
}

interface ResponseItem {
  id: string;
  submittedAt: string;
  answers: AnswerItem[];
}

interface FormFieldItem {
  id: string;
  type: string;
  label: string;
  order: number;
}

interface FormWithResponses {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isAcceptingResponse: boolean;
  fields: FormFieldItem[];
  responses: ResponseItem[];
}

export default function FormResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [form, setForm] = useState<FormWithResponses | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSignaturePreview, setActiveSignaturePreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadResponses() {
      try {
        const res = await fetch(`/api/forms/${id}/responses`);
        if (!res.ok) {
          router.push("/admin/dashboard");
          return;
        }
        const data = await res.json();
        setForm(data.form);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadResponses();
  }, [id, router]);

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-[#E8EDF2] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#00779E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-[#718096]">Memuat data respon...</p>
        </div>
      </div>
    );
  }

  // Filter responses by search text
  const handleToggleAccepting = async () => {
    if (!form) return;
    const nextVal = !form.isAcceptingResponse;
    setForm((prev) => (prev ? { ...prev, isAcceptingResponse: nextVal } : null));
    try {
      await fetch(`/api/forms/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAcceptingResponse: nextVal }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredResponses = form.responses.filter((r) => {
    if (!search.trim()) return true;
    return r.answers.some((a) =>
      a.value.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#E8EDF2] flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="bg-[#E8EDF2] border-b border-[#D5DCE5] px-6 sm:px-10 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <button className="neu-button p-2 text-[#718096] hover:text-[#2D3748]">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div className="bg-white p-2 rounded-xl shadow-[2px_2px_6px_#C5CDD8,-2px_-2px_6px_#FFFFFF] flex items-center justify-center">
              <Image
                src="/logo-pln-indonesiapower.png"
                alt="Logo PLN Indonesia Power"
                width={120}
                height={38}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#2D3748]">
                Rekapitulasi Respon: {form.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    form.isAcceptingResponse
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-900 border border-amber-300/60"
                  }`}
                >
                  {form.isAcceptingResponse ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Aktif Menerima Respon
                    </>
                  ) : (
                    <>
                      <Archive className="w-3 h-3 text-amber-700" />
                      Histori / Expired
                    </>
                  )}
                </span>
                <span className="text-xs text-[#00779E] font-medium">
                  • Total {form.responses.length} Responden Tersimpan
                </span>
              </div>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a href={`/api/forms/${id}/export/excel`} download>
              <NeuButton size="sm" className="text-xs font-semibold text-emerald-700">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Unduh Excel (.xlsx)
              </NeuButton>
            </a>
            <a href={`/api/forms/${id}/export/word`} download>
              <NeuButton size="sm" className="text-xs font-semibold text-blue-700">
                <FileText className="w-3.5 h-3.5" /> Unduh Word (.docx)
              </NeuButton>
            </a>
            <a href={`/api/forms/${id}/export/pdf`} download>
              <NeuButton size="sm" className="text-xs font-semibold text-red-700">
                <FileDown className="w-3.5 h-3.5" /> Unduh PDF
              </NeuButton>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-6">
        {/* Archive Historical Notice Banner */}
        {!form.isAcceptingResponse && (
          <div className="p-4 neu-inset bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 text-amber-900">
              <div className="p-2 bg-amber-200/60 rounded-xl text-amber-800 shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-amber-950">
                  Formulir Berstatus Expired / Penerimaan Respon Ditutup (Histori Arsip)
                </p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Formulir ini sedang tidak menerima respon baru. Seluruh data riwayat responden dan tanda tangan di bawah ini tetap tersimpan permanen dan dapat dicek ulang serta diekspor kapan saja.
                </p>
              </div>
            </div>
            <NeuButton
              size="sm"
              onClick={handleToggleAccepting}
              className="shrink-0 text-xs font-semibold text-[#00779E]"
            >
              Buka Kembali Form
            </NeuButton>
          </div>
        )}

        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-80 neu-inset px-4 py-2.5 rounded-xl flex items-center gap-2">
            <Search className="w-4 h-4 text-[#A0AEC0]" />
            <input
              type="text"
              placeholder="Cari data responden..."
              className="w-full bg-transparent text-xs text-[#2D3748] focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <span className="text-xs text-[#718096]">
            Menampilkan <strong>{filteredResponses.length}</strong> dari {form.responses.length} respon
          </span>
        </div>

        {/* Responses Table Container */}
        <NeuCard className="p-0 overflow-hidden rounded-2xl">
          {filteredResponses.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Users className="w-10 h-10 text-[#A0AEC0] mx-auto mb-3" />
              <p className="font-bold text-sm text-[#2D3748]">
                Belum ada data responden
              </p>
              <p className="text-xs text-[#718096] mt-1">
                Bagikan link formulir ke responden untuk mengumpulkan jawaban.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#DFE5EC] text-[#2D3748] border-b border-[#D5DCE5]">
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] w-12 text-center">
                      No
                    </th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                      Waktu Pengisian
                    </th>
                    {form.fields.map((field) => (
                      <th
                        key={field.id}
                        className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap"
                      >
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DCE5]">
                  {filteredResponses.map((response, idx) => {
                    const answersMap = new Map(
                      response.answers.map((a) => [a.fieldId, a.value])
                    );

                    return (
                      <tr
                        key={response.id}
                        className="hover:bg-[#E2E8F0]/60 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center font-mono text-[#718096]">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-[#718096]">
                          {new Date(response.submittedAt).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        {form.fields.map((field) => {
                          const val = answersMap.get(field.id) || "-";

                          if (field.type === "SIGNATURE") {
                            const isDataUrl = val.startsWith("data:image");
                            return (
                              <td key={field.id} className="py-3.5 px-4 whitespace-nowrap">
                                {isDataUrl ? (
                                  <button
                                    onClick={() => setActiveSignaturePreview(val)}
                                    className="neu-button px-2.5 py-1 text-[11px] text-[#00779E] font-semibold flex items-center gap-1.5"
                                  >
                                    <Eye className="w-3 h-3" /> Lihat TTD
                                  </button>
                                ) : (
                                  <span className="text-[#A0AEC0]">-</span>
                                )}
                              </td>
                            );
                          }

                          return (
                            <td key={field.id} className="py-3.5 px-4 text-[#2D3748]">
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </NeuCard>
      </main>

      {/* Signature Preview Modal */}
      {activeSignaturePreview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm neu-card bg-[#E8EDF2] p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#2D3748]">
                Tanda Tangan Digital Responden
              </h3>
              <button
                onClick={() => setActiveSignaturePreview(null)}
                className="text-xs text-[#718096] hover:text-red-500 font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="neu-inset p-4 rounded-2xl flex items-center justify-center bg-white">
              <img
                src={activeSignaturePreview}
                alt="Tanda Tangan Digital"
                className="max-h-48 object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-[#718096] border-t border-[#D5DCE5] bg-[#E8EDF2]">
        &copy; 2026 PT PLN Indonesia Power - Unit Bisnis Pembangkitan Cilegon. Sistem Informasi UBP Cilegon. All rights reserved.
      </footer>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NeuCard, NeuButton, NeuInput } from "@/components/ui/NeuComponents";
import {
  Plus,
  FileText,
  Users,
  LogOut,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface FormSummary {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  isPublished: boolean;
  isAcceptingResponse: boolean;
  createdAt: string;
  _count: {
    responses: number;
    fields: number;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchForms = async () => {
    try {
      const res = await fetch("/api/forms");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      if (data.forms) {
        setForms(data.forms);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
        }),
      });

      const data = await res.json();
      if (res.ok && data.form) {
        setShowCreateModal(false);
        setNewTitle("");
        setNewDescription("");
        router.push(`/admin/builder/${data.form.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteForm = async (id: string, title: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus formulir "${title}"? Seluruh respon dan tanda tangan di dalamnya akan ikut terhapus.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
      if (res.ok) {
        setForms((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAccepting = async (form: FormSummary) => {
    const nextVal = !form.isAcceptingResponse;
    // Optimistic update
    setForms((prev) =>
      prev.map((f) =>
        f.id === form.id ? { ...f, isAcceptingResponse: nextVal } : f
      )
    );

    try {
      await fetch(`/api/forms/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAcceptingResponse: nextVal }),
      });
    } catch (e) {
      console.error(e);
      fetchForms();
    }
  };

  const totalResponses = forms.reduce((acc, f) => acc + f._count.responses, 0);
  const activeFormsCount = forms.filter((f) => f.isAcceptingResponse).length;
  const expiredFormsCount = forms.filter((f) => !f.isAcceptingResponse).length;

  const filteredForms = forms.filter((f) => {
    const matchesFilter =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? f.isAcceptingResponse
        : !f.isAcceptingResponse;
    const matchesSearch =
      searchQuery.trim() === "" ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description &&
        f.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#E8EDF2] flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="w-full bg-[#E8EDF2] border-b border-[#D5DCE5] px-6 sm:px-12 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-2xl shadow-[4px_4px_10px_#C5CDD8,-4px_-4px_10px_#FFFFFF] flex items-center justify-center">
              <Image
                src="/logo-pln-indonesiapower.png"
                alt="Logo PLN Indonesia Power"
                width={140}
                height={45}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#2D3748]">
                Panel Manajemen Formulir
              </h1>
              <p className="text-xs font-semibold text-[#00779E] uppercase tracking-wider">
                PLTGU Cilegon O&amp;M Services
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NeuButton
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" /> Buat Formulir Baru
            </NeuButton>
            <NeuButton onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4" /> Keluar
            </NeuButton>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-8">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <NeuCard className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-[#00779E]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Total Formulir
              </p>
              <p className="text-2xl font-extrabold text-[#2D3748]">
                {forms.length}
              </p>
            </div>
          </NeuCard>

          <NeuCard className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Aktif Menerima Respon
              </p>
              <p className="text-2xl font-extrabold text-emerald-600">
                {activeFormsCount}
              </p>
            </div>
          </NeuCard>

          <NeuCard className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-amber-600">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Histori / Expired (Ditutup)
              </p>
              <p className="text-2xl font-extrabold text-[#2D3748]">
                {expiredFormsCount}
              </p>
            </div>
          </NeuCard>

          <NeuCard className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#718096] uppercase tracking-wider">
                Total Respon Tersimpan
              </p>
              <p className="text-2xl font-extrabold text-[#2D3748]">
                {totalResponses}
              </p>
            </div>
          </NeuCard>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 neu-inset p-1.5 rounded-2xl">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "all"
                  ? "neu-button bg-[#E8EDF2] text-[#00779E]"
                  : "text-[#718096] hover:text-[#2D3748]"
              }`}
            >
              Semua ({forms.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === "active"
                  ? "neu-button bg-[#E8EDF2] text-emerald-700"
                  : "text-[#718096] hover:text-[#2D3748]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Aktif ({activeFormsCount})
            </button>
            <button
              onClick={() => setStatusFilter("expired")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === "expired"
                  ? "neu-button bg-[#E8EDF2] text-amber-800"
                  : "text-[#718096] hover:text-[#2D3748]"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              Histori / Expired ({expiredFormsCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-80 neu-inset px-4 py-2 rounded-xl flex items-center gap-2">
            <Search className="w-4 h-4 text-[#A0AEC0] shrink-0" />
            <input
              type="text"
              placeholder="Cari judul atau topik formulir..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-[#2D3748] focus:outline-none"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="neu-card p-6 h-56 animate-pulse rounded-2xl flex flex-col justify-between"
              >
                <div className="h-5 bg-[#C5CDD8]/50 rounded w-3/4"></div>
                <div className="h-4 bg-[#C5CDD8]/40 rounded w-1/2"></div>
                <div className="h-8 bg-[#C5CDD8]/30 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredForms.length === 0 ? (
          /* Empty State */
          <NeuCard className="text-center py-16 px-6">
            <div className="w-16 h-16 rounded-3xl neu-inset mx-auto flex items-center justify-center text-[#A0AEC0] mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#2D3748]">
              {searchQuery
                ? "Tidak ada formulir yang sesuai pencarian"
                : statusFilter === "expired"
                ? "Belum ada formulir berstatus histori / expired"
                : "Belum ada formulir dibuat"}
            </h3>
            <p className="text-xs text-[#718096] max-w-sm mx-auto mt-1 mb-6">
              {searchQuery
                ? `Coba kata kunci pencarian lain.`
                : "Mulai buat formulir digital Anda"}
            </p>
            {statusFilter !== "all" ? (
              <NeuButton onClick={() => setStatusFilter("all")}>
                Tampilkan Semua Formulir
              </NeuButton>
            ) : (
              <NeuButton
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4" /> Buat Formulir Pertama
              </NeuButton>
            )}
          </NeuCard>
        ) : (
          /* Forms Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <NeuCard
                key={form.id}
                className={`p-6 flex flex-col justify-between space-y-4 hover:shadow-[10px_10px_20px_#C5CDD8,-10px_-10px_20px_#FFFFFF] transition-all ${
                  !form.isAcceptingResponse ? "opacity-95" : ""
                }`}
              >
                <div>
                  {/* Status Badges */}
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Active vs Expired / Closed Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          form.isAcceptingResponse
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-900 border border-amber-300/60"
                        }`}
                      >
                        {form.isAcceptingResponse ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Aktif
                          </>
                        ) : (
                          <>
                            <Archive className="w-3 h-3 text-amber-700" />
                            Histori / Expired
                          </>
                        )}
                      </span>

                      {/* Publish Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          form.isPublished
                            ? "bg-[#00779E]/10 text-[#00779E]"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {form.isPublished ? "Publik" : "Draft"}
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-[#718096] shrink-0">
                      {new Date(form.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#2D3748] text-base line-clamp-1">
                    {form.title}
                  </h3>
                  <p className="text-xs text-[#718096] line-clamp-2 mt-1">
                    {form.description || "Tidak ada deskripsi formulir."}
                  </p>
                </div>

                {/* Response & Field Count */}
                <div className="neu-inset p-3 rounded-xl flex items-center justify-between text-xs text-[#718096]">
                  <span>{form._count.fields} Pertanyaan / Field</span>
                  <span className="font-bold text-[#00779E]">
                    {form._count.responses} Responden
                  </span>
                </div>

                {/* Quick Toggle Penerimaan Respon */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-[#718096]">
                    Penerimaan Respon:
                  </span>
                  <button
                    onClick={() => handleToggleAccepting(form)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2D3748] hover:text-[#00779E] transition-colors cursor-pointer"
                    title={
                      form.isAcceptingResponse
                        ? "Klik untuk menutup formulir (Set Expired/Histori)"
                        : "Klik untuk membuka kembali penerimaan respon"
                    }
                  >
                    {form.isAcceptingResponse ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Dibuka</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-amber-600" />
                        <span className="text-amber-800 font-bold">Ditutup</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2 border-t border-[#D5DCE5]">
                  <Link
                    href={`/admin/builder/${form.id}`}
                    className="flex-1"
                  >
                    <NeuButton size="sm" className="w-full text-xs font-semibold">
                      <Edit3 className="w-3.5 h-3.5" /> Desain
                    </NeuButton>
                  </Link>

                  <Link href={`/admin/responses/${form.id}`}>
                    <NeuButton
                      size="sm"
                      className="text-xs font-bold text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20"
                      title="Lihat seluruh riwayat responden & ekspor Word/Excel/PDF"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Respon ({form._count.responses})
                    </NeuButton>
                  </Link>

                  <Link
                    href={`/f/${form.slug}`}
                    target="_blank"
                    title="Buka Halaman Publik Pengisian Form"
                  >
                    <NeuButton size="sm" className="text-xs">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </NeuButton>
                  </Link>

                  <button
                    onClick={() => handleDeleteForm(form.id, form.title)}
                    className="neu-button p-2 text-red-500 hover:text-red-700"
                    title="Hapus Formulir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </NeuCard>
            ))}
          </div>
        )}
      </main>

      {/* Create Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg neu-card bg-[#E8EDF2] p-8 rounded-3xl shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#2D3748]">
                Buat Formulir Baru
              </h3>
              <p className="text-xs text-[#718096]">
                Masukkan judul dan deskripsi umum sebelum mulai mendesain kolom formulir.
              </p>
            </div>

            <form onSubmit={handleCreateForm} className="space-y-4">
              <NeuInput
                label="Judul Formulir"
                placeholder="Contoh: Checklist Inspeksi Trafo GI Cilegon"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1.5 uppercase tracking-wider">
                  Deskripsi Singkat (Opsional)
                </label>
                <div className="neu-inset px-4 py-3 rounded-2xl">
                  <textarea
                    rows={3}
                    placeholder="Tuliskan tujuan formulir ini..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-transparent text-xs text-[#2D3748] focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <NeuButton
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Batal
                </NeuButton>
                <NeuButton
                  type="submit"
                  variant="primary"
                  disabled={creating}
                >
                  {creating ? "Membuat..." : "Lanjut ke Desain Kolom"}
                </NeuButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-[#D5DCE5] py-4 text-center text-xs text-[#718096]">
        &copy; 2026 PT PLN Indonesia Power - Unit Bisnis Pembangkitan Cilegon. Sistem Form Digital Terintegrasi.
      </footer>
    </div>
  );
}

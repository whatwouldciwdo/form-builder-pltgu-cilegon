"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NeuCard, NeuButton, NeuInput } from "@/components/ui/NeuComponents";
import { NeuSignaturePad } from "@/components/ui/NeuSignaturePad";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Type,
  AlignLeft,
  Hash,
  Mail,
  Calendar,
  List,
  CheckSquare,
  Radio,
  FileUp,
  PenTool,
  CheckCircle,
  Eye,
  Settings,
  Share2,
} from "lucide-react";

interface FieldItem {
  id?: string;
  type: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  options?: string[];
}

interface FormDetail {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  isPublished: boolean;
  isAcceptingResponse: boolean;
  successMessage: string;
  fields: FieldItem[];
}

const AVAILABLE_FIELD_TYPES = [
  { type: "TEXT", label: "Teks Pendek", icon: Type },
  { type: "TEXTAREA", label: "Teks Paragraf", icon: AlignLeft },
  { type: "NUMBER", label: "Angka / Nilai", icon: Hash },
  { type: "EMAIL", label: "Alamat Email", icon: Mail },
  { type: "DATE", label: "Tanggal", icon: Calendar },
  { type: "DROPDOWN", label: "Pilihan Dropdown", icon: List },
  { type: "RADIO", label: "Pilihan Tunggal (Radio)", icon: Radio },
  { type: "CHECKBOX", label: "Pilihan Ganda (Checkbox)", icon: CheckSquare },
  { type: "FILE", label: "Upload Berkas / Foto", icon: FileUp },
  { type: "SIGNATURE", label: "Tanda Tangan Digital", icon: PenTool },
];

export default function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "preview" | "settings">("builder");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`/api/forms/${id}`);
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
    loadForm();
  }, [id, router]);

  const handleAddField = (type: string) => {
    if (!form) return;
    const defaultLabel =
      AVAILABLE_FIELD_TYPES.find((t) => t.type === type)?.label || "Field Baru";

    const newField: FieldItem = {
      type,
      label: defaultLabel,
      isRequired: false,
      placeholder: "",
      options: ["DROPDOWN", "RADIO", "CHECKBOX"].includes(type)
        ? ["Opsi 1", "Opsi 2"]
        : undefined,
    };

    setForm({
      ...form,
      fields: [...form.fields, newField],
    });
  };

  const handleUpdateField = (index: number, updated: Partial<FieldItem>) => {
    if (!form) return;
    const newFields = [...form.fields];
    newFields[index] = { ...newFields[index], ...updated };
    setForm({ ...form, fields: newFields });
  };

  const handleRemoveField = (index: number) => {
    if (!form) return;
    const newFields = form.fields.filter((_, i) => i !== index);
    setForm({ ...form, fields: newFields });
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    if (!form) return;
    const newFields = [...form.fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;

    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;

    setForm({ ...form, fields: newFields });
  };

  const handleSaveForm = async () => {
    if (!form) return;
    setSaving(true);
    setSaveSuccessNotice(false);

    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSaveSuccessNotice(true);
        setTimeout(() => setSaveSuccessNotice(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-[#E8EDF2] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#00779E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-[#718096]">Memuat Form Builder...</p>
        </div>
      </div>
    );
  }

  const publicUrl = `/f/${form.slug}`;

  return (
    <div className="min-h-screen bg-[#E8EDF2] flex flex-col justify-between">
      {/* Top Builder Navigation */}
      <header className="bg-[#E8EDF2] border-b border-[#D5DCE5] px-6 sm:px-10 py-3.5 sticky top-0 z-40">
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
                width={110}
                height={35}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <input
                className="font-bold text-base text-[#2D3748] bg-transparent focus:outline-none border-b border-transparent focus:border-[#00779E] transition-all"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <p className="text-[11px] text-[#718096]">
                Slug URL: <span className="font-mono text-[#00779E]">/f/{form.slug}</span>
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 neu-inset p-1 rounded-full">
            <button
              onClick={() => setActiveTab("builder")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "builder"
                  ? "bg-[#E8EDF2] shadow-[3px_3px_6px_#C5CDD8,-3px_-3px_6px_#FFFFFF] text-[#00779E]"
                  : "text-[#718096] hover:text-[#2D3748]"
              }`}
            >
              Editor Builder
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "preview"
                  ? "bg-[#E8EDF2] shadow-[3px_3px_6px_#C5CDD8,-3px_-3px_6px_#FFFFFF] text-[#00779E]"
                  : "text-[#718096] hover:text-[#2D3748]"
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" /> Pratinjau Form
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "settings"
                  ? "bg-[#E8EDF2] shadow-[3px_3px_6px_#C5CDD8,-3px_-3px_6px_#FFFFFF] text-[#00779E]"
                  : "text-[#718096] hover:text-[#2D3748]"
              }`}
            >
              <Settings className="w-3.5 h-3.5 inline mr-1" /> Pengaturan
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link href={publicUrl} target="_blank">
              <NeuButton size="sm" className="text-xs">
                <Share2 className="w-3.5 h-3.5" /> Buka Link Publik
              </NeuButton>
            </Link>

            <NeuButton
              variant="primary"
              size="sm"
              onClick={handleSaveForm}
              disabled={saving}
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Menyimpan..." : "Simpan Formulir"}
            </NeuButton>
          </div>
        </div>
      </header>

      {saveSuccessNotice && (
        <div className="bg-emerald-600 text-white text-xs font-bold text-center py-2 shadow-md sticky top-[65px] z-30 transition-all flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" /> Formulir dan struktur pertanyaan berhasil disimpan ke database internal.
        </div>
      )}

      {/* Main Builder Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10">
        {activeTab === "builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left: Palette of Field Types */}
            <div className="lg:col-span-1 space-y-4">
              <NeuCard className="p-5 sticky top-24">
                <h3 className="text-xs font-bold text-[#718096] uppercase tracking-wider mb-4">
                  Tambah Komponen Pertanyaan
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {AVAILABLE_FIELD_TYPES.map((f) => {
                    const IconComponent = f.icon;
                    return (
                      <button
                        key={f.type}
                        onClick={() => handleAddField(f.type)}
                        className="w-full text-left neu-button px-3.5 py-2.5 text-xs font-semibold text-[#2D3748] flex items-center gap-2.5 hover:text-[#00779E]"
                      >
                        <IconComponent className="w-4 h-4 text-[#00779E]" />
                        <span>{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </NeuCard>
            </div>

            {/* Right: Dynamic Canvas */}
            <div className="lg:col-span-3 space-y-6">
              {/* Form Title & Instruction Card */}
              <NeuCard className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
                    Deskripsi / Petunjuk Pengisian
                  </label>
                  <textarea
                    rows={2}
                    className="w-full neu-inset p-3 text-sm text-[#2D3748] focus:outline-none rounded-xl resize-none"
                    placeholder="Tuliskan petunjuk umum bagi pengisi formulir..."
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
              </NeuCard>

              {/* Questions List */}
              <div className="space-y-4">
                {form.fields.length === 0 ? (
                  <NeuCard className="text-center py-12">
                    <p className="text-sm font-semibold text-[#718096]">
                      Belum ada pertanyaan pada formulir ini.
                    </p>
                    <p className="text-xs text-[#A0AEC0] mt-1">
                      Klik komponen di panel kiri untuk menambahkan kolom pertanyaan.
                    </p>
                  </NeuCard>
                ) : (
                  form.fields.map((field, idx) => (
                    <NeuCard
                      key={idx}
                      className="p-6 space-y-4 border-l-4 border-[#00779E] relative group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#00779E]">
                          <span className="w-6 h-6 rounded-full neu-inset flex items-center justify-center text-[11px]">
                            {idx + 1}
                          </span>
                          <span>{field.type}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {idx > 0 && (
                            <button
                              onClick={() => handleMoveField(idx, "up")}
                              className="neu-button px-2.5 py-1 text-xs text-[#718096]"
                              title="Pindah ke Atas"
                            >
                              ▲
                            </button>
                          )}
                          {idx < form.fields.length - 1 && (
                            <button
                              onClick={() => handleMoveField(idx, "down")}
                              className="neu-button px-2.5 py-1 text-xs text-[#718096]"
                              title="Pindah ke Bawah"
                            >
                              ▼
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveField(idx)}
                            className="neu-button p-1.5 text-red-500 hover:text-red-700"
                            title="Hapus Pertanyaan Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Field Label Input */}
                      <div>
                        <input
                          className="w-full font-bold text-sm text-[#2D3748] neu-inset px-4 py-2.5 rounded-xl focus:outline-none"
                          value={field.label}
                          placeholder="Pertanyaan / Label..."
                          onChange={(e) =>
                            handleUpdateField(idx, { label: e.target.value })
                          }
                        />
                      </div>

                      {/* Field Placeholder or Options */}
                      {["DROPDOWN", "RADIO", "CHECKBOX"].includes(field.type) ? (
                        <div className="space-y-2 pt-1">
                          <label className="text-[11px] font-bold text-[#718096] uppercase">
                            Daftar Pilihan Opsi
                          </label>
                          <div className="space-y-2">
                            {(field.options || []).map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <input
                                  className="flex-1 neu-inset px-3 py-1.5 text-xs text-[#2D3748] rounded-lg focus:outline-none"
                                  value={opt}
                                  onChange={(e) => {
                                    const nextOpts = [...(field.options || [])];
                                    nextOpts[optIdx] = e.target.value;
                                    handleUpdateField(idx, { options: nextOpts });
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextOpts = (field.options || []).filter(
                                      (_, i) => i !== optIdx
                                    );
                                    handleUpdateField(idx, { options: nextOpts });
                                  }}
                                  className="text-xs text-red-500 hover:text-red-700 px-2"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const nextOpts = [
                                  ...(field.options || []),
                                  `Opsi ${(field.options || []).length + 1}`,
                                ];
                                handleUpdateField(idx, { options: nextOpts });
                              }}
                              className="text-xs font-bold text-[#00779E] hover:underline"
                            >
                              + Tambah Pilihan
                            </button>
                          </div>
                        </div>
                      ) : field.type === "SIGNATURE" ? (
                        <div className="neu-inset p-3 rounded-xl text-xs text-[#718096] flex items-center gap-2">
                          <PenTool className="w-4 h-4 text-[#00779E]" />
                          Area ini akan menampilkan kanvas tanda tangan digital interaktif di sisi pengisi.
                        </div>
                      ) : (
                        <div>
                          <input
                            className="w-full text-xs text-[#718096] neu-inset px-3.5 py-2 rounded-xl focus:outline-none"
                            placeholder="Contoh / petunjuk teks di dalam kolom..."
                            value={field.placeholder || ""}
                            onChange={(e) =>
                              handleUpdateField(idx, {
                                placeholder: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}

                      {/* Required Toggle */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#D5DCE5] text-xs">
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-[#718096]">
                          <input
                            type="checkbox"
                            checked={field.isRequired}
                            onChange={(e) =>
                              handleUpdateField(idx, {
                                isRequired: e.target.checked,
                              })
                            }
                            className="rounded accent-[#00779E]"
                          />
                          Wajib Diisi (Required)
                        </label>
                      </div>
                    </NeuCard>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview Mode */}
        {activeTab === "preview" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <NeuCard size="lg" className="p-8 sm:p-12 space-y-6">
              {/* Form Kop Resmi */}
              <div className="flex items-center gap-4 pb-4 border-b border-[#D5DCE5]">
                <div className="bg-white p-2.5 rounded-2xl shadow-[4px_4px_10px_#C5CDD8,-4px_-4px_10px_#FFFFFF] flex items-center justify-center">
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
                  <h2 className="text-xl font-bold text-[#2D3748]">{form.title}</h2>
                  <p className="text-xs text-[#718096] mt-0.5">
                    {form.description || "Silakan lengkapi formulir di bawah ini dengan data yang sebenar-benarnya."}
                  </p>
                </div>
              </div>

              {/* Form Fields Render */}
              <div className="space-y-5 pt-2">
                {form.fields.map((f, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#718096] uppercase tracking-wider">
                      {f.label} {f.isRequired && <span className="text-red-500">*</span>}
                    </label>

                    {f.type === "TEXT" || f.type === "EMAIL" || f.type === "NUMBER" || f.type === "DATE" ? (
                      <div className="neu-inset px-4 py-3 rounded-xl">
                        <input
                          type={f.type === "EMAIL" ? "email" : f.type === "NUMBER" ? "number" : f.type === "DATE" ? "date" : "text"}
                          placeholder={f.placeholder || "Ketik di sini..."}
                          className="w-full bg-transparent text-sm text-[#2D3748] focus:outline-none"
                          disabled
                        />
                      </div>
                    ) : f.type === "TEXTAREA" ? (
                      <div className="neu-inset px-4 py-3 rounded-xl">
                        <textarea
                          rows={3}
                          placeholder={f.placeholder || "Tulis keterangan lengkap..."}
                          className="w-full bg-transparent text-sm text-[#2D3748] focus:outline-none resize-none"
                          disabled
                        />
                      </div>
                    ) : f.type === "SIGNATURE" ? (
                      <NeuSignaturePad
                        label={f.label}
                        isRequired={f.isRequired}
                        onChange={() => {}}
                      />
                    ) : f.type === "DROPDOWN" ? (
                      <div className="neu-inset px-4 py-3 rounded-xl">
                        <select className="w-full bg-transparent text-sm text-[#2D3748] focus:outline-none" disabled>
                          <option>-- Pilih opsi --</option>
                          {(f.options || []).map((o, oi) => (
                            <option key={oi}>{o}</option>
                          ))}
                        </select>
                      </div>
                    ) : f.type === "RADIO" ? (
                      <div className="space-y-2 pt-1">
                        {(f.options || []).map((o, oi) => (
                          <label key={oi} className="flex items-center gap-2.5 text-xs text-[#2D3748]">
                            <input type="radio" disabled name={`radio-${i}`} className="accent-[#00779E]" />
                            {o}
                          </label>
                        ))}
                      </div>
                    ) : f.type === "CHECKBOX" ? (
                      <div className="space-y-2 pt-1">
                        {(f.options || []).map((o, oi) => (
                          <label key={oi} className="flex items-center gap-2.5 text-xs text-[#2D3748]">
                            <input type="checkbox" disabled className="accent-[#00779E] rounded" />
                            {o}
                          </label>
                        ))}
                      </div>
                    ) : f.type === "FILE" ? (
                      <div className="neu-inset p-4 rounded-xl text-center text-xs text-[#718096]">
                        📎 Klik atau drop file berkas pendukung di sini
                      </div>
                    ) : null}
                  </div>
                ))}

                <div className="pt-4">
                  <NeuButton variant="primary" size="lg" className="w-full" disabled>
                    Kirim Formulir (Mode Pratinjau)
                  </NeuButton>
                </div>
              </div>
            </NeuCard>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl mx-auto">
            <NeuCard className="p-8 space-y-6">
              <h3 className="text-base font-bold text-[#2D3748]">
                Pengaturan Umum Formulir
              </h3>

              <div className="space-y-4">
                <div>
                  <NeuInput
                    label="Custom Slug / URL Form"
                    placeholder="contoh: izin-kerja-panas-2026"
                    value={form.slug}
                    onChange={(e) => {
                      const formatted = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-");
                      setForm({ ...form, slug: formatted });
                    }}
                  />
                  <div className="flex items-center justify-between mt-1 px-1">
                    <span className="text-[11px] text-[#718096]">
                      Link Form: <strong className="font-mono text-[#00779E]">/f/{form.slug}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const fromTitle = form.title
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9\s-]/g, "")
                          .replace(/\s+/g, "-")
                          .replace(/-+/g, "-")
                          .slice(0, 50);
                        setForm({ ...form, slug: fromTitle || "form" });
                      }}
                      className="text-[11px] font-semibold text-[#00779E] hover:underline"
                    >
                      🔄 Samakan dengan Judul
                    </button>
                  </div>
                </div>

                <div>
                  <NeuInput
                    label="Pesan Sukses Setelah Pengisian"
                    value={form.successMessage}
                    onChange={(e) =>
                      setForm({ ...form, successMessage: e.target.value })
                    }
                  />
                </div>

                <div className="neu-inset p-4 rounded-2xl space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-[#2D3748]">
                      Status Publikasi Form
                    </span>
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) =>
                        setForm({ ...form, isPublished: e.target.checked })
                      }
                      className="accent-[#00779E] w-4 h-4"
                    />
                  </label>
                  <p className="text-[11px] text-[#718096]">
                    Jika diaktifkan, form dapat diakses langsung oleh rekan kerja melalui URL publik.
                  </p>
                </div>

                <div className="neu-inset p-4 rounded-2xl space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-[#2D3748]">
                      Menerima Respon Baru
                    </span>
                    <input
                      type="checkbox"
                      checked={form.isAcceptingResponse}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          isAcceptingResponse: e.target.checked,
                        })
                      }
                      className="accent-[#00779E] w-4 h-4"
                    />
                  </label>
                  <p className="text-[11px] text-[#718096]">
                    Matikan switch ini jika pengumpulan form sudah ditutup / selesai batas waktu.
                  </p>
                </div>
              </div>
            </NeuCard>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-[#718096] border-t border-[#D5DCE5] bg-[#E8EDF2]">
        &copy; 2026 PT PLN Indonesia Power - Unit Bisnis Pembangkitan Cilegon. Sistem Informasi UBP Cilegon. All rights reserved.
      </footer>
    </div>
  );
}

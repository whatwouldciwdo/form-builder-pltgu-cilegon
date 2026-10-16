"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import { NeuCard, NeuButton } from "@/components/ui/NeuComponents";
import { NeuSignaturePad } from "@/components/ui/NeuSignaturePad";
import { CheckCircle2, AlertCircle, Send, Clock, RotateCcw } from "lucide-react";

interface FieldItem {
  id: string;
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
  isAcceptingResponse: boolean;
  successMessage: string;
  fields: FieldItem[];
}

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublicForm() {
      try {
        const res = await fetch(`/api/public/forms/${slug}`);
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Formulir tidak ditemukan.");
          return;
        }
        setForm(data.form);
      } catch (e) {
        console.error(e);
        setErrorMsg("Gagal memuat formulir.");
      } finally {
        setLoading(false);
      }
    }
    loadPublicForm();
  }, [slug]);

  const handleInputChange = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setValidationError(null);
    setSubmitting(true);

    try {
      // Validate client side
      for (const field of form.fields) {
        if (field.isRequired) {
          const val = answers[field.id];
          if (!val || (typeof val === "string" && val.trim() === "") || (Array.isArray(val) && val.length === 0)) {
            setValidationError(`Pertanyaan "${field.label}" wajib diisi / ditandatangani.`);
            setSubmitting(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
        }
      }

      // Convert answers map to array of objects
      const payloadAnswers = Object.entries(answers).map(([fieldId, value]) => ({
        fieldId,
        value: Array.isArray(value) ? JSON.stringify(value) : value,
      }));

      const res = await fetch(`/api/public/forms/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payloadAnswers }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim formulir.");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setValidationError(err.message);
      } else {
        setValidationError("Terjadi kesalahan.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8EDF2] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#00779E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-[#718096]">Memuat formulir...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !form) {
    return (
      <div className="min-h-screen bg-[#E8EDF2] flex items-center justify-center p-6">
        <NeuCard className="max-w-md w-full text-center p-8 space-y-4">
          <div className="w-12 h-12 neu-inset rounded-2xl mx-auto flex items-center justify-center text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#2D3748]">Formulir Tidak Tersedia</h2>
          <p className="text-xs text-[#718096]">{errorMsg}</p>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8EDF2] py-8 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Top Header Card */}
        <NeuCard size="lg" className="p-6 sm:p-10 space-y-4 border-t-4 border-[#00779E]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-[#D5DCE5]">
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
              <p className="text-[11px] font-bold text-[#00779E] uppercase tracking-wider">
                PT PLN Indonesia Power - UBP Cilegon
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3748] tracking-tight">
                {form.title}
              </h1>
            </div>
          </div>

          {form.description && (
            <p className="text-xs sm:text-sm text-[#718096] leading-relaxed">
              {form.description}
            </p>
          )}

          <div className="text-[11px] text-red-500 font-semibold pt-1">
            * Menunjukkan pertanyaan yang wajib diisi
          </div>
        </NeuCard>

        {/* Success Confirmation Card */}
        {submitted ? (
          <NeuCard size="lg" className="p-8 sm:p-12 text-center space-y-5">
            <div className="w-16 h-16 neu-inset rounded-3xl mx-auto flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#2D3748]">Formulir Berhasil Dikirim!</h2>
            <p className="text-xs sm:text-sm text-[#718096] max-w-md mx-auto leading-relaxed">
              {form.successMessage}
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
                className="neu-button px-5 py-2.5 text-xs font-semibold text-[#00779E] inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Kirim Jawaban Lain
              </button>
            </div>
          </NeuCard>
        ) : !form.isAcceptingResponse ? (
          <NeuCard className="text-center p-8 space-y-3">
            <Clock className="w-8 h-8 text-amber-600 mx-auto" />
            <h3 className="font-bold text-sm text-[#2D3748]">
              Penerimaan Respon Ditutup
            </h3>
            <p className="text-xs text-[#718096]">
              Formulir ini sedang tidak menerima jawaban baru saat ini.
            </p>
          </NeuCard>
        ) : (
          /* Input Form Fields */
          <form onSubmit={handleSubmit} className="space-y-6">
            {validationError && (
              <div className="p-4 neu-inset bg-red-50 text-red-600 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {form.fields.map((field) => (
              <NeuCard key={field.id} className="p-6 space-y-2.5">
                <label className="block text-xs font-bold text-[#2D3748] tracking-wide">
                  {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                </label>

                {field.helpText && (
                  <p className="text-[11px] text-[#A0AEC0]">{field.helpText}</p>
                )}

                {/* Render field inputs */}
                {field.type === "TEXT" || field.type === "EMAIL" || field.type === "NUMBER" || field.type === "DATE" ? (
                  <div className="neu-inset px-4 py-3 rounded-xl">
                    <input
                      type={
                        field.type === "EMAIL"
                          ? "email"
                          : field.type === "NUMBER"
                          ? "number"
                          : field.type === "DATE"
                          ? "date"
                          : "text"
                      }
                      placeholder={field.placeholder || "Ketik jawaban..."}
                      value={answers[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-transparent text-sm text-[#2D3748] focus:outline-none"
                    />
                  </div>
                ) : field.type === "TEXTAREA" ? (
                  <div className="neu-inset px-4 py-3 rounded-xl">
                    <textarea
                      rows={3}
                      placeholder={field.placeholder || "Tuliskan jawaban..."}
                      value={answers[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-transparent text-sm text-[#2D3748] focus:outline-none resize-none"
                    />
                  </div>
                ) : field.type === "SIGNATURE" ? (
                  <NeuSignaturePad
                    label={field.label}
                    isRequired={field.isRequired}
                    value={answers[field.id] || null}
                    onChange={(dataUrl) => handleInputChange(field.id, dataUrl)}
                  />
                ) : field.type === "DROPDOWN" ? (
                  <div className="neu-inset px-4 py-3 rounded-xl">
                    <select
                      value={answers[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-transparent text-sm text-[#2D3748] focus:outline-none"
                    >
                      <option value="">-- Pilih salah satu opsi --</option>
                      {(field.options || []).map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : field.type === "RADIO" ? (
                  <div className="space-y-2 pt-1">
                    {(field.options || []).map((opt, i) => (
                      <label key={i} className="flex items-center gap-3 text-xs text-[#2D3748] cursor-pointer">
                        <input
                          type="radio"
                          name={`radio-${field.id}`}
                          value={opt}
                          checked={answers[field.id] === opt}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="accent-[#00779E] w-4 h-4"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : field.type === "CHECKBOX" ? (
                  <div className="space-y-2 pt-1">
                    {(field.options || []).map((opt, i) => {
                      const currentSelected = answers[field.id] || [];
                      const isChecked = currentSelected.includes(opt);
                      return (
                        <label key={i} className="flex items-center gap-3 text-xs text-[#2D3748] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...currentSelected, opt]
                                : currentSelected.filter((item: string) => item !== opt);
                              handleInputChange(field.id, next);
                            }}
                            className="accent-[#00779E] rounded w-4 h-4"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </NeuCard>
            ))}

            <div className="pt-2">
              <NeuButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full justify-center"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Mengirimkan formulir..." : "Kirim Formulir"}
              </NeuButton>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-[#718096]">
        &copy; 2026 PT PLN Indonesia Power - Unit Bisnis Pembangkitan Cilegon. Sistem Informasi UBP Cilegon. All rights reserved.
      </footer>
    </div>
  );
}

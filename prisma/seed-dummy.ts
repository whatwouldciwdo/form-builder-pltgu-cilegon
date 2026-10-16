import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Memulai proses pembuatan 3 formulir dummy...");

  // Pastikan user admin tersedia
  let user = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash("AdminPLTGU2026!", 10);
    user = await prisma.user.create({
      data: {
        name: "Admin PLTGU Cilegon",
        email: "admin@pltgu-cilegon.co.id",
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });
    console.log("User admin baru berhasil dibuat.");
  } else {
    console.log(`Menggunakan user admin: ${user.name} (${user.email})`);
  }

  // 1. FORM 1: Formulir Izin Kerja Aman (Safety Work Permit)
  const slug1 = "izin-kerja-aman";
  // Hapus jika sudah ada slug yang sama untuk menghindari bentrok saat re-run
  const existingForm1 = await prisma.form.findUnique({ where: { slug: slug1 } });
  if (existingForm1) {
    await prisma.form.delete({ where: { id: existingForm1.id } });
  }

  const form1 = await prisma.form.create({
    data: {
      userId: user.id,
      title: "Formulir Izin Kerja Aman (Safety Work Permit)",
      description:
        "Izin kerja keselamatan (PTW) untuk pekerjaan operasional risiko tinggi (pekerjaan panas, ruang terbatas, ketinggian) di area unit pembangkit PLTGU Cilegon.",
      slug: slug1,
      isPublished: true,
      isAcceptingResponse: true,
      successMessage:
        "Pengajuan Izin Kerja Aman berhasil dikirim! Silakan menunggu verifikasi dari Tim K3L sebelum memulai pekerjaan.",
      fields: {
        create: [
          {
            type: "TEXT",
            label: "Nama Pemohon / Pengawas Lapangan",
            placeholder: "Contoh: Budi Santoso",
            helpText: "Nama penanggung jawab pekerjaan di lapangan",
            isRequired: true,
            order: 0,
          },
          {
            type: "DROPDOWN",
            label: "Divisi / Bagian Pemohon",
            isRequired: true,
            order: 1,
            options: [
              "Operasi & Pemeliharaan Mesin",
              "K3 & Lingkungan (K3L)",
              "Instrumen & Kontrol Listrik",
              "Logistik & Fasilitas Umum",
              "Mitra Kerja / Vendor Kontraktor",
            ],
          },
          {
            type: "RADIO",
            label: "Kategori Pekerjaan Berisiko",
            isRequired: true,
            order: 2,
            options: [
              "Pekerjaan Panas (Hot Work / Pengelasan)",
              "Ruang Terbatas (Confined Space)",
              "Bekerja di Ketinggian (> 1.8 Meter)",
              "Pekerjaan Listrik Tegangan Tinggi",
              "Pekerjaan Galian & Mekanikal Berat",
            ],
          },
          {
            type: "TEXT",
            label: "Lokasi Spesifik Unit Kerja",
            placeholder: "Contoh: Turbin Hall Gas Turbine Unit 1, HRSG Lantai 3",
            isRequired: true,
            order: 3,
          },
          {
            type: "DATE",
            label: "Tanggal Rencana Pelaksanaan",
            isRequired: true,
            order: 4,
          },
          {
            type: "CHECKBOX",
            label: "Alat Pelindung Diri (APD) Wajib yang Digunakan",
            isRequired: true,
            order: 5,
            options: [
              "Safety Helmet & Tali Dagu",
              "Safety Shoes Standar Industri",
              "Full Body Harness & Lanyard",
              "Kacamata Pelindung / Kedok Las",
              "Sarung Tangan Tahan Panas / Kimia",
              "Gas Detector Portable",
            ],
          },
          {
            type: "TEXTAREA",
            label: "Uraian Ringkas Langkah Kerja & Mitigasi Bahaya",
            placeholder: "Jelaskan tahapan pekerjaan dan mitigasi keselamatan yang telah disiapkan...",
            isRequired: true,
            order: 6,
          },
          {
            type: "SIGNATURE",
            label: "Tanda Tangan Pengawas K3 / Safety Officer",
            helpText: "Tanda tangan digital pengesahan dokumen keselamatan kerja",
            isRequired: true,
            order: 7,
          },
        ],
      },
    },
  });
  console.log(`Form 1 berhasil dibuat: ${form1.title} (/f/${form1.slug})`);

  // 2. FORM 2: Checklist Inspeksi Harian Pompa & Turbin
  const slug2 = "inspeksi-harian-peralatan";
  const existingForm2 = await prisma.form.findUnique({ where: { slug: slug2 } });
  if (existingForm2) {
    await prisma.form.delete({ where: { id: existingForm2.id } });
  }

  const form2 = await prisma.form.create({
    data: {
      userId: user.id,
      title: "Checklist Inspeksi Harian Unit Pompa & Turbin",
      description:
        "Formulir pencatatan inspeksi harian berkala untuk parameter getaran, suhu bearing, pelumasan, dan status operasional peralatan berputar di PLTGU Cilegon.",
      slug: slug2,
      isPublished: true,
      isAcceptingResponse: true,
      successMessage:
        "Data inspeksi harian berhasil disimpan ke database sistem monitoring keandalan pembangkit.",
      fields: {
        create: [
          {
            type: "DATE",
            label: "Tanggal Pemeriksaan",
            isRequired: true,
            order: 0,
          },
          {
            type: "DROPDOWN",
            label: "Shift Operasional",
            isRequired: true,
            order: 1,
            options: [
              "Shift 1 (Pagi: 07.00 - 15.00 WIB)",
              "Shift 2 (Sore: 15.00 - 23.00 WIB)",
              "Shift 3 (Malam: 23.00 - 07.00 WIB)",
            ],
          },
          {
            type: "TEXT",
            label: "Kode Tagging / Nama Peralatan",
            placeholder: "Contoh: 10-CWP-001 (Circulating Water Pump Unit 1)",
            isRequired: true,
            order: 2,
          },
          {
            type: "NUMBER",
            label: "Suhu Bearing (°C)",
            placeholder: "Contoh: 62.5",
            helpText: "Ambang batas normal operasi < 75°C",
            isRequired: true,
            order: 3,
          },
          {
            type: "NUMBER",
            label: "Tingkat Getaran / Vibration (mm/s RMS)",
            placeholder: "Contoh: 2.8",
            helpText: "Ambang batas waspada > 4.5 mm/s",
            isRequired: true,
            order: 4,
          },
          {
            type: "RADIO",
            label: "Kondisi Level Oli Pelumas",
            isRequired: true,
            order: 5,
            options: [
              "Normal (Di antara garis Min & Max)",
              "Di Bawah Garis Minimum (Perlu Top-up)",
              "Oli Terindikasi Keruh / Terkontaminasi",
              "Ditemukan Rembesan / Kebocoran Oli",
            ],
          },
          {
            type: "RADIO",
            label: "Status Operasional Peralatan",
            isRequired: true,
            order: 6,
            options: [
              "Running Normal (Beroperasi Penuh)",
              "Standby Siaga Operasi",
              "Maintenance / Perbaikan Terjadwal",
              "Trip / Emergency Shutdown",
            ],
          },
          {
            type: "TEXTAREA",
            label: "Catatan Temuan / Kejanggalan Suara & Suhu",
            placeholder: "Tuliskan catatan kelainan suara mesin, getaran abnormal, atau bau terbakar jika ada...",
            isRequired: false,
            order: 7,
          },
          {
            type: "SIGNATURE",
            label: "Tanda Tangan Operator Inspeksi",
            isRequired: true,
            order: 8,
          },
        ],
      },
    },
  });
  console.log(`Form 2 berhasil dibuat: ${form2.title} (/f/${form2.slug})`);

  // 3. FORM 3: Formulir Pengajuan Lembur & Tugas Khusus
  const slug3 = "pengajuan-lembur-tugas-khusus";
  const existingForm3 = await prisma.form.findUnique({ where: { slug: slug3 } });
  if (existingForm3) {
    await prisma.form.delete({ where: { id: existingForm3.id } });
  }

  const form3 = await prisma.form.create({
    data: {
      userId: user.id,
      title: "Formulir Pengajuan Lembur & Tugas Khusus",
      description:
        "Pengajuan persetujuan lembur terencana maupun darurat untuk personel operasional dan pemeliharaan PT PLN Indonesia Power UBP Cilegon.",
      slug: slug3,
      isPublished: true,
      isAcceptingResponse: true,
      successMessage:
        "Pengajuan lembur Anda telah terkirim dan akan diteruskan kepada Manajer Bagian untuk proses persetujuan.",
      fields: {
        create: [
          {
            type: "TEXT",
            label: "Nama Lengkap Pegawai",
            placeholder: "Contoh: Hendra Kurniawan",
            isRequired: true,
            order: 0,
          },
          {
            type: "TEXT",
            label: "Nomor Induk Pegawai (NIP / NIK)",
            placeholder: "Contoh: 9418293ZY",
            isRequired: true,
            order: 1,
          },
          {
            type: "EMAIL",
            label: "Alamat Email Korporat PLN IP",
            placeholder: "Contoh: hendra.kurniawan@plnindonesiapower.co.id",
            isRequired: true,
            order: 2,
          },
          {
            type: "DATE",
            label: "Tanggal Pelaksanaan Lembur",
            isRequired: true,
            order: 3,
          },
          {
            type: "NUMBER",
            label: "Perkiraan Durasi Jam Lembur (Jam)",
            placeholder: "Contoh: 4",
            helpText: "Jumlah estimasi jam pelaksanaan kerja lembur",
            isRequired: true,
            order: 4,
          },
          {
            type: "RADIO",
            label: "Kategori Keperluan Lembur",
            isRequired: true,
            order: 5,
            options: [
              "Emergency / Penanganan Gangguan Unit Pembangkit",
              "Pekerjaan Overhaul Terjadwal (Major / Minor)",
              "Penggantian Shift Petugas yang Berhalangan",
              "Tutup Buku Administrasi & Audit Sistem",
            ],
          },
          {
            type: "TEXTAREA",
            label: "Rincian Pekerjaan yang Diselesaikan",
            placeholder: "Jelaskan target pekerjaan yang harus diselesaikan selama jam lembur...",
            isRequired: true,
            order: 6,
          },
          {
            type: "SIGNATURE",
            label: "Tanda Tangan Pemohon Lembur",
            helpText: "Bubuhkan tanda tangan digital Anda sebagai pemohon",
            isRequired: true,
            order: 7,
          },
        ],
      },
    },
  });
  console.log(`Form 3 berhasil dibuat: ${form3.title} (/f/${form3.slug})`);

  console.log("Semua 3 formulir dummy berhasil dibuat dengan sempurna!");
}

main()
  .catch((e) => {
    console.error("Gagal membuat dummy form:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

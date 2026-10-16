# PRD — PLTGU Cilegon Form Builder
> **Version:** 1.0.0  
> **Date:** October 2026  
> **Author:** PLTGU Cilegon IT Team  
> **Status:** Draft

---

## 1. Overview

### 1.1 Product Name
**PLTGU Cilegon Form Builder** — Platform pembuatan dan pengelolaan formulir digital internal PLTGU Cilegon sebagai pengganti Google Forms.

### 1.2 Problem Statement
PLTGU Cilegon saat ini menggunakan Google Forms untuk kebutuhan pengumpulan data internal (survei, laporan, perizinan, dll). Terdapat beberapa kendala:

- Data tersimpan di server Google (luar negeri), tidak comply dengan kebijakan data internal
- Tidak dapat dikustomisasi sesuai branding & kebutuhan spesifik perusahaan
- Tidak ada integrasi langsung dengan sistem internal
- Tidak ada kendali penuh atas akses & izin pengguna

### 1.3 Solution
Membangun form builder internal yang:
- Berjalan di infrastruktur PLTGU Cilegon sendiri (on-premise / private cloud)
- Menyimpan data ke PostgreSQL internal (`10.8.140.69`)
- Dapat dikelola penuh oleh tim IT
- Tampilannya seragam dengan desain internal perusahaan (neumorphism, putih)

---

## 2. Goals & Objectives

| # | Goal | Metric |
|---|------|--------|
| G1 | Menggantikan 100% penggunaan Google Forms internal | Semua form pindah dalam 3 bulan setelah launch |
| G2 | Data form tersimpan di server lokal | 0% data tersimpan di server eksternal |
| G3 | Pengguna bisa membuat form tanpa bantuan IT | Time-to-form < 5 menit untuk form sederhana |
| G4 | Response dapat dieksport untuk pelaporan | Export CSV/Excel tersedia di setiap form |

---

## 3. Scope

### 3.1 In Scope (MVP)
- [ ] Autentikasi pengguna (login/logout, manajemen user)
- [ ] CRUD Form (buat, edit, duplikat, hapus form)
- [ ] Field types: Text, Textarea, Number, Email, Date, Dropdown, Radio, Checkbox, File Upload, **Digital Signature (Tanda Tangan Digital)**
- [ ] Preview form sebelum dipublish
- [ ] Share form via link (jaringan internal)
- [ ] Pengumpulan response (submit form beserta tanda tangan digital)
- [ ] Dashboard response (lihat, filter, hapus jawaban & preview tanda tangan)
- [ ] **Export Data & Dokumen Rapi:**
  - Export Tabular: **Excel (.xlsx)** & **CSV**
  - Export Dokumen Resmi: **PDF (.pdf)** & **Word (.docx)** lengkap dengan kop surat resmi (Logo PLN Indonesia Power dari `logo/logo-pln-indonesiapower.png`), layout tabel rapi, serta embed gambar tanda tangan digital
- [ ] Containerized deployment via Docker & Docker Compose (Ubuntu Host)

### 3.2 Out of Scope (Post-MVP)
- Conditional logic / skip logic antar field
- Multi-page / section form
- Integrasi API ke sistem eksternal lain (ERP, HRIS)
- Custom domain publik / akses publik luar jaringan
- Mobile native app (cukup web responsive)
- Notifikasi email via SMTP (ditiadakan sesuai kebutuhan internal saat ini)

---

## 4. Tech Stack

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| **Frontend** | Next.js 14+ (App Router) | React-based, SSR/SSG |
| **Styling** | Tailwind CSS | Utility-first, neumorphism custom |
| **Drag & Drop** | dnd-kit | Form builder canvas |
| **Digital Signature** | react-signature-canvas / signature_pad | Canvas touch & mouse signature pad |
| **Document Export** | **docx** (Word) & **@react-pdf/renderer** / **Puppeteer/PDFKit** (PDF) | Template tabel rapi + kop logo PLN Indonesia Power |
| **Spreadsheet Export** | **exceljs** (Excel) & csv-stringify | Format tabel rapi dan auto-fit column |
| **State Management** | Zustand | Global state form builder |
| **Form Validation** | React Hook Form + Zod | Preview & submit validation |
| **Backend** | Next.js API Routes | REST API internal |
| **ORM** | Prisma | Type-safe database access |
| **Database** | **PostgreSQL** | `10.8.140.69:5432/pltgu_formbuilder` |
| **Auth** | NextAuth.js v5 | Session-based, credentials provider |
| **File / Signature Storage** | Local filesystem (Volume Docker mount) | Upload file & signature image internal |
| **Containerization** | Docker & Docker Compose | Multi-stage build (Node Alpine), siap deploy di Ubuntu |
| **Runtime** | Node.js 20 LTS (Container) | |

### 4.1 Database Connection
```
postgresql://postgres:***@10.8.140.69:5432/pltgu_formbuilder
```
> **⚠️ Database berjalan di server internal PLTGU Cilegon. Hanya bisa diakses dari jaringan internal (10.8.x.x)**

---

## 5. User Roles & Permissions

| Role | Deskripsi | Dapat |
|------|-----------|-------|
| **Super Admin** | IT / Admin sistem | CRUD semua form & user, lihat semua response |
| **Form Creator** | Karyawan yang bisa buat form | CRUD form milik sendiri, lihat response form sendiri |
| **Responder** | Karyawan yang hanya isi form | Submit form yang dishare kepadanya |

---

## 6. User Stories

### 6.1 Form Creator

```
AS A form creator
I WANT TO drag & drop field ke canvas
SO THAT saya bisa membuat form tanpa coding

AS A form creator
I WANT TO preview form sebelum publish
SO THAT saya bisa memastikan form terlihat & berfungsi benar

AS A form creator
I WANT TO mendapatkan link form setelah publish
SO THAT saya bisa share ke responden via email/chat

AS A form creator
I WANT TO melihat semua response dalam tabel
SO THAT saya bisa menganalisis data yang masuk

AS A form creator
I WANT TO mengexport response ke Excel
SO THAT saya bisa membuat laporan
```

### 6.2 Responder

```
AS A responder
I WANT TO membuka form via link
SO THAT saya bisa mengisi form dengan mudah di browser

AS A responder
I WANT TO mendapat konfirmasi setelah submit
SO THAT saya tau form saya sudah terkirim
```

### 6.3 Super Admin

```
AS A super admin
I WANT TO mengelola daftar user
SO THAT saya bisa mengontrol siapa yang bisa membuat form

AS A super admin
I WANT TO melihat semua form yang ada
SO THAT saya bisa melakukan audit & maintenance
```

---

## 7. Database Schema

### 7.1 Entity Relationship

```
users
├── id (uuid, PK)
├── name
├── email (unique)
├── password (hashed)
├── role (super_admin | form_creator | responder)
├── is_active
├── created_at
└── updated_at

forms
├── id (uuid, PK)
├── user_id (FK → users)
├── title
├── description
├── slug (unique, untuk URL)
├── is_published
├── is_accepting_responses
├── requires_login
├── success_message
├── created_at
└── updated_at

form_fields
├── id (uuid, PK)
├── form_id (FK → forms)
├── type (text|textarea|number|email|date|dropdown|radio|checkbox|file|signature)
├── label
├── placeholder
├── is_required
├── order (integer, untuk urutan drag & drop)
├── options (jsonb, untuk dropdown/radio/checkbox)
├── validation_rules (jsonb, e.g. signatureFormat: 'png', maxSize)
├── created_at
└── updated_at

responses
├── id (uuid, PK)
├── form_id (FK → forms)
├── respondent_id (FK → users, nullable jika anonim)
├── respondent_ip
├── submitted_at
└── metadata (jsonb)

answers
├── id (uuid, PK)
├── response_id (FK → responses)
├── field_id (FK → form_fields)
├── value (text)
└── created_at
```

---

## 8. API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login dengan email & password |
| POST | `/api/auth/logout` | Logout session |
| GET | `/api/auth/me` | Get current user info |

### Forms
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/forms` | List form milik user |
| POST | `/api/forms` | Buat form baru |
| GET | `/api/forms/:id` | Detail form |
| PUT | `/api/forms/:id` | Update form |
| DELETE | `/api/forms/:id` | Hapus form |
| POST | `/api/forms/:id/publish` | Publish form |
| POST | `/api/forms/:id/duplicate` | Duplikat form |

### Fields
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/forms/:id/fields` | List fields suatu form |
| POST | `/api/forms/:id/fields` | Tambah field |
| PUT | `/api/forms/:id/fields/:fieldId` | Update field |
| DELETE | `/api/forms/:id/fields/:fieldId` | Hapus field |
| PUT | `/api/forms/:id/fields/reorder` | Reorder fields (drag & drop) |

### Responses & Exports
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/forms/:id/responses` | List response suatu form |
| POST | `/api/forms/:id/responses` | Submit response (public/internal) |
| GET | `/api/forms/:id/responses/:responseId` | Detail 1 response beserta signature |
| GET | `/api/forms/:id/export/excel` | Export spreadsheet Excel (.xlsx) |
| GET | `/api/forms/:id/export/csv` | Export data CSV |
| GET | `/api/forms/:id/export/pdf` | Export dokumen PDF rekap/individual dengan kop logo PLN IP & tabel rapi |
| GET | `/api/forms/:id/export/word` | Export dokumen Word (.docx) berformat tabel dinamis & kop logo PLN IP |
| DELETE | `/api/forms/:id/responses/:responseId` | Hapus response |

### Admin
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/admin/users` | List semua user |
| POST | `/api/admin/users` | Buat user baru |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Hapus user |

---

## 9. Non-Functional Requirements

| # | Requirement | Target |
|---|-------------|--------|
| NFR1 | **Performance** | Halaman load < 2 detik |
| NFR2 | **Availability** | 99% uptime (jam kerja) |
| NFR3 | **Security** | Auth required untuk create/manage form |
| NFR4 | **Data Privacy** | Semua data di server lokal PLTGU |
| NFR5 | **Browser Support** | Chrome, Firefox, Edge (versi 2 tahun terakhir) |
| NFR6 | **Responsive** | Desktop-first, mobile-friendly |
| NFR7 | **Backup** | Database backup otomatis harian |

---

## 10. Milestones & Timeline

```
Phase 1 — Foundation (Week 1-2)
├── Setup project (Next.js, Prisma, PostgreSQL)
├── Auth system (login, role, session)
└── Database schema & migration

Phase 2 — Form Builder Core (Week 3-5)
├── Canvas drag & drop (dnd-kit)
├── Semua field types
├── Form settings (title, desc, slug)
└── Preview mode

Phase 3 — Publish & Response (Week 6-7)
├── Publish form & generate link
├── Public form page (submit response)
└── Response dashboard & tabel

Phase 4 — Export & Polish (Week 8)
├── Export CSV & Excel
├── Signature preview & storage handling
├── UI polish & neumorphism refinement
└── Bug fix & testing

Phase 5 — Containerization & Deployment (Week 9)
├── Dockerfile multi-stage (Next.js standalone + Node Alpine)
├── docker-compose.yml configuration
├── Volume mapping untuk uploads & signature files
├── Testing running di Ubuntu Server
├── User training & handover
└── Go-live
```

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Server internal down | Medium | High | Healthcheck container Docker + auto restart `unless-stopped` |
| User adoption rendah | Medium | Medium | Training & panduan pembuatan form interaktif |
| Database migration error | Low | High | Backup database sebelum migrate (`pg_dump`) |
| Penyimpanan tanda tangan/file penuh | Low | Medium | Mount volume host disk & batasi size file canvas |

---

## 12. Project Parameters (Decided)

- **Target Jaringan:** Jaringan Lokal / On-premise internal PLTGU Cilegon (akses via IP/Hostname internal).
- **Target OS / Deployment:** Docker & Docker Compose di Ubuntu Server.
- **Notifikasi Email:** Tidak diperlukan saat ini (notifikasi in-app / dashboard).
- **Kapasitas Pengguna:** 50+ user aktif simultan.
- **Database Target:** `postgresql://postgres:***@10.8.140.69:5432/pltgu_formbuilder`.
- **Fitur Khusus:** Digital Signature Pad (mouse & touch support, autosave ke PNG/base64/file path) terintegrasi langsung di form submission & review.

# UI Design — PLTGU Cilegon Form Builder
> **Style:** Neumorphism · Palette Putih · Desktop-first  
> **Version:** 1.0.0 · October 2026

---

## 1. Design Philosophy

**Neumorphism** (soft UI) adalah pendekatan desain yang menciptakan elemen-elemen yang terlihat "timbul" atau "tertekan" dari permukaan menggunakan teknik dual-shadow. 

**Prinsip utama:**
- Elemen terasa **tangible** — seperti bisa dipegang
- Kontras **subtle** — tidak harsh, nyaman dilihat lama
- Feedback visual jelas — pressed state, hover state
- Warna **monokromatik** dominan putih/abu sangat muda

---

## 2. Color Palette

```
Primary Background   → #E8EDF2  (soft off-white, base semua surface)
Surface              → #E8EDF2  (sama dengan background = efek neu)
Shadow Dark          → #C5CDD8  (bayangan gelap, kanan-bawah)
Shadow Light         → #FFFFFF  (bayangan terang, kiri-atas)
Text Primary         → #2D3748  (dark slate, readable)
Text Secondary       → #718096  (medium gray)
Text Placeholder     → #A0AEC0  (light gray)

Accent Blue          → #4A90D9  (primary action, tombol utama)
Accent Blue Light    → #EBF4FF  (background highlight)
Accent Green         → #48BB78  (sukses, published)
Accent Red           → #F56565  (error, hapus)
Accent Orange        → #ED8936  (warning, draft)
Accent Purple        → #9F7AEA  (badge role, tags)
```

> **Catatan:** Jangan gunakan `#FFFFFF` murni sebagai background utama —  
> shadow neumorphism tidak akan kelihatan di atas pure white.

---

## 3. Typography

```css
/* Font Stack */
font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;

/* Scale */
--text-xs:   0.75rem;   /* 12px — label kecil, badge */
--text-sm:   0.875rem;  /* 14px — body kecil, caption */
--text-base: 1rem;      /* 16px — body utama */
--text-lg:   1.125rem;  /* 18px — subtitle */
--text-xl:   1.25rem;   /* 20px — heading kecil */
--text-2xl:  1.5rem;    /* 24px — heading section */
--text-3xl:  1.875rem;  /* 30px — page title */
--text-4xl:  2.25rem;   /* 36px — hero title */

/* Weight */
--font-normal:   400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
```

---

## 4. Neumorphism Shadow System

### 4.1 Tailwind Custom Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        neu: {
          base:    '#E8EDF2',
          dark:    '#C5CDD8',
          light:   '#FFFFFF',
          text:    '#2D3748',
          muted:   '#718096',
          accent:  '#4A90D9',
        }
      },
      boxShadow: {
        // Raised — elemen timbul
        'neu':         '8px 8px 16px #C5CDD8, -8px -8px 16px #FFFFFF',
        'neu-sm':      '4px 4px 8px #C5CDD8, -4px -4px 8px #FFFFFF',
        'neu-lg':      '12px 12px 24px #C5CDD8, -12px -12px 24px #FFFFFF',
        // Inset — elemen tertekan (active/input)
        'neu-inset':   'inset 6px 6px 12px #C5CDD8, inset -6px -6px 12px #FFFFFF',
        'neu-inset-sm':'inset 3px 3px 6px #C5CDD8, inset -3px -3px 6px #FFFFFF',
        // Flat — untuk hover state
        'neu-flat':    '2px 2px 4px #C5CDD8, -2px -2px 4px #FFFFFF',
        // None
        'neu-none':    'none',
      },
      borderRadius: {
        'neu': '16px',
        'neu-sm': '10px',
        'neu-lg': '24px',
        'neu-xl': '32px',
        'neu-full': '9999px',
      }
    }
  }
}
```

### 4.2 CSS Variables

```css
/* globals.css */
:root {
  --neu-bg:       #E8EDF2;
  --neu-dark:     #C5CDD8;
  --neu-light:    #FFFFFF;
  --neu-radius:   16px;
  --neu-radius-sm: 10px;
  --neu-radius-lg: 24px;
}

body {
  background-color: var(--neu-bg);
  color: #2D3748;
  font-family: 'Inter', system-ui, sans-serif;
}
```

---

## 5. Core Components

### 5.1 NeuCard

```tsx
// Raised card — container utama
<div className="bg-[#E8EDF2] rounded-neu shadow-neu p-6">
  {children}
</div>

// Pressed card — untuk input container
<div className="bg-[#E8EDF2] rounded-neu shadow-neu-inset p-4">
  {children}
</div>
```

**Visual:**
```
╔══════════════════════════════╗  ← shadow light kiri-atas
║                              ║
║   Card Content               ║
║                              ║
╚══════════════════════════════╝  ← shadow dark kanan-bawah
```

---

### 5.2 NeuButton

```tsx
// Primary Button
<button className="
  bg-[#E8EDF2] rounded-neu-full
  shadow-neu hover:shadow-neu-flat active:shadow-neu-inset
  px-6 py-3 font-semibold text-neu-accent
  transition-all duration-150
">
  Buat Form
</button>

// Danger Button
<button className="
  bg-[#E8EDF2] rounded-neu-full
  shadow-neu hover:shadow-neu-flat active:shadow-neu-inset
  px-6 py-3 font-semibold text-red-500
  transition-all duration-150
">
  Hapus
</button>

// Icon Button
<button className="
  w-10 h-10 rounded-neu
  shadow-neu hover:shadow-neu-flat active:shadow-neu-inset
  flex items-center justify-center
  transition-all duration-150
">
  <PlusIcon />
</button>
```

**States:**
| State | Shadow |
|-------|--------|
| Default | `shadow-neu` (raised) |
| Hover | `shadow-neu-flat` (slightly raised) |
| Active/Pressed | `shadow-neu-inset` (pressed in) |
| Disabled | `opacity-50 cursor-not-allowed` |

---

### 5.3 NeuInput

```tsx
<div className="space-y-1">
  <label className="text-sm font-medium text-[#718096]">
    Label Field
  </label>
  <div className="bg-[#E8EDF2] rounded-neu-sm shadow-neu-inset">
    <input
      className="
        w-full bg-transparent px-4 py-3
        text-[#2D3748] placeholder-[#A0AEC0]
        focus:outline-none
        rounded-neu-sm
      "
      placeholder="Ketik di sini..."
    />
  </div>
</div>
```

---

### 5.4 NeuToggle / Switch

```tsx
// Active state
<div className="w-12 h-6 rounded-full shadow-neu-inset bg-[#E8EDF2] relative">
  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-[#4A90D9] shadow-neu-sm" />
</div>

// Inactive state
<div className="w-12 h-6 rounded-full shadow-neu-inset bg-[#E8EDF2] relative">
  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-[#A0AEC0] shadow-neu-sm" />
</div>
```

---

### 5.5 NeuBadge / Chip

```tsx
<span className="
  px-3 py-1 rounded-neu-full
  shadow-neu-sm text-xs font-semibold
  text-[#4A90D9]
">
  Published
</span>
```

---

### 5.6 NeuSignaturePad (Tanda Tangan Digital)

Komponen interaktif untuk tanda tangan menggunakan mouse, stylus, atau sentuhan jari di layar sentuh/mobile:

```tsx
<div className="space-y-2">
  <div className="flex justify-between items-center">
    <label className="text-sm font-medium text-[#718096]">
      Tanda Tangan Digital <span className="text-red-500">*</span>
    </label>
    <button 
      type="button" 
      onClick={handleClearSignature}
      className="text-xs text-[#718096] hover:text-red-500 underline"
    >
      Hapus / Ulangi
    </button>
  </div>
  
  {/* Neumorphic Inset Canvas Area */}
  <div className="bg-[#E8EDF2] rounded-neu-sm shadow-neu-inset p-2 relative">
    <canvas 
      ref={canvasRef} 
      className="w-full h-40 rounded-neu-sm bg-transparent cursor-crosshair touch-none"
    />
    <div className="absolute bottom-3 left-4 text-xs text-[#A0AEC0] pointer-events-none select-none">
      ✍️ Tanda tangan di area ini (Touch / Mouse)
    </div>
  </div>
</div>
```

---

## 6. Page Layouts

### 6.1 App Shell

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px, fixed)     │  MAIN CONTENT (flex-1)        │
│  ┌─────────────────────┐   │  ┌──────────────────────────┐ │
│  │  🏭 PLTGU Form      │   │  │  Header / Breadcrumb     │ │
│  │  ─────────────────  │   │  ├──────────────────────────┤ │
│  │  📋 Dashboard       │   │  │                          │ │
│  │  📝 My Forms        │   │  │  Page Content            │ │
│  │  📊 Analytics       │   │  │                          │ │
│  │  ⚙️  Settings       │   │  │                          │ │
│  │  ─────────────────  │   │  └──────────────────────────┘ │
│  │  👤 User Profile    │   │                               │
│  └─────────────────────┘   │                               │
└─────────────────────────────────────────────────────────────┘
```

**Sidebar** → `bg-[#E8EDF2] shadow-neu` (raised dari background)  
**Main content** → `bg-[#E8EDF2]` (flat, sama dengan bg)

---

### 6.2 Dashboard / Forms List

```
┌──────────────────────────────────────────────────────────┐
│  My Forms                          [+ Buat Form Baru]    │
├──────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │ Form Card  │  │ Form Card  │  │ Form Card  │          │
│  │            │  │            │  │            │          │
│  │ 📋 Title   │  │ 📋 Title   │  │ 📋 Title   │          │
│  │ 5 fields   │  │ 8 fields   │  │ 3 fields   │          │
│  │ 12 resp.   │  │ 0 resp.    │  │ 45 resp.   │          │
│  │ ● Published│  │ ○ Draft    │  │ ● Published│          │
│  │            │  │            │  │            │          │
│  │ Edit  View │  │ Edit  View │  │ Edit  View │          │
│  └────────────┘  └────────────┘  └────────────┘          │
└──────────────────────────────────────────────────────────┘
```

**Form Card** → `shadow-neu rounded-neu` dengan hover `shadow-neu-lg` (lebih timbul)

---

### 6.3 Form Builder

```
┌────────────────────────────────────────────────────────────────────┐
│  ← Back   "Nama Form"   [Preview]  [Settings]  [Publish]           │
├──────────────────┬─────────────────────────────┬───────────────────┤
│  FIELD PALETTE   │  CANVAS (drop zone)          │  PROPERTIES       │
│  (200px)         │                              │  PANEL (280px)    │
│  ┌────────────┐  │  ┌──────────────────────┐   │  (muncul saat     │
│  │ Text Field │  │  │ ☰  Short Text        │   │   field dipilih)  │
│  │ Long Text  │  │  │    [_______________] │   │                   │
│  │ Number     │  │  ├──────────────────────┤   │  Label:           │
│  │ Email      │  │  │ ☰  Dropdown          │   │  [___________]    │
│  │ Date       │  │  │    [▼ Pilih...]      │   │                   │
│  │ Dropdown   │  │  ├──────────────────────┤   │  Required: [●]    │
│  │ Radio      │  │  │ ☰  Multiple Choice   │   │                   │
│  │ Checkbox   │  │  │    ○ Option 1        │   │  Placeholder:     │
│  │ File Upload│  │  │    ○ Option 2        │   │  [___________]    │
│  └────────────┘  │  │    + Add option      │   │                   │
│                  │  └──────────────────────┘   │  Options:         │
│  Drop field      │  [+ Add Field]               │  • Option 1 [✕]  │
│  ke canvas →     │                              │  • Option 2 [✕]  │
│                  │                              │  [+ Add]          │
└──────────────────┴─────────────────────────────┴───────────────────┘
```

**Canvas** → `shadow-neu-inset` (terasa seperti "lubang" tempat field diletakkan)  
**Field Items** → `shadow-neu-sm` (sedikit timbul, bisa di-drag)  
**Field Palette** → `shadow-neu` (panel timbul di kiri)  
**Properties Panel** → `shadow-neu` (panel timbul di kanan)

---

### 6.4 Public Form (Responder View)

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│         ┌──────────────────────────────────┐           │
│         │  [LOGO PLN INDONESIA POWER]      │           │
│         │  PLTGU CILEGON O&M SERVICES      │           │
│         │  ──────────────────────────────  │           │
│         │                                  │           │
│         │  📋 Judul Form                   │           │
│         │  Deskripsi singkat form...        │           │
│         │                                  │           │
│         │  ── Field 1: Nama Lengkap ───── │           │
│         │  Label *                          │           │
│         │  ┌────────────────────────────┐  │           │
│         │  │                            │  │           │
│         │  └────────────────────────────┘  │           │
│         │                                  │           │
│         │  ── Field 2: Tanda Tangan ─────  │           │
│         │  [ Canvas Neu-Inset Signature ]  │           │
│         │                                  │           │
│         │           [  Submit  ]            │           │
│         └──────────────────────────────────┘           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

Form card di tengah → `shadow-neu-lg rounded-neu-xl` (raised besar, card utama)  
Max width: `max-w-2xl mx-auto`  
Logo resmi ditarik dari `/logo/logo-pln-indonesiapower.png`.

---

### 6.5 Response Dashboard & Document Export

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Responses — "Nama Form"      [📥 Excel] [📄 Word .docx] [📑 PDF]       │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                                   │
│  │ 45      │  │  12     │  │  Today  │                                   │
│  │ Total   │  │  This   │  │    3    │                                   │
│  │ Responses│ │  Week   │  │         │                                   │
│  └─────────┘  └─────────┘  └─────────┘                                   │
├──────────────────────────────────────────────────────────────────────────┤
│  [Search...]  [Filter: All ▼]                                             │
├──────────────────────────────────────────────────────────────────────────┤
│  # │ Submitted At        │ Field 1 │ Tanda Tangan │ Action               │
│  ──┼─────────────────────┼─────────┼──────────────┼───────────────────── │
│  1 │ 2026-10-15 09:30    │ Budi S. │  [✍️ Preview] │ 👁 📑PDF 📄DOCX 🗑   │
│  2 │ 2026-10-15 10:15    │ Ani W.  │  [✍️ Preview] │ 👁 📑PDF 📄DOCX 🗑   │
└──────────────────────────────────────────────────────────────────────────┘
```

**Fitur Export Dokumen (Word & PDF):**
- **Kop Surat Otomatis:** Memuat Header resmi dengan **Logo PLN Indonesia Power**, nama unit PLTGU Cilegon, dan garis pemisah formal.
- **Tabel Data Rapi:** Border clean, zebra striping tipis, padding proporsional, serta cell alignment yang rapi.
- **Embedded Digital Signature:** Tanda tangan digital otomatis ter-render rapi pada kolom verifikasi/pengesahan dokumen.

Stats cards → `shadow-neu rounded-neu`  
Table container → `shadow-neu-inset rounded-neu` (terasa seperti di-embed/tertekan)

---

## 7. Field Components (in Form Builder)

### Field Item (Canvas)

```tsx
// Field yang sudah ada di canvas
<div className="
  group bg-[#E8EDF2] rounded-neu-sm shadow-neu-sm
  p-4 cursor-grab active:cursor-grabbing
  hover:shadow-neu transition-all duration-200
  border-l-4 border-transparent hover:border-[#4A90D9]
">
  <div className="flex items-center gap-3">
    <GripIcon className="text-[#A0AEC0] group-hover:text-[#718096]" />
    <span className="font-medium text-[#2D3748]">Nama Field</span>
    <span className="text-xs text-[#A0AEC0] ml-1">(Text)</span>
    {isRequired && <span className="text-red-400 text-xs">*Required</span>}
    <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100">
      <button>✏️</button>
      <button>🗑️</button>
    </div>
  </div>
</div>
```

### Drag Overlay (while dragging)

```tsx
<div className="
  bg-[#E8EDF2] rounded-neu-sm
  shadow-[12px_12px_24px_#C5CDD8,-12px_-12px_24px_#FFFFFF]
  opacity-90 rotate-1 scale-105
  p-4
">
  {/* field content */}
</div>
```

---

## 8. Iconography

Gunakan **Lucide React** — clean, consistent, modern.

```bash
npm install lucide-react
```

| Context | Icon |
|---------|------|
| Form list | `FileText` |
| Add field | `Plus` |
| Delete | `Trash2` |
| Edit | `Pencil` |
| Drag handle | `GripVertical` |
| Published | `CheckCircle` |
| Draft | `Clock` |
| Share/Link | `Link2` |
| Export | `Download` |
| Settings | `Settings2` |
| User | `UserCircle` |
| Response | `BarChart3` |
| Duplicate | `Copy` |

---

## 9. Animation & Transitions

```css
/* Semua interactive element */
transition: all 150ms ease-in-out;

/* Card hover */
transition: box-shadow 200ms ease, transform 200ms ease;

/* Drag & Drop */
/* Pakai dnd-kit built-in animation */

/* Page transition */
/* Next.js default (instant) — bisa tambah Framer Motion nanti */
```

**Prinsip:**
- Animasi **cepat** (100-200ms) — tidak terasa lambat
- Jangan animasi berlebihan — neumorphism sudah cukup "kaya" secara visual
- `transform: scale(1.02)` subtle pada hover card

---

## 10. Responsive Breakpoints

| Breakpoint | Width | Penyesuaian |
|------------|-------|-------------|
| Mobile | < 640px | Sidebar collapse jadi drawer bottom |
| Tablet | 640-1024px | Sidebar hidden, toggle button |
| Desktop | > 1024px | Full sidebar visible |

> **Desktop-first** — Form builder dengan drag & drop memerlukan layar lebar minimum 1280px untuk pengalaman optimal.

---

## 11. Component Library Structure

```
src/
├── components/
│   ├── ui/                    ← Base neumorphism components
│   │   ├── NeuCard.tsx
│   │   ├── NeuButton.tsx
│   │   ├── NeuInput.tsx
│   │   ├── NeuSelect.tsx
│   │   ├── NeuToggle.tsx
│   │   ├── NeuBadge.tsx
│   │   ├── NeuModal.tsx
│   │   ├── NeuTable.tsx
│   │   └── NeuSignaturePad.tsx   ← Canvas pad untuk tanda tangan digital
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── form-builder/
│   │   ├── BuilderCanvas.tsx
│   │   ├── FieldPalette.tsx
│   │   ├── FieldItem.tsx
│   │   ├── PropertiesPanel.tsx
│   │   └── fields/
│   │       ├── TextField.tsx
│   │       ├── SelectField.tsx
│   │       ├── RadioField.tsx
│   │       ├── CheckboxField.tsx
│   │       ├── FileField.tsx
│   │       └── SignatureField.tsx  ← Drag & drop element tanda tangan
│   └── forms/
│       ├── FormCard.tsx
│       ├── FormPreview.tsx
│       ├── FormSubmitRenderer.tsx
│       └── ResponseTable.tsx
```

---

## 12. Accessibility

- Semua interactive element punya `focus-visible` ring: `ring-2 ring-[#4A90D9] ring-offset-2 ring-offset-[#E8EDF2]`
- Label selalu terhubung ke input via `htmlFor` / `id`
- Drag & drop punya keyboard alternative
- Color contrast ratio minimum 4.5:1 untuk text
- Loading state dengan skeleton (neumorphism shimmer)

```css
/* Neumorphism Skeleton Shimmer */
@keyframes neu-shimmer {
  0% { box-shadow: 8px 8px 16px #C5CDD8, -8px -8px 16px #FFFFFF; }
  50% { box-shadow: 4px 4px 8px #C5CDD8, -4px -4px 8px #FFFFFF; }
  100% { box-shadow: 8px 8px 16px #C5CDD8, -8px -8px 16px #FFFFFF; }
}
.skeleton { animation: neu-shimmer 1.5s ease-in-out infinite; }
```

# Dalanta - Progress & Context Tracker

> **Proyek**: Jasa Kurir Lokal & On-Demand Delivery Web App (MVP)  
> **Versi**: 1.0.0 (MVP)  
> **Target**: Mobile-First Web App, Dashboard Kurir, & Hybrid Interaction  
> **Dokumen Acuan**: [PRD PDF](docs/local_courier_app_prd.pdf)

---

## 1. Ringkasan & Filosofi Proyek (Context for AI & Developers)

**Dalanta** adalah aplikasi web kurir lokal yang dirancang khusus untuk memfasilitasi kebutuhan pengantaran barang dan titip beli (*errand service*) dari penjual online rumahan (misal grup Facebook) dan pembeli perorangan.

### Karakteristik & Pendekatan Utama:
1. **Pendekatan Hibrida (Hybrid Flow)**:
   - Pengguna menyukai kepraktisan formulir digital -> Mengisi **Formulir Mandiri**.
   - Pengguna menyukai interaksi personal -> Mengklik **Pintasan WhatsApp** dengan pesan otomatis.
2. **Mobile-First & Ultra Responsive**: Pengguna dan kurir mengakses sebagian besar melalui smartphone.
3. **Real-time Lifecycle**: Kurir dapat melihat pesanan masuk secara langsung dan memperbarui status secara cepat saat di jalan.
4. **Batasan MVP**:
   - Pembayaran manual: Cash on Delivery (COD) atau Transfer Bank/E-Wallet langsung ke kurir (tanpa payment gateway).
   - Operasional armada difokuskan pada single-driver (kurir utama) terlebih dahulu.

---

## 2. Tech Stack Aktif

- **Frontend**: Vite + React 19
- **Styling**: Tailwind CSS v4 (@tailwindcss/vite)
- **Backend & Realtime**: Direkomendasikan Supabase (PostgreSQL + Realtime) / Local State Mocking (untuk tahap testing UI)
- **Icons & UI Helpers**: Lucide React / SVG modern
- **Deployment Target**: Vercel / Netlify

---

## 3. Modul & Spesifikasi Fungsional

### Modul A: Landing Page & Form Publik (Customer)
- [ ] **Dual Action Hero**: Pilihan interaktif "Isi Form Pemesanan" atau "Order Cepat via WhatsApp".
- [ ] **Formulir Pemesanan Mandiri**:
  - Nama Pengirim / Pemesan
  - Nomor WhatsApp (aktif untuk konfirmasi)
  - Alamat Jemput (Pickup) + Catatan detail
  - Alamat Tujuan (Drop-off) + Catatan detail
  - Catatan Khusus / Talangan Belanja (jika titip beli barang)
- [ ] **Submit Handler**: Mengirimkan data ke antrean pesanan kurir secara instan.
- [ ] **WhatsApp Direct Button**: Format pesan dinamis otomatis (Halo Dalanta, saya ingin menggunakan jasa kurir...).

### Modul B: Dashboard Kurir (Driver Partner)
- [ ] **Feed Pesanan Masuk (Real-time Order Feed)**: Daftar kartu pesanan terurut waktu masuk.
- [ ] **Input Manual Pesanan WhatsApp**: Form cepat bagi kurir untuk menginput orderan yang masuk via WA agar tetap masuk rekap.
- [ ] **Navigasi Peta Cepat (Quick Maps)**:
  - Tombol pintas ke Google Maps rute jemput (https://www.google.com/maps/dir/?api=1&destination=...).
  - Tombol pintas ke Google Maps rute antar.
- [ ] **Order Lifecycle State Manager**:
  - pending (Pesanan Baru Masuk)
  - picking_up (Kurir Menuju Lokasi Jemput)
  - delivering (Barang dalam Perjalanan ke Tujuan)
  - completed (Selesai & Pembayaran Diterima)
- [ ] **Filter & Rekap Harian**: Ringkasan jumlah pengantaran dan total omzet/talangan harian.

---

## 4. Checklist Progress Pengembangan

- [x] **Fase 1: Setup & Inisialisasi Projek**
  - [x] Inisialisasi repositori Vite + React (dalanta)
  - [x] Konfigurasi Tailwind CSS v4
  - [x] Validasi build & dev server
  - [x] Pembuatan folder dokumentasi (docs/) & penempatan PRD PDF
  - [x] Pembuatan dokumen pelacak progress & instruksi AI (PROGRESS.md & AGENTS.md)
  - [x] Integrasi antislop (.agents/skills/antislop* & rule pointers di AGENTS.md)

- [ ] **Fase 2: Arsitektur Data & Mock State / Backend**
  - [x] Definisikan skema data Order (src/models/order.js)
  - [x] Siapkan service penyimpanan & state store (src/context/OrderContext.jsx dengan auto-sync localStorage)
  - [x] Implementasi initial mock data untuk pengujian flow kurir & pelanggan (src/data/mockOrders.js)

- [ ] **Fase 3: Implementasi Modul A (Customer Facing)**
  - [x] Desain Mobile-First Landing page yang modern, bersih, dan meyakinkan
  - [x] Komponen Dual Action Hero (src/components/HeroDualAction.jsx)
  - [x] Komponen Form Pemesanan Interaktif dengan validasi (src/components/OrderForm.jsx)
  - [x] Feedback state saat order terkirim (src/components/OrderSuccessModal.jsx)
  - [x] Tombol CTA WhatsApp floating / fixed (src/components/FloatingWhatsAppCTA.jsx)

- [ ] **Fase 4: Implementasi Modul B (Courier Dashboard)**
  - [x] Tampilan Feed Pesanan berbasis kartu (src/components/CourierDashboard.jsx)
  - [x] Tombol pengubah status interaktif (Pending -> Picking Up -> Delivering -> Completed)
  - [x] Shortcut Google Maps & tombol hubungi pelanggan via WA
  - [x] Modal/Form tambah order manual dari WA

- [ ] **Fase 5: Polishing, Testing & Integrasi Realtime**
  - [ ] Pengujian responsivitas mobile di berbagai ukuran layar
  - [ ] Penyesuaian tema dan micro-interactions
  - [ ] Panduan deployment ke Vercel / Netlify

---

## 5. Log Perubahan (Changelog)

### [2026-10-18 - Milestone 2 & 3: UI Pelanggan & Dashboard Kurir Selesai]
- Menyelesaikan seluruh komponen Modul A (Header, HeroDualAction, OrderForm, OrderSuccessModal, FloatingWhatsAppCTA).
- Menyelesaikan seluruh komponen Modul B (CourierDashboard, Order Feed Cards, Quick Google Maps, WhatsApp Chat Action, Status Lifecycle Advancer, Modal Input Manual WA).
- Mengintegrasikan antislop UX: Kontras warna tinggi, touch target mobile >= 44px, teks manusiawi khas Indonesia.
- Memvalidasi build Vite produksi sukses.

### [2026-10-18 - Milestone 1: Arsitektur Data & State Selesai]
- Menyelesaikan Milestone 1: pembuatan src/models/order.js, data mock realistis src/data/mockOrders.js, dan src/context/OrderContext.jsx.
- Membungkus root aplikasi dengan OrderProvider di src/main.jsx.
- Menginstal package ikon lucide-react.
- Memvalidasi build produksi tanpa error.

### [2026-10-18]
- Inisialisasi dasar projek Vite + React 19 + Tailwind CSS v4 di D:\Documents\web_project\Dalanta.
- Menyimpan dokumen spesifikasi kebutuhan di docs/local_courier_app_prd.pdf.
- Membuat file PROGRESS.md dan AGENTS.md sebagai panduan AI Agent dan tracking roadmap pengembangan.
- Mengintegrasikan ruleset antislop ke direktori .agents/skills dan mengonfigurasi pointer di AGENTS.md agar desain UI, copywriting, dan kode bebas dari template AI slop.



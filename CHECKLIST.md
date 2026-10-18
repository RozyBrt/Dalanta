# Dalanta MVP - Checklist & Roadmap Pengerjaan

Dokumen ini adalah panduan eksekusi bertahap untuk membangun **Dalanta** (Web App Kurir Lokal & On-Demand Delivery) sesuai dengan spesifikasi PRD.

---

## 📌 Rekomendasi Urutan Pengerjaan (Mengapa & Apa yang Dimulai Lebih Dulu?)

### 1. Titik Awal: **Fondasi Data & State Management (Store & Mock Data)**
> **Alasan**: Aplikasi ini memiliki 2 sisi yang saling berhubungan erat: **Pelanggan** (yang membuat order) dan **Kurir** (yang mengeksekusi order). Jika kita menyiapkan struktur data dan store (misalnya dengan Context/LocalStorage/Mock Realtime) terlebih dahulu, maka begitu UI dibuat, aplikasi langsung hidup dan bisa diuji alur lengkapnya end-to-end tanpa menunggu database backend jadi.

### 2. Langkah Kedua: **Modul A - Halaman Publik & Form Pemesanan (Customer Facing)**
> **Alasan**: Ini adalah pintu masuk bisnis. Pelanggan harus bisa memilih antara mengisi formulir mandiri atau langsung klik tombol WhatsApp kurir dengan template pesan otomatis.

### 3. Langkah Ketiga: **Modul B - Dashboard Kurir (Driver Partner)**
> **Alasan**: Begitu pesanan masuk dari Modul A, kurir butuh antarmuka mobile yang ringkas untuk melihat daftar pesanan, membuka rute Google Maps sekali klik, memperbarui status pengiriman (Pending → Picking Up → Delivering → Completed), serta menginput pesanan manual yang masuk lewat chat WhatsApp.

### 4. Langkah Keempat: **Integrasi Backend Real-time (Supabase / Firebase)**
> **Alasan**: Menghubungkan penyimpanan lokal ke database cloud real-time agar ketika pelanggan submit form dari HP mereka, pesanan langsung muncul seketika di layar HP kurir via WebSocket.

### 5. Langkah Kelima: **Polishing, Standar Anti-Slop & Deployment**
> **Alasan**: Memastikan kontras layar nyaman dipakai kurir di luar ruangan, ergonomi sentuhan di mobile mantap, teks komunikatif khas lokal, dan siap online di Vercel/Netlify.

---

## 📋 Checklist Eksekusi Bertahap

### Milestone 0: Setup Lingkungan & Guardrails [SELESAI]
- [x] Inisialisasi Vite + React 19 + Tailwind CSS v4
- [x] Setup folder dokumentasi docs/ dan penempatan PRD PDF
- [x] Konfigurasi instruksi AI (AGENTS.md & PROGRESS.md)
- [x] Integrasi ruleset nti-slop di .agents/skills/

---

### Milestone 1: Arsitektur Data, Model & State Store [SELESAI]
- [x] **Definisi Model Data Order**:
  - id: Unique order identifier (e.g. DLT-101)
  - customerName: Nama pemesan
  - customerPhone: Nomor WhatsApp pemesan
  - pickupAddress: Alamat jemput + detail/patokan
  - dropoffAddress: Alamat antar/tujuan + detail/patokan
  - serviceType: delivery (Antar Paket) atau errand (Titip Beli / Belanja)
  - ailoutAmount: Estimasi dana talangan belanja (opsional jika titip beli)
  - 
otes: Catatan khusus untuk kurir
  - status: 'pending' | 'picking_up' | 'delivering' | 'completed'
  - source: 'form' | 'whatsapp_manual'
  - createdAt: Timestamp pesanan masuk
  - updatedAt: Timestamp perubahan status terakhir
- [x] **State Manager / Storage Service**:
  - Buat src/context/OrderContext.jsx atau custom hook penyimpanan
  - Dukungan auto-sync ke localStorage (sehingga data tidak hilang saat refresh)
  - Fungsi: createOrder(), updateOrderStatus(), deleteOrder(), createManualOrder()
  - Initial dummy/mock data untuk keperluan preview pengujian

---

### Milestone 2: Modul A - Halaman Publik & Form Pemesanan (Customer) [PRIORITAS BERIKUTNYA]
- [ ] **Komponen Header & Branding Dalanta**:
  - Logo/Identitas Dalanta yang bersih dan profesional
  - Badge status ketersediaan kurir (*"Kurir Siap Melayani"* / Jam Operasional)
- [ ] **Komponen Dual Action Hero**:
  - Pilihan cepat: **Isi Form Pemesanan** vs **Chat WhatsApp Langsung**
- [ ] **Komponen Formulir Pemesanan Mandiri**:
  - Input nama & nomor WhatsApp (dengan tombol validasi format nomor)
  - Pilihan jenis layanan: Antar Paket vs Titip Beli (Errand)
  - Input alamat penjemputan (Pickup) + catatan patokan
  - Input alamat pengantaran (Drop-off) + catatan patokan
  - Input opsional: Estimasi talangan belanja & detail barang titipan
  - Tombol Submit dengan indikator loading dan validasi interaktif
- [ ] **Tombol Pintasan WhatsApp Otomatis (Direct Order)**:
  - Tombol aksi utama dengan tautan langsung ke nomor WhatsApp kurir
  - Template pesan otomatis rapi:
    `	ext
    Halo Dalanta Kurir, saya ingin order:
    Nama: 
    Layanan: Titip Beli / Kirim Paket
    Lokasi Jemput: 
    Lokasi Antar: 
    Catatan: 
    `
- [ ] **Konfirmasi Pemesanan (Success State / Modal)**:
  - Tampilan ringkasan pesanan setelah form dikirim
  - Tombol untuk konfirmasi ke WhatsApp kurir bahwa form sudah diisi
  - Indikator status pesanan awal (Pending)

---

### Milestone 3: Modul B - Dashboard Kurir (Driver Partner)
- [ ] **Navigasi / Switch Mode Kurir**:
  - Tombol toggle/navigasi yang mudah diakses kurir (misal header toggle atau route /kurir)
- [ ] **Summary Cards (Statistik Cepat Hari Ini)**:
  - Total pesanan hari ini
  - Pesanan aktif (Pending / On the way)
  - Pesanan selesai & total talangan tercatat
- [ ] **Feed Pesanan Masuk (Order Feed)**:
  - Daftar kartu pesanan (Order Cards) dengan badge status warna berkontras tinggi
  - Filter pesanan berdasarkan status (Semua, Baru Masuk, Dalam Proses, Selesai)
- [ ] **Aksi Cepat Tiap Pesanan (Driver Quick Actions)**:
  - 🗺️ **Shortcut Google Maps**:
    - Tombol *"Rute Jemput"* (membuka Google Maps turn-by-turn ke alamat pickup)
    - Tombol *"Rute Antar"* (membuka Google Maps turn-by-turn ke alamat drop-off)
  - 💬 **Hubungi Pemesan**:
    - Tombol 1-klik buka chat WhatsApp ke nomor pelanggan
  - 🔄 **Lifecycle Status Controller**:
    - Tombol transisi bertahap:
      - Pending ➔ Klik *"Mulai Jemput"* ➔ Picking Up
      - Picking Up ➔ Klik *"Barang Diambil & Berangkat"* ➔ Delivering
      - Delivering ➔ Klik *"Selesai & Diterima"* ➔ Completed
- [ ] **Pencatatan Manual Pesanan WhatsApp**:
  - Tombol *"Tambah Order Manual (via WA)"*
  - Modal form kilat agar order yang masuk lewat chat langsung tetap rapi tercatat di pembukuan kurir

---

### Milestone 4: Integrasi Database Real-time (Supabase / Firebase)
- [ ] Setup proyek Supabase gratis atau Firebase Realtime DB
- [ ] Buat tabel/koleksi orders dengan RLS (Row Level Security) yang sesuai
- [ ] Implementasi listener WebSocket / Supabase Realtime di Dashboard Kurir
- [ ] Notifikasi suara / visual saat ada pesanan baru masuk dari formulir

---

### Milestone 5: Pengujian, Polish Anti-Slop, & Deployment
- [ ] **Audit Ergonomi Mobile**:
  - Ukuran tombol minimal 44×44px untuk kenyamanan jempol saat di motor/jalan
  - Validasi kontras teks & badge agar tetap jelas di bawah sinar matahari
  - Pengujian form pada keyboard virtual Android / iOS
- [ ] **Deployment**:
  - Konfigurasi build production
  - Panduan deploy ke Vercel atau Netlify (gratis & cepat)

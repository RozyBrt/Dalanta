-- ========================================================
-- SKEMA DATABASE SUPABASE UNTUK DALANTA COURIER WEB APP
-- Jalankan query ini di SQL Editor dashboard Supabase Anda
-- ========================================================

-- 1. Buat Tabel Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    service_type TEXT NOT NULL DEFAULT 'delivery', -- 'delivery' | 'errand'
    bailout_amount NUMERIC NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'picking_up' | 'delivering' | 'completed'
    source TEXT NOT NULL DEFAULT 'form',   -- 'form' | 'whatsapp_manual'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Buat Index untuk Performa Query
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan RLS Publik untuk MVP
-- Mengizinkan siapa saja (pelanggan dan kurir) membaca daftar order
CREATE POLICY "Public Read Orders" 
ON public.orders FOR SELECT 
USING (true);

-- Mengizinkan siapa saja membuat pesanan baru
CREATE POLICY "Public Insert Orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Mengizinkan pembaruan status pesanan oleh kurir
CREATE POLICY "Public Update Orders" 
ON public.orders FOR UPDATE 
USING (true);

-- 5. Aktifkan Supabase Realtime untuk tabel orders
-- Agar pesanan baru yang di-submit langsung muncul via WebSocket di HP kurir
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

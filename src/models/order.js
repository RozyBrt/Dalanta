/**
 * Model & Helper untuk Manajemen Pesanan Dalanta
 */

export const ORDER_STATUS = {
  PENDING: 'pending',
  PICKING_UP: 'picking_up',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
}

export const SERVICE_TYPES = {
  DELIVERY: 'delivery',
  ERRAND: 'errand',
}

export const ORDER_SOURCES = {
  FORM: 'form',
  WHATSAPP_MANUAL: 'whatsapp_manual',
}

export const STATUS_METADATA = {
  [ORDER_STATUS.PENDING]: {
    label: 'Menunggu Kurir',
    shortLabel: 'Baru Masuk',
    description: 'Pesanan telah diterima sistem dan menunggu konfirmasi kurir.',
    step: 1,
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    dotColor: 'bg-amber-500',
    nextAction: 'Mulai Penjemputan',
  },
  [ORDER_STATUS.PICKING_UP]: {
    label: 'Menuju Penjemputan',
    shortLabel: 'Jemput Barang',
    description: 'Kurir sedang dalam perjalanan menuju lokasi jemput.',
    step: 2,
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    dotColor: 'bg-sky-500',
    nextAction: 'Barang Diambil & Berangkat',
  },
  [ORDER_STATUS.DELIVERING]: {
    label: 'Dalam Pengantaran',
    shortLabel: 'Sedang Diantar',
    description: 'Barang sudah bersama kurir dan sedang diantar ke tujuan.',
    step: 3,
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    dotColor: 'bg-indigo-500',
    nextAction: 'Selesai & Diterima',
  },
  [ORDER_STATUS.COMPLETED]: {
    label: 'Selesai & Diterima',
    shortLabel: 'Selesai',
    description: 'Pengantaran selesai dan transaksi telah diselesaikan.',
    step: 4,
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    dotColor: 'bg-emerald-600',
    nextAction: null,
  },
}

export const SERVICE_METADATA = {
  [SERVICE_TYPES.DELIVERY]: {
    label: 'Kirim Paket',
    iconName: 'Package',
    tagline: 'Pengantaran barang dari titik jemput ke penerima',
  },
  [SERVICE_TYPES.ERRAND]: {
    label: 'Titip Beli (Errand)',
    iconName: 'ShoppingBag',
    tagline: 'Bantuan belanja atau talangan barang di toko/warung',
  },
}

/**
 * Mendapatkan status berikutnya dalam siklus pengiriman
 * @param {string} currentStatus 
 * @returns {string|null}
 */
export function getNextStatus(currentStatus) {
  switch (currentStatus) {
    case ORDER_STATUS.PENDING:
      return ORDER_STATUS.PICKING_UP
    case ORDER_STATUS.PICKING_UP:
      return ORDER_STATUS.DELIVERING
    case ORDER_STATUS.DELIVERING:
      return ORDER_STATUS.COMPLETED
    default:
      return null
  }
}

/**
 * Membuat tautan rute Google Maps langsung dari alamat teks
 * @param {string} address 
 * @returns {string}
 */
export function buildGoogleMapsUrl(address) {
  if (!address) return 'https://maps.google.com'
  const encodedAddress = encodeURIComponent(address.trim())
  return 'https://www.google.com/maps/search/?api=1&query=' + encodedAddress
}

/**
 * Membuat tautan deep-link chat WhatsApp dengan template pesan terstruktur
 * @param {string} phone 
 * @param {string} text 
 * @returns {string}
 */
export function buildWhatsAppUrl(phone, text) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '')
  const formattedPhone = cleanPhone.startsWith('0') 
    ? '62' + cleanPhone.slice(1) 
    : cleanPhone
  return 'https://wa.me/' + formattedPhone + '?text=' + encodeURIComponent(text)
}

/**
 * Menghasilkan Order ID acak dengan prefix DLT
 * @returns {string} Contoh: DLT-8492
 */
export function generateOrderId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  return 'DLT-' + randomNum
}

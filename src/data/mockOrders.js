import { ORDER_STATUS, SERVICE_TYPES, ORDER_SOURCES } from '../models/order'

export const INITIAL_ORDERS = [
  {
    id: 'DLT-1024',
    customerName: 'Siti Rahmawati (Dapur Siti FB)',
    customerPhone: '081234567890',
    serviceType: SERVICE_TYPES.DELIVERY,
    pickupAddress: 'Jl. Merpati No. 14 (Rumah pagar hitam samping Laundry Berkah)',
    dropoffAddress: 'Komplek Permata Hijau Blok C3 No. 8',
    bailoutAmount: 0,
    notes: 'Paket box kue basah 3 toples. Harap jangan dibalik dan bawa hati-hati.',
    status: ORDER_STATUS.PENDING,
    source: ORDER_SOURCES.FORM,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 menit lalu
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'DLT-1023',
    customerName: 'Budi Santoso',
    customerPhone: '085712348899',
    serviceType: SERVICE_TYPES.ERRAND,
    pickupAddress: 'Apotek Kimia Farma Jl. Sudirman',
    dropoffAddress: 'Jl. Kenanga 2 No. 45 (Depan Pos Ronda)',
    bailoutAmount: 75000,
    notes: 'Titip beli obat batuk sirup & vitamin C. Uang talangan Rp75.000 + ongkir kurir dibayar tunai saat sampai.',
    status: ORDER_STATUS.PICKING_UP,
    source: ORDER_SOURCES.WHATSAPP_MANUAL,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 menit lalu
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'DLT-1022',
    customerName: 'Maya - Olshop Hijab',
    customerPhone: '089678123456',
    serviceType: SERVICE_TYPES.DELIVERY,
    pickupAddress: 'Toko Maya Hijab, Ruko Pasar Baru Blok B No. 2',
    dropoffAddress: 'Kost Melati Kamar 12, Jl. Mawar Indah',
    bailoutAmount: 0,
    notes: 'Paket 2 baju gamis. Penerima atas nama Indah (COD ongkir Rp15.000).',
    status: ORDER_STATUS.DELIVERING,
    source: ORDER_SOURCES.FORM,
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(), // 1 jam 15 menit lalu
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'DLT-1021',
    customerName: 'dr. Andi Kurniawan',
    customerPhone: '081399887766',
    serviceType: SERVICE_TYPES.DELIVERY,
    pickupAddress: 'Klinik Sehat Medika, Jl. Ahmad Yani',
    dropoffAddress: 'Jl. Melur Permai No. 19',
    bailoutAmount: 0,
    notes: 'Dokumen berkas hasil lab dalam amplop cokelat tertutup rapat.',
    status: ORDER_STATUS.COMPLETED,
    source: ORDER_SOURCES.FORM,
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(), // 3 jam lalu
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
]

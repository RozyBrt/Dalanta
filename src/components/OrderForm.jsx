import { useState } from 'react'
import { 
  Package, 
  ShoppingBag, 
  MapPin, 
  User, 
  Phone, 
  FileText, 
  Coins, 
  Send, 
  AlertCircle 
} from 'lucide-react'
import { SERVICE_TYPES } from '../models/order'
import { useOrders } from '../context/OrderContext'

export default function OrderForm({ onSuccess }) {
  const { createOrder } = useOrders()

  const [serviceType, setServiceType] = useState(SERVICE_TYPES.DELIVERY)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [dropoffAddress, setDropoffAddress] = useState('')
  const [bailoutAmount, setBailoutAmount] = useState('')
  const [notes, setNotes] = useState('')

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!customerName.trim()) {
      newErrors.customerName = 'Nama pemesan wajib diisi'
    }
    if (!customerPhone.trim()) {
      newErrors.customerPhone = 'Nomor WhatsApp wajib diisi'
    } else if (customerPhone.replace(/[^0-9]/g, '').length < 9) {
      newErrors.customerPhone = 'Nomor WhatsApp minimal 9 digit'
    }
    if (!pickupAddress.trim()) {
      newErrors.pickupAddress = 'Alamat penjemputan / toko wajib diisi'
    }
    if (!dropoffAddress.trim()) {
      newErrors.dropoffAddress = 'Alamat tujuan pengantaran wajib diisi'
    }
    if (serviceType === SERVICE_TYPES.ERRAND && bailoutAmount && Number(bailoutAmount) < 0) {
      newErrors.bailoutAmount = 'Nominal talangan tidak valid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    
    // Simulasi delay singkat agar feedback terasa natural
    setTimeout(() => {
      const order = createOrder({
        customerName,
        customerPhone,
        pickupAddress,
        dropoffAddress,
        serviceType,
        bailoutAmount: bailoutAmount ? Number(bailoutAmount) : 0,
        notes,
      })

      setIsSubmitting(false)
      // Reset form
      setCustomerName('')
      setCustomerPhone('')
      setPickupAddress('')
      setDropoffAddress('')
      setBailoutAmount('')
      setNotes('')
      setErrors({})

      if (onSuccess) {
        onSuccess(order)
      }
    }, 400)
  }

  return (
    <section id="form-order" className="px-4 py-4 max-w-4xl mx-auto scroll-mt-16">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7">
        <div className="border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Formulir Mandiri</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Rincian Pengantaran</h2>
          <p className="text-xs text-slate-500">
            Isi data di bawah ini dengan lengkap agar kurir dapat langsung meluncur ke lokasi Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service Type Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Jenis Layanan
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setServiceType(SERVICE_TYPES.DELIVERY)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  serviceType === SERVICE_TYPES.DELIVERY
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`p-2 rounded-lg ${serviceType === SERVICE_TYPES.DELIVERY ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Package className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Kirim Paket</div>
                  <div className="text-[11px] text-slate-500">Antar barang / pesanan</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setServiceType(SERVICE_TYPES.ERRAND)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  serviceType === SERVICE_TYPES.ERRAND
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`p-2 rounded-lg ${serviceType === SERVICE_TYPES.ERRAND ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Titip Beli</div>
                  <div className="text-[11px] text-slate-500">Talangan belanja / apotek</div>
                </div>
              </button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="customerName" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Nama Pemesan / Pengirim <span className="text-red-500">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Dapur Mama Siti"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                  errors.customerName 
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
              {errors.customerName && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.customerName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                  errors.customerPhone 
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
              {errors.customerPhone && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.customerPhone}
                </p>
              )}
            </div>
          </div>

          {/* Pickup Address */}
          <div>
            <label htmlFor="pickupAddress" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {serviceType === SERVICE_TYPES.ERRAND ? 'Lokasi Toko / Warung / Apotek Pembelian' : 'Alamat Penjemputan Paket (Pickup)'} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="pickupAddress"
              rows={2}
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Sebutkan nama jalan, nomor rumah/toko, patokan pagar/bangunan sekitar..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none ${
                errors.pickupAddress 
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
              }`}
            />
            {errors.pickupAddress && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.pickupAddress}
              </p>
            )}
          </div>

          {/* Dropoff Address */}
          <div>
            <label htmlFor="dropoffAddress" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Alamat Pengantaran / Tujuan (Drop-off) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="dropoffAddress"
              rows={2}
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              placeholder="Alamat penerima, nomor rumah, nama gang, atau patokan jelas..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none ${
                errors.dropoffAddress 
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
              }`}
            />
            {errors.dropoffAddress && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.dropoffAddress}
              </p>
            )}
          </div>

          {/* Errand Specific: Bailout Amount */}
          {serviceType === SERVICE_TYPES.ERRAND && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 transition-all">
              <label htmlFor="bailoutAmount" className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-700" />
                Estimasi Dana Talangan Belanja (Rp)
              </label>
              <p className="text-[11px] text-amber-800 mb-2">
                Kurir akan menalangi belanjaan terlebih dahulu dan diganti tunai/transfer saat pesanan sampai.
              </p>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  id="bailoutAmount"
                  type="number"
                  min="0"
                  step="1000"
                  value={bailoutAmount}
                  onChange={(e) => setBailoutAmount(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-white border border-amber-300 text-sm font-semibold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Catatan Khusus untuk Kurir (Opsional)
            </label>
            <input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                serviceType === SERVICE_TYPES.ERRAND
                  ? 'Daftar barang belanja: misal 1 botol minyak goreng & 2 sabun...'
                  : 'Contoh: Paket jangan dibanting / titip di satpam / penerima bu Ayu'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer min-h-[48px]"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Mengirim Pesanan...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Pesanan Sekarang</span>
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  )
}

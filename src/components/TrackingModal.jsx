import { useState } from 'react'
import { 
  Search, 
  X, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Package, 
  ShoppingBag, 
  MessageCircle,
  AlertCircle
} from 'lucide-react'
import { useOrders } from '../context/OrderContext'
import { 
  ORDER_STATUS, 
  STATUS_METADATA, 
  SERVICE_TYPES, 
  buildWhatsAppUrl 
} from '../models/order'

export default function TrackingModal({ onClose, initialOrderId = '' }) {
  const { getOrderById, courierConfig } = useOrders()
  const [searchId, setSearchId] = useState(initialOrderId)
  const [foundOrder, setFoundOrder] = useState(() => {
    return initialOrderId ? getOrderById(initialOrderId) : null
  })
  const [hasSearched, setHasSearched] = useState(Boolean(initialOrderId))

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchId.trim()) return
    const order = getOrderById(searchId.trim())
    setFoundOrder(order)
    setHasSearched(true)
  }

  const steps = [
    { key: ORDER_STATUS.PENDING, label: 'Diterima' },
    { key: ORDER_STATUS.PICKING_UP, label: 'Penjemputan' },
    { key: ORDER_STATUS.DELIVERING, label: 'Pengantaran' },
    { key: ORDER_STATUS.COMPLETED, label: 'Selesai' },
  ]

  const getCurrentStepIndex = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING: return 0
      case ORDER_STATUS.PICKING_UP: return 1
      case ORDER_STATUS.DELIVERING: return 2
      case ORDER_STATUS.COMPLETED: return 3
      default: return 0
    }
  }

  const currentStep = foundOrder ? getCurrentStepIndex(foundOrder.status) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-black text-slate-900 mb-1">Lacak Status Pengantaran</h3>
        <p className="text-xs text-slate-500 mb-4">
          Masukkan ID pesanan Dalanta Anda untuk melihat posisi dan status kurir.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Contoh: DLT-1024"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono uppercase tracking-wider outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Lacak
          </button>
        </form>

        {/* Search Results */}
        {hasSearched && (
          <div>
            {!foundOrder ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">Pesanan Tidak Ditemukan</p>
                <p className="text-xs text-slate-500 mt-1">
                  Pastikan format ID benar (contoh: DLT-1024). Atau hubungi kurir langsung via WhatsApp.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Order Header Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-sm text-emerald-950">{foundOrder.id}</span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {new Date(foundOrder.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {foundOrder.serviceType === SERVICE_TYPES.ERRAND ? (
                      <>
                        <ShoppingBag className="w-4 h-4 text-amber-600" />
                        <span>Titip Beli</span>
                        {foundOrder.bailoutAmount > 0 && (
                          <span className="text-amber-800 font-normal">
                            (Talangan Rp{foundOrder.bailoutAmount.toLocaleString('id-ID')})
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>Kirim Paket</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="py-2 px-1">
                  <div className="flex items-center justify-between relative mb-2">
                    <div className="absolute left-0 top-3.5 h-1 w-full bg-slate-200 -z-0"></div>
                    <div 
                      className="absolute left-0 top-3.5 h-1 bg-emerald-600 transition-all duration-300 -z-0"
                      style={{ width: `${(currentStep / 3) * 100}%` }}
                    ></div>

                    {steps.map((step, idx) => {
                      const isPassed = idx <= currentStep
                      const isCurrent = idx === currentStep

                      return (
                        <div key={step.key} className="flex flex-col items-center relative z-10">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCurrent
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110'
                                : isPassed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className={`text-[10px] mt-1.5 font-bold ${isCurrent ? 'text-emerald-800' : 'text-slate-500'}`}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Current Status Message */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <strong className="text-slate-800">Keterangan: </strong>
                    <span className="text-slate-600">{STATUS_METADATA[foundOrder.status]?.description}</span>
                  </div>
                </div>

                {/* Addresses */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-500">Penjemputan: </span>
                      <span className="text-slate-800">{foundOrder.pickupAddress}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-500">Pengantaran: </span>
                      <span className="text-slate-800">{foundOrder.dropoffAddress}</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat button */}
                <a
                  href={buildWhatsAppUrl(courierConfig.phone, `Halo ${courierConfig.name}, saya ingin menanyakan pesanan saya dengan ID ${foundOrder.id}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Tanya Posisi ke Kurir via WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

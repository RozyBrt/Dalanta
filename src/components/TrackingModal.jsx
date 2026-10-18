import { useState, useMemo } from 'react'
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
  AlertCircle,
  Radio
} from 'lucide-react'
import { useOrders } from '../context/OrderContext'
import { 
  ORDER_STATUS, 
  STATUS_METADATA, 
  SERVICE_TYPES, 
  buildWhatsAppUrl 
} from '../models/order'

export default function TrackingModal({ onClose, initialOrderId = '' }) {
  const { getOrderById, courierConfig, orders, realtimeStatus } = useOrders()
  const [searchId, setSearchId] = useState(initialOrderId)
  const [activeTrackId, setActiveTrackId] = useState(initialOrderId)
  const [hasSearched, setHasSearched] = useState(Boolean(initialOrderId))

  // Selalu mengambil order secara reaktif dari orders real-time context
  const foundOrder = useMemo(() => {
    if (!activeTrackId.trim()) return null
    return getOrderById(activeTrackId.trim())
  }, [activeTrackId, orders, getOrderById])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchId.trim()) return
    setActiveTrackId(searchId.trim())
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

        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-black text-slate-900">Lacak Status Pengantaran</h3>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mr-7">
            <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
            Live Sync
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Status kurir diperbarui secara otomatis secara real-time tanpa perlu refresh.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Contoh: DLT-4025"
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
                  Pastikan format ID benar (contoh: DLT-4025). Atau tanyakan kurir langsung via WhatsApp.
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
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
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
                    </span>

                    {/* Badge Status Terkini yang ikut berubah real-time */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_METADATA[foundOrder.status]?.badgeBg}`}>
                      {STATUS_METADATA[foundOrder.status]?.label}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper yang bergerak live */}
                <div className="py-2 px-1">
                  <div className="flex items-center justify-between relative mb-2">
                    <div className="absolute left-0 top-3.5 h-1 w-full bg-slate-200 -z-0"></div>
                    <div 
                      className="absolute left-0 top-3.5 h-1 bg-emerald-600 transition-all duration-500 ease-out -z-0"
                      style={{ width: `${(currentStep / 3) * 100}%` }}
                    ></div>

                    {steps.map((step, idx) => {
                      const isPassed = idx <= currentStep
                      const isCurrent = idx === currentStep

                      return (
                        <div key={step.key} className="flex flex-col items-center relative z-10">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              isCurrent
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110 shadow-xs'
                                : isPassed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className={`text-[10px] mt-1.5 font-bold transition-colors ${isCurrent ? 'text-emerald-800' : 'text-slate-500'}`}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Current Status Message Live */}
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs transition-all">
                    <div className="font-bold text-slate-800 mb-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Posisi Terkini: {STATUS_METADATA[foundOrder.status]?.shortLabel}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {STATUS_METADATA[foundOrder.status]?.description}
                    </p>
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
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

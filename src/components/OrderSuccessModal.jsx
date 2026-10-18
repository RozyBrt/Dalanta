import { CheckCircle2, MessageSquare, ArrowRight, X, MapPin, Package, ShoppingBag, Copy, Check, Search } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useOrders } from '../context/OrderContext'
import { buildWhatsAppUrl, SERVICE_TYPES, STATUS_METADATA } from '../models/order'

export default function OrderSuccessModal({ order, onClose, onGoToDashboard, onTrackOrder }) {
  const { courierConfig, orders, getOrderById } = useOrders()
  const [copied, setCopied] = useState(false)

  // Selalu sinkronkan dengan status pesanan terbaru secara real-time
  const liveOrder = useMemo(() => {
    if (!order || !order.id) return order || null
    return getOrderById(order.id) || order
  }, [order, orders, getOrderById])

  if (!liveOrder || !liveOrder.id) return null

  // Format pesan WhatsApp konfirmasi dari pelanggan ke kurir
  const orderSummaryText = 
`Halo ${courierConfig.name}, saya baru saja membuat pesanan di Dalanta:

*ID Pesanan*: ${liveOrder.id}
*Nama*: ${liveOrder.customerName}
*Layanan*: ${liveOrder.serviceType === SERVICE_TYPES.ERRAND ? 'Titip Beli (Errand)' : 'Kirim Paket'}
*Titik Jemput*: ${liveOrder.pickupAddress}
*Titik Antar*: ${liveOrder.dropoffAddress}
${liveOrder.bailoutAmount > 0 ? `*Talangan Belanja*: Rp${liveOrder.bailoutAmount.toLocaleString('id-ID')}\n` : ''}${liveOrder.notes ? `*Catatan*: ${liveOrder.notes}\n` : ''}
Mohon segera dikonfirmasi ya kak. Terima kasih!`

  const whatsappUrl = buildWhatsAppUrl(courierConfig.phone, orderSummaryText)

  const copyId = () => {
    if (liveOrder.id) {
      navigator.clipboard.writeText(liveOrder.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const statusMeta = STATUS_METADATA[liveOrder.status]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            Pesanan Berhasil Dikirim!
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2">Data Masuk ke Kurir</h3>
          <p className="text-xs text-slate-500 mt-1">
            Pesanan Anda langsung tercatat di dashboard kurir dengan ID:
          </p>

          <div className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
            <span className="font-mono font-bold text-sm text-slate-900">{liveOrder.id}</span>
            <button
              type="button"
              onClick={copyId}
              className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Salin ID Pesanan"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="mb-4 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500">Status Terkini:</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${statusMeta?.badgeBg}`}>
            <span className={`w-2 h-2 rounded-full ${statusMeta?.dotColor} animate-ping`}></span>
            <span>{statusMeta?.label}</span>
          </span>
        </div>

        {/* Order Details Brief */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-5 space-y-2.5 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-slate-500 w-20 shrink-0">Layanan:</span>
            <span className="font-bold text-slate-900 flex items-center gap-1">
              {liveOrder.serviceType === SERVICE_TYPES.ERRAND ? (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                  Titip Beli (Talangan Rp{liveOrder.bailoutAmount.toLocaleString('id-ID')})
                </>
              ) : (
                <>
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  Kirim Paket
                </>
              )}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-500">Jemput: </span>
              <span>{liveOrder.pickupAddress}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-500">Tujuan: </span>
              <span>{liveOrder.dropoffAddress}</span>
            </div>
          </div>

          {liveOrder.notes && (
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 italic">
              "{liveOrder.notes}"
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Lacak Posisi Langsung Button */}
          {onTrackOrder && (
            <button
              type="button"
              onClick={() => onTrackOrder(liveOrder.id)}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px]"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Lacak Posisi Pesanan Ini</span>
            </button>
          )}

          {/* Primary Action: Send to Courier WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Kirim Notif WhatsApp ke Kurir</span>
          </a>

          {/* Secondary Action: View in Dashboard */}
          {onGoToDashboard && (
            <button
              type="button"
              onClick={onGoToDashboard}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
            >
              <span>Buka Tampilan Dashboard Kurir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
          >
            Tutup & Buat Pesanan Lain
          </button>
        </div>
      </div>
    </div>
  )
}

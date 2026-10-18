import { MessageSquare } from 'lucide-react'
import { useOrders } from '../context/OrderContext'
import { buildWhatsAppUrl } from '../models/order'

export default function FloatingWhatsAppCTA() {
  const { courierConfig } = useOrders()

  const text = `Halo ${courierConfig.name}, saya ingin tanya / order kurir Dalanta.`
  const whatsappUrl = buildWhatsAppUrl(courierConfig.phone, text)

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-30 flex items-center gap-2">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-700/30 transition-all hover:scale-105 min-h-[48px] select-none"
        title="Hubungi Kurir Langsung via WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageSquare className="w-5 h-5" />
        <span className="tracking-wide">Chat Kurir Langsung</span>
      </a>
    </div>
  )
}

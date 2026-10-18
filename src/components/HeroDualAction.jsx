import { FileText, MessageSquare, ArrowDown, Wallet, Clock, CheckCircle2 } from 'lucide-react'
import { useOrders } from '../context/OrderContext'
import { buildWhatsAppUrl } from '../models/order'

export default function HeroDualAction({ onSelectForm }) {
  const { courierConfig } = useOrders()

  const defaultGreetingText = `Halo ${courierConfig.name}, saya ingin konsultasi / pesan jasa kurir Dalanta.`
  const whatsappUrl = buildWhatsAppUrl(courierConfig.phone, defaultGreetingText)

  return (
    <section className="pt-6 pb-4 px-4 max-w-4xl mx-auto">
      {/* Announcement badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold mb-4">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        Operasional Hari Ini: {courierConfig.operationalHours}
      </div>

      {/* Main Headline */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
        Kirim Paket & Titip Beli <span className="text-emerald-700">Cepat Tanpa Ribet</span>
      </h1>
      
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mb-6">
        Kurir lokal andalan untuk jualan online rumahan, antar berkas, atau titip belanja warung/apotek. Silakan pilih jalur pemesanan yang paling Anda sukai:
      </p>

      {/* Dual Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
        {/* Option A: Digital Form */}
        <button
          type="button"
          onClick={onSelectForm}
          className="group text-left p-4 sm:p-5 rounded-2xl bg-white border-2 border-emerald-500 shadow-sm hover:shadow-md hover:border-emerald-600 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700">
                <FileText className="w-5 h-5" />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-600 text-white">
                Opsi A • Mandiri
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
              Isi Formulir Pesanan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Catat alamat penjemputan dan tujuan secara jelas. Data langsung masuk ke antrean kurir seketika.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Mulai Isi Form</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </div>
        </button>

        {/* Option B: Direct WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group text-left p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600">
                <MessageSquare className="w-5 h-5" />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                Opsi B • Chat Langsung
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
              Order via WhatsApp
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lebih suka komunikasi langsung? Klik untuk terhubung ke nomor WhatsApp kurir dengan template otomatis.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-700">
            <span>Buka WhatsApp Kurir</span>
            <span className="text-sm">→</span>
          </div>
        </a>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
          <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Bayar COD / Tunai</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Bisa Dana Talangan</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Tanpa Perlu Akun</span>
        </div>
      </div>
    </section>
  )
}

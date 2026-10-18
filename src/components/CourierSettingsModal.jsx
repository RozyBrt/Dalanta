import { useState } from 'react'
import { 
  X, 
  Settings, 
  Phone, 
  User, 
  Clock, 
  Volume2, 
  VolumeX, 
  Database, 
  Save, 
  Play, 
  CheckCircle2 
} from 'lucide-react'
import { useOrders } from '../context/OrderContext'

export default function CourierSettingsModal({ onClose }) {
  const { 
    courierConfig, 
    updateCourierConfig, 
    isSoundEnabled, 
    toggleSound, 
    notifyNewOrder,
    connectionMode 
  } = useOrders()

  const [name, setName] = useState(courierConfig.name)
  const [phone, setPhone] = useState(courierConfig.phone)
  const [hours, setHours] = useState(courierConfig.operationalHours)
  const [isOnline, setIsOnline] = useState(courierConfig.isOnline)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    updateCourierConfig({
      name: name.trim(),
      phone: phone.trim(),
      operationalHours: hours.trim(),
      isOnline,
    })
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-emerald-600" />
          <h3 className="text-xl font-black text-slate-900">Pengaturan Kurir</h3>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Sesuaikan nomor WhatsApp penerima order dan preferensi notifikasi Anda.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nama Kurir / Brand
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Nomor WhatsApp Aktif Kurir
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Seluruh tombol chat pelanggan akan langsung terhubung ke nomor ini.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Teks Jam Operasional
            </label>
            <input
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Sound Notification Settings */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isSoundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <div className="text-xs font-bold text-slate-900">Suara Nada Pesanan Masuk</div>
                <div className="text-[11px] text-slate-500">Berbunyi saat order baru tiba</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={notifyNewOrder}
                title="Coba dengarkan suara"
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 text-xs flex items-center gap-1 font-semibold"
              >
                <Play className="w-3 h-3" />
                <span>Tes</span>
              </button>

              <button
                type="button"
                onClick={toggleSound}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isSoundEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    isSoundEnabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Database Status Info */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200/70 text-[11px] text-slate-600 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span>Mode Database: </span>
              <strong className="text-slate-800">
                {connectionMode === 'supabase'
                  ? 'Cloud Supabase Realtime'
                  : 'Lokal Multi-Tab Realtime (Aktif)'}
              </strong>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

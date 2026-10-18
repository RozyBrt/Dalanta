import { useState } from 'react'
import { 
  Package, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  Plus, 
  RotateCcw, 
  Coins, 
  ArrowRight,
  X,
  MessageCircle,
  Settings,
  Volume2,
  VolumeX,
  Radio,
  CloudUpload,
  AlertTriangle
} from 'lucide-react'
import { useOrders } from '../context/OrderContext'
import { 
  ORDER_STATUS, 
  SERVICE_TYPES, 
  STATUS_METADATA, 
  buildGoogleMapsUrl, 
  buildWhatsAppUrl 
} from '../models/order'
import CourierSettingsModal from './CourierSettingsModal'

export default function CourierDashboard() {
  const { 
    orders, 
    stats, 
    advanceOrderStatus, 
    updateOrderStatus, 
    createManualOrder, 
    clearAllOrders,
    isSoundEnabled,
    toggleSound,
    isSupabaseConfigured,
    syncAllToSupabase,
    isSyncing
  } = useOrders()

  const [filter, setFilter] = useState('all') // 'all', 'pending', 'active', 'completed'
  const [showManualModal, setShowManualModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Form state manual order
  const [manualName, setManualName] = useState('')
  const [manualPhone, setManualPhone] = useState('')
  const [manualPickup, setManualPickup] = useState('')
  const [manualDropoff, setManualDropoff] = useState('')
  const [manualServiceType, setManualServiceType] = useState(SERVICE_TYPES.DELIVERY)
  const [manualBailout, setManualBailout] = useState('')
  const [manualNotes, setManualNotes] = useState('')

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === 'pending') return order.status === ORDER_STATUS.PENDING
    if (filter === 'active') return order.status === ORDER_STATUS.PICKING_UP || order.status === ORDER_STATUS.DELIVERING
    if (filter === 'completed') return order.status === ORDER_STATUS.COMPLETED
    return true
  })

  const handleCreateManualOrder = (e) => {
    e.preventDefault()
    if (!manualName.trim() || !manualPickup.trim() || !manualDropoff.trim()) return

    createManualOrder({
      customerName: manualName,
      customerPhone: manualPhone || '-',
      pickupAddress: manualPickup,
      dropoffAddress: manualDropoff,
      serviceType: manualServiceType,
      bailoutAmount: manualBailout ? Number(manualBailout) : 0,
      notes: manualNotes,
    })

    // Reset & close
    setManualName('')
    setManualPhone('')
    setManualPickup('')
    setManualDropoff('')
    setManualBailout('')
    setManualNotes('')
    setShowManualModal(false)
  }

  return (
    <section className="px-4 py-6 max-w-4xl mx-auto space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dashboard Kurir Lapangan
            </h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              isSupabaseConfigured 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              {isSupabaseConfigured ? 'Cloud Realtime Aktif' : 'Mode Lokal (Refresh F5)'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kelola rute jemput, status antar, dan pesanan masuk secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sinkronkan Data ke Supabase Button */}
          {isSupabaseConfigured && (
            <button
              type="button"
              disabled={isSyncing}
              onClick={syncAllToSupabase}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer min-h-[40px] disabled:opacity-50"
              title="Upload semua data lokal ke database Supabase"
            >
              <CloudUpload className="w-4 h-4 text-emerald-400" />
              <span>{isSyncing ? 'Sinkronisasi...' : 'Sinkronkan ke Cloud'}</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            title={isSoundEnabled ? 'Suara notifikasi aktif' : 'Suara notifikasi mati'}
            className={`p-2 rounded-xl border transition-colors ${
              isSoundEnabled 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            title="Buka Pengaturan Kurir & Nomor WA"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Add Order WA */}
          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Order WA</span>
          </button>

          <button
            type="button"
            onClick={() => { if (window.confirm('Hapus seluruh daftar pesanan agar bersih?')) clearAllOrders() }}
            title="Bersihkan seluruh data pesanan"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warning if Supabase is not detected in browser */}
      {!isSupabaseConfigured && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Kredensial .env belum terbaca di browser ini: </span>
            <span>Vite membaca file <code>.env</code> saat server pertama kali start. Harap tekan <strong>Ctrl + Shift + R</strong> atau refresh browser Anda agar koneksi Supabase Cloud aktif.</span>
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Order</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Hari ini</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Perlu Jemput
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{stats.pending}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Belum diambil</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-sky-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            Sedang Jalan
          </div>
          <div className="text-2xl font-black text-sky-900 mt-1">{stats.pickingUp + stats.delivering}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dalam rute</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Selesai
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-1">{stats.completed}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Talangan: Rp{stats.totalBailout.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            filter === 'all' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            filter === 'pending' 
              ? 'bg-amber-600 text-white shadow-xs' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Baru Masuk ({stats.pending})
        </button>
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            filter === 'active' 
              ? 'bg-sky-600 text-white shadow-xs' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Dalam Proses ({stats.pickingUp + stats.delivering})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            filter === 'completed' 
              ? 'bg-emerald-600 text-white shadow-xs' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Selesai ({stats.completed})
        </button>
      </div>

      {/* Order Feed Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Tidak ada pesanan di kategori ini</p>
            <p className="text-xs text-slate-400 mt-0.5">Semua pesanan terpantau rapi.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const meta = STATUS_METADATA[order.status]
            const mapsPickupUrl = buildGoogleMapsUrl(order.pickupAddress)
            const mapsDropoffUrl = buildGoogleMapsUrl(order.dropoffAddress)
            const waCustomerUrl = buildWhatsAppUrl(
              order.customerPhone, 
              `Halo kak ${order.customerName}, saya kurir Dalanta mengenai pesanan ${order.id}.`
            )

            return (
              <div 
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all overflow-hidden"
              >
                {/* Order Card Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {order.id}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {order.source === 'whatsapp_manual' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Via WA
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${meta.badgeBg}`}>
                    <span className={`w-2 h-2 rounded-full ${meta.dotColor}`}></span>
                    <span>{meta.label}</span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Customer Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{order.customerPhone}</span>
                      </div>
                    </div>

                    {order.customerPhone && order.customerPhone !== '-' && (
                      <a
                        href={waCustomerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat WA</span>
                      </a>
                    )}
                  </div>

                  {/* Addresses with Quick Maps buttons */}
                  <div className="space-y-2 pt-1">
                    {/* Pickup */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Titik Jemput:
                          </div>
                          <div className="text-xs text-slate-800 font-medium leading-relaxed">
                            {order.pickupAddress}
                          </div>
                        </div>
                      </div>

                      <a
                        href={mapsPickupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 text-[11px] font-bold shadow-2xs transition-colors"
                      >
                        <Navigation className="w-3 h-3 text-emerald-600" />
                        <span>Peta</span>
                      </a>
                    </div>

                    {/* Dropoff */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Titik Antar (Tujuan):
                          </div>
                          <div className="text-xs text-slate-800 font-medium leading-relaxed">
                            {order.dropoffAddress}
                          </div>
                        </div>
                      </div>

                      <a
                        href={mapsDropoffUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 text-[11px] font-bold shadow-2xs transition-colors"
                      >
                        <Navigation className="w-3 h-3 text-blue-600" />
                        <span>Peta</span>
                      </a>
                    </div>
                  </div>

                  {/* Errand Bailout & Notes */}
                  {(order.bailoutAmount > 0 || order.notes) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {order.bailoutAmount > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                          <Coins className="w-3.5 h-3.5 text-amber-700" />
                          <span>Talangan: Rp{order.bailoutAmount.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {order.notes && (
                        <div className="text-xs text-slate-500 italic bg-slate-100/70 px-3 py-1 rounded-xl border border-slate-200/60">
                          Catatan: {order.notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lifecycle Status Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-500 font-medium">
                      Status Saat Ini: <strong className="text-slate-800">{meta.shortLabel}</strong>
                    </div>

                    {meta.nextAction ? (
                      <button
                        type="button"
                        onClick={() => advanceOrderStatus(order.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer min-h-[38px]"
                      >
                        <span>{meta.nextAction}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Pengantaran Selesai
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal Settings */}
      {showSettingsModal && (
        <CourierSettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {/* Modal Tambah Order Manual WA */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowManualModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              Catat Pesanan Masuk (via WhatsApp)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan orderan yang masuk lewat chat langsung agar pembukuan dan rute tetap rapi.
            </p>

            <form onSubmit={handleCreateManualOrder} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setManualServiceType(SERVICE_TYPES.DELIVERY)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    manualServiceType === SERVICE_TYPES.DELIVERY
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-500'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Kirim Paket
                </button>
                <button
                  type="button"
                  onClick={() => setManualServiceType(SERVICE_TYPES.ERRAND)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    manualServiceType === SERVICE_TYPES.ERRAND
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-500'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Titip Beli
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pemesan *</label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Nama customer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor WA Pemesan</label>
                <input
                  type="tel"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="0812..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Jemput *</label>
                <input
                  type="text"
                  required
                  value={manualPickup}
                  onChange={(e) => setManualPickup(e.target.value)}
                  placeholder="Toko / Rumah pengirim"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Antar / Tujuan *</label>
                <input
                  type="text"
                  required
                  value={manualDropoff}
                  onChange={(e) => setManualDropoff(e.target.value)}
                  placeholder="Alamat penerima paket"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              {manualServiceType === SERVICE_TYPES.ERRAND && (
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">Dana Talangan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={manualBailout}
                    onChange={(e) => setManualBailout(e.target.value)}
                    placeholder="50000"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-xs outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Keterangan barang / titipan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}


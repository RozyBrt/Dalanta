import { Bike, ShieldCheck, LayoutDashboard, ShoppingBag } from 'lucide-react'
import { useOrders } from '../context/OrderContext'

export default function Header({ currentView, setCurrentView }) {
  const { courierConfig, stats } = useOrders()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div 
          onClick={() => setCurrentView('customer')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Dalanta</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Kurir Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none">Jasa Kurir & Titip Beli Lokal</p>
          </div>
        </div>

        {/* View Switcher: Customer vs Courier */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setCurrentView('customer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'customer'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pesan</span>
          </button>
          
          <button
            type="button"
            onClick={() => setCurrentView('courier')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              currentView === 'courier'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Kurir</span>
            {stats.pending > 0 && (
              <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {stats.pending}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

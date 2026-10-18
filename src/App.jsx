import { useState } from 'react'
import Header from './components/Header'
import HeroDualAction from './components/HeroDualAction'
import OrderForm from './components/OrderForm'
import OrderSuccessModal from './components/OrderSuccessModal'
import FloatingWhatsAppCTA from './components/FloatingWhatsAppCTA'
import CourierDashboard from './components/CourierDashboard'
import { Bike, ShieldCheck, Heart } from 'lucide-react'

export default function App() {
  const [currentView, setCurrentView] = useState('customer') // 'customer' | 'courier'
  const [submittedOrder, setSubmittedOrder] = useState(null)

  const handleScrollToForm = () => {
    const el = document.getElementById('form-order')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Universal Sticky Header */}
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'customer' ? (
          <div>
            <HeroDualAction onSelectForm={handleScrollToForm} />
            <OrderForm onSuccess={(order) => setSubmittedOrder(order)} />
            <FloatingWhatsAppCTA />
          </div>
        ) : (
          <CourierDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <Bike className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">Dalanta</span>
            <span>• Jasa Kurir & Titip Beli Lokal</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              type="button"
              onClick={() => setCurrentView(currentView === 'customer' ? 'courier' : 'customer')}
              className="hover:text-emerald-700 font-semibold transition-colors underline underline-offset-4"
            >
              {currentView === 'customer' ? 'Buka Dashboard Kurir' : 'Kembali ke Form Pelanggan'}
            </button>
            <span>COD & Talangan Belanja</span>
          </div>
        </div>
      </footer>

      {/* Success Modal */}
      {submittedOrder && (
        <OrderSuccessModal
          order={submittedOrder}
          onClose={() => setSubmittedOrder(null)}
          onGoToDashboard={() => {
            setSubmittedOrder(null)
            setCurrentView('courier')
          }}
        />
      )}
    </div>
  )
}

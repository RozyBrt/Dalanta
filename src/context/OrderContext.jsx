import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { 
  ORDER_STATUS, 
  SERVICE_TYPES, 
  ORDER_SOURCES, 
  getNextStatus, 
  generateOrderId 
} from '../models/order'
import { INITIAL_ORDERS } from '../data/mockOrders'

const STORAGE_KEY = 'dalanta_orders_v1'
const COURIER_SETTINGS_KEY = 'dalanta_courier_settings_v1'

const DEFAULT_COURIER = {
  name: 'Kurir Dalanta',
  phone: '081234567890',
  isOnline: true,
  operationalHours: '08:00 - 21:00 WITA',
}

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  // Inisialisasi daftar pesanan dari LocalStorage atau Mock Data
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Gagal memuat pesanan dari localStorage:', e)
    }
    return INITIAL_ORDERS
  })

  // Pengaturan profil kurir & status operasional
  const [courierConfig, setCourierConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(COURIER_SETTINGS_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Gagal memuat pengaturan kurir:', e)
    }
    return DEFAULT_COURIER
  })

  // Sinkronisasi otomatis ke LocalStorage setiap kali orders berubah
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    } catch (e) {
      console.error('Gagal menyimpan pesanan ke localStorage:', e)
    }
  }, [orders])

  // Sinkronisasi pengaturan kurir ke LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(COURIER_SETTINGS_KEY, JSON.stringify(courierConfig))
    } catch (e) {
      console.error('Gagal menyimpan pengaturan kurir ke localStorage:', e)
    }
  }, [courierConfig])

  /**
   * Membuat pesanan baru dari Formulir Publik (Customer)
   */
  const createOrder = (orderData) => {
    const newOrder = {
      id: generateOrderId(),
      customerName: orderData.customerName.trim(),
      customerPhone: orderData.customerPhone.trim(),
      pickupAddress: orderData.pickupAddress.trim(),
      dropoffAddress: orderData.dropoffAddress.trim(),
      serviceType: orderData.serviceType || SERVICE_TYPES.DELIVERY,
      bailoutAmount: Number(orderData.bailoutAmount) || 0,
      notes: (orderData.notes || '').trim(),
      status: ORDER_STATUS.PENDING,
      source: ORDER_SOURCES.FORM,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setOrders((prev) => [newOrder, ...prev])
    return newOrder
  }

  /**
   * Menambahkan pesanan manual oleh Kurir (dari chat WhatsApp)
   */
  const createManualOrder = (orderData) => {
    const newOrder = {
      id: generateOrderId(),
      customerName: orderData.customerName.trim(),
      customerPhone: orderData.customerPhone ? orderData.customerPhone.trim() : '-',
      pickupAddress: orderData.pickupAddress.trim(),
      dropoffAddress: orderData.dropoffAddress.trim(),
      serviceType: orderData.serviceType || SERVICE_TYPES.DELIVERY,
      bailoutAmount: Number(orderData.bailoutAmount) || 0,
      notes: (orderData.notes || '').trim(),
      status: orderData.status || ORDER_STATUS.PENDING,
      source: ORDER_SOURCES.WHATSAPP_MANUAL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setOrders((prev) => [newOrder, ...prev])
    return newOrder
  }

  /**
   * Mengubah status pesanan secara spesifik
   */
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }
        }
        return order
      })
    )
  }

  /**
   * Memajukan status pesanan ke tahap berikutnya dalam siklus
   */
  const advanceOrderStatus = (orderId) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const next = getNextStatus(order.status)
          if (!next) return order
          return {
            ...order,
            status: next,
            updatedAt: new Date().toISOString(),
          }
        }
        return order
      })
    )
  }

  /**
   * Menghapus pesanan
   */
  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId))
  }

  /**
   * Mengambil data satu pesanan berdasarkan ID
   */
  const getOrderById = (orderId) => {
    return orders.find((order) => order.id === orderId) || null
  }

  /**
   * Mengembalikan data ke kondisi mock awal (untuk pengujian)
   */
  const resetToMockData = () => {
    setOrders(INITIAL_ORDERS)
    setCourierConfig(DEFAULT_COURIER)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(COURIER_SETTINGS_KEY)
    } catch (e) {
      console.warn(e)
    }
  }

  /**
   * Ringkasan statistik performa kurir harian
   */
  const stats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter((o) => o.status === ORDER_STATUS.PENDING).length
    const pickingUp = orders.filter((o) => o.status === ORDER_STATUS.PICKING_UP).length
    const delivering = orders.filter((o) => o.status === ORDER_STATUS.DELIVERING).length
    const completed = orders.filter((o) => o.status === ORDER_STATUS.COMPLETED).length
    const active = pending + pickingUp + delivering

    const totalBailout = orders
      .filter((o) => o.status !== ORDER_STATUS.COMPLETED && o.serviceType === SERVICE_TYPES.ERRAND)
      .reduce((acc, curr) => acc + (curr.bailoutAmount || 0), 0)

    return {
      total,
      pending,
      pickingUp,
      delivering,
      completed,
      active,
      totalBailout,
    }
  }, [orders])

  const value = {
    orders,
    courierConfig,
    setCourierConfig,
    createOrder,
    createManualOrder,
    updateOrderStatus,
    advanceOrderStatus,
    deleteOrder,
    getOrderById,
    resetToMockData,
    stats,
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrders harus digunakan di dalam OrderProvider')
  }
  return context
}

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { 
  ORDER_STATUS, 
  SERVICE_TYPES, 
  ORDER_SOURCES, 
  getNextStatus, 
  generateOrderId 
} from '../models/order'
import { INITIAL_ORDERS } from '../data/mockOrders'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { playOrderNotificationSound } from '../lib/audioNotifier'

const STORAGE_KEY = 'dalanta_orders_v1'
const COURIER_SETTINGS_KEY = 'dalanta_courier_settings_v1'
const SOUND_PREF_KEY = 'dalanta_sound_pref_v1'

const DEFAULT_COURIER = {
  name: 'Kurir Dalanta',
  phone: '081234567890',
  isOnline: true,
  operationalHours: '08:00 - 21:00 WITA',
}

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Gagal memuat pesanan:', e)
    }
    return INITIAL_ORDERS
  })

  const [courierConfig, setCourierConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(COURIER_SETTINGS_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Gagal memuat profil kurir:', e)
    }
    return DEFAULT_COURIER
  })

  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(SOUND_PREF_KEY)
      return saved !== null ? JSON.parse(saved) : true
    } catch (e) {
      return true
    }
  })

  const [isSyncing, setIsSyncing] = useState(false)

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    } catch (e) {
      console.error(e)
    }
  }, [orders])

  useEffect(() => {
    try {
      localStorage.setItem(COURIER_SETTINGS_KEY, JSON.stringify(courierConfig))
    } catch (e) {
      console.error(e)
    }
  }, [courierConfig])

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_PREF_KEY, JSON.stringify(isSoundEnabled))
    } catch (e) {
      console.error(e)
    }
  }, [isSoundEnabled])

  // Play notification chime
  const notifyNewOrder = useCallback(() => {
    if (isSoundEnabled) {
      playOrderNotificationSound()
    }
  }, [isSoundEnabled])

  // ==========================================
  // REAL-TIME SYNC ENGINE (Supabase / BroadcastChannel)
  // ==========================================
  useEffect(() => {
    let broadcast = null

    if (isSupabaseConfigured && supabase) {
      console.log('[Dalanta] Memulai sinkronisasi Supabase Cloud...')

      // 1. Ambil data dari Supabase
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('[Dalanta] Gagal query Supabase:', error.message)
          } else if (data && data.length > 0) {
            console.log('[Dalanta] Memuat', data.length, 'pesanan dari Supabase')
            const mapped = data.map((d) => ({
              id: d.id,
              customerName: d.customer_name,
              customerPhone: d.customer_phone,
              pickupAddress: d.pickup_address,
              dropoffAddress: d.dropoff_address,
              serviceType: d.service_type,
              bailoutAmount: Number(d.bailout_amount) || 0,
              notes: d.notes || '',
              status: d.status,
              source: d.source,
              createdAt: d.created_at,
              updatedAt: d.updated_at,
            }))
            // Gabungkan pesanan lokal dan server tanpa duplikat
            setOrders((prev) => {
              const ids = new Set(mapped.map((m) => m.id))
              const remainingLocal = prev.filter((p) => !ids.has(p.id))
              return [...mapped, ...remainingLocal]
            })
          }
        })

      // 2. Langganan WebSocket Realtime Supabase
      const channel = supabase
        .channel('realtime_orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('[Dalanta] Event Realtime diterima:', payload.eventType)
            if (payload.eventType === 'INSERT') {
              const newRow = payload.new
              const newOrder = {
                id: newRow.id,
                customerName: newRow.customer_name,
                customerPhone: newRow.customer_phone,
                pickupAddress: newRow.pickup_address,
                dropoffAddress: newRow.dropoff_address,
                serviceType: newRow.service_type,
                bailoutAmount: Number(newRow.bailout_amount) || 0,
                notes: newRow.notes || '',
                status: newRow.status,
                source: newRow.source,
                createdAt: newRow.created_at,
                updatedAt: newRow.updated_at,
              }
              setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)])
              notifyNewOrder()
            } else if (payload.eventType === 'UPDATE') {
              const updatedRow = payload.new
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === updatedRow.id
                    ? {
                        ...o,
                        status: updatedRow.status,
                        updatedAt: updatedRow.updated_at,
                      }
                    : o
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setOrders((prev) => prev.filter((o) => o.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      // Fallback: Realtime via BroadcastChannel antar-tab browser lokal
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        broadcast = new BroadcastChannel('dalanta_realtime_orders')
        broadcast.onmessage = (event) => {
          const { type, order, orderId, newStatus } = event.data || {}
          if (type === 'NEW_ORDER' && order) {
            setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)])
            notifyNewOrder()
          } else if (type === 'UPDATE_STATUS' && orderId && newStatus) {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === orderId
                  ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
                  : o
              )
            )
          }
        }
      }

      return () => {
        if (broadcast) broadcast.close()
      }
    }
  }, [notifyNewOrder])

  /**
   * Kirim pesan broadcast antar-tab jika tanpa Supabase
   */
  const broadcastAction = (payload) => {
    if (!isSupabaseConfigured && typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        const bc = new BroadcastChannel('dalanta_realtime_orders')
        bc.postMessage(payload)
        bc.close()
      } catch (e) {}
    }
  }

  /**
   * Fungsi manual untuk menyinkronkan seluruh order lokal ke Supabase
   */
  const syncAllToSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert('Koneksi Supabase belum aktif di browser. Silakan restart Vite dan refresh browser Anda.')
      return false
    }

    setIsSyncing(true)
    try {
      const rows = orders.map((o) => ({
        id: o.id,
        customer_name: o.customerName,
        customer_phone: o.customerPhone,
        pickup_address: o.pickupAddress,
        dropoff_address: o.dropoffAddress,
        service_type: o.serviceType,
        bailout_amount: o.bailoutAmount,
        notes: o.notes,
        status: o.status,
        source: o.source,
        created_at: o.createdAt,
        updated_at: o.updatedAt,
      }))

      const { error } = await supabase.from('orders').upsert(rows)
      if (error) {
        console.error('Gagal upsert ke Supabase:', error)
        alert('Gagal sinkronisasi: ' + error.message)
        setIsSyncing(false)
        return false
      }

      console.log('[Dalanta] Seluruh data berhasil disinkronkan ke Supabase!')
      alert('Berhasil! Seluruh data pesanan telah tersimpan di Supabase.')
      setIsSyncing(false)
      return true
    } catch (e) {
      console.error(e)
      setIsSyncing(false)
      return false
    }
  }

  /**
   * Membuat pesanan baru dari Formulir Publik (Customer)
   */
  const createOrder = async (orderData) => {
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
    broadcastAction({ type: 'NEW_ORDER', order: newOrder })

    if (isSupabaseConfigured && supabase) {
      console.log('[Dalanta] Mengirim order baru ke Supabase:', newOrder.id)
      const { error } = await supabase.from('orders').insert([
        {
          id: newOrder.id,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.customerPhone,
          pickup_address: newOrder.pickupAddress,
          dropoff_address: newOrder.dropoffAddress,
          service_type: newOrder.serviceType,
          bailout_amount: newOrder.bailoutAmount,
          notes: newOrder.notes,
          status: newOrder.status,
          source: newOrder.source,
          created_at: newOrder.createdAt,
          updated_at: newOrder.updatedAt,
        },
      ])

      if (error) {
        console.error('[Dalanta] Supabase Insert Error:', error.message)
      } else {
        console.log('[Dalanta] Berhasil tersimpan di Supabase Cloud:', newOrder.id)
      }
    } else {
      console.warn('[Dalanta] Order disimpan di lokal (Supabase belum terbaca di browser ini).')
    }

    return newOrder
  }

  /**
   * Menambahkan pesanan manual oleh Kurir (dari chat WhatsApp)
   */
  const createManualOrder = async (orderData) => {
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
    broadcastAction({ type: 'NEW_ORDER', order: newOrder })

    if (isSupabaseConfigured && supabase) {
      console.log('[Dalanta] Mengirim order manual WA ke Supabase:', newOrder.id)
      const { error } = await supabase.from('orders').insert([
        {
          id: newOrder.id,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.customerPhone,
          pickup_address: newOrder.pickupAddress,
          dropoff_address: newOrder.dropoffAddress,
          service_type: newOrder.serviceType,
          bailout_amount: newOrder.bailoutAmount,
          notes: newOrder.notes,
          status: newOrder.status,
          source: newOrder.source,
          created_at: newOrder.createdAt,
          updated_at: newOrder.updatedAt,
        },
      ])
      if (error) {
        console.error('[Dalanta] Supabase Insert Error:', error.message)
      }
    }

    return newOrder
  }

  /**
   * Mengubah status pesanan secara spesifik
   */
  const updateOrderStatus = async (orderId, newStatus) => {
    const now = new Date().toISOString()
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: now }
          : order
      )
    )

    broadcastAction({ type: 'UPDATE_STATUS', orderId, newStatus })

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: now })
        .eq('id', orderId)
      if (error) {
        console.error('[Dalanta] Supabase Update Error:', error.message)
      }
    }
  }

  /**
   * Memajukan status pesanan ke tahap berikutnya dalam siklus
   */
  const advanceOrderStatus = (orderId) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    const next = getNextStatus(order.status)
    if (next) {
      updateOrderStatus(orderId, next)
    }
  }

  /**
   * Menghapus pesanan
   */
  const deleteOrder = async (orderId) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId))
    if (isSupabaseConfigured && supabase) {
      await supabase.from('orders').delete().eq('id', orderId)
    }
  }

  const getOrderById = (orderId) => {
    if (!orderId) return null
    const clean = orderId.trim().toUpperCase()
    return orders.find((order) => order.id.toUpperCase() === clean) || null
  }

  const resetToMockData = () => {
    setOrders(INITIAL_ORDERS)
    setCourierConfig(DEFAULT_COURIER)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(COURIER_SETTINGS_KEY)
    } catch (e) {}
  }

  const updateCourierConfig = (newSettings) => {
    setCourierConfig((prev) => ({ ...prev, ...newSettings }))
  }

  const toggleSound = () => {
    setIsSoundEnabled((prev) => !prev)
  }

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
    updateCourierConfig,
    isSoundEnabled,
    toggleSound,
    isSupabaseConfigured,
    createOrder,
    createManualOrder,
    updateOrderStatus,
    advanceOrderStatus,
    deleteOrder,
    getOrderById,
    resetToMockData,
    notifyNewOrder,
    syncAllToSupabase,
    isSyncing,
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

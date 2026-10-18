import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { 
  ORDER_STATUS, 
  SERVICE_TYPES, 
  ORDER_SOURCES, 
  getNextStatus, 
  generateOrderId 
} from '../models/order'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { playOrderNotificationSound } from '../lib/audioNotifier'

const STORAGE_KEY = 'dalanta_orders_v1'
const COURIER_SETTINGS_KEY = 'dalanta_courier_settings_v1'
const SOUND_PREF_KEY = 'dalanta_sound_pref_v1'

const DUMMY_IDS = new Set(['DLT-1021', 'DLT-1022', 'DLT-1023', 'DLT-1024', 'DLT-TEST-CONN'])

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
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.filter((o) => !DUMMY_IDS.has(o.id))
      }
    } catch (e) {
      console.warn('Gagal memuat pesanan:', e)
    }
    return []
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

  const [realtimeStatus, setRealtimeStatus] = useState('connecting') // 'connected' | 'connecting' | 'disconnected'
  const [latestIncomingOrderId, setLatestIncomingOrderId] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // Local storage persistence (tanpa data dummy)
  useEffect(() => {
    try {
      const cleanOrders = orders.filter((o) => !DUMMY_IDS.has(o.id))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanOrders))
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
  // REAL-TIME WEBSOCKET ENGINE (SUPABASE REALTIME)
  // ==========================================
  useEffect(() => {
    let broadcast = null

    if (isSupabaseConfigured && supabase) {
      console.log('[Dalanta Realtime] Menginisialisasi koneksi WebSocket ke Supabase...')

      // 1. Ambil data pesanan awal dari Supabase
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('[Dalanta Realtime] Gagal mengambil data awal:', error.message)
          } else if (data) {
            const mapped = data
              .filter((d) => !DUMMY_IDS.has(d.id))
              .map((d) => ({
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
            setOrders(mapped)
          }
        })

      // 2. Buat saluran Realtime WebSocket unik
      const channelId = 'dalanta-orders-live-' + Math.floor(Math.random() * 10000)
      const channel = supabase.channel(channelId)

      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('%c[Dalanta Realtime Event] ' + payload.eventType, 'color: #059669; font-weight: bold;', payload)

            if (payload.eventType === 'INSERT') {
              const newRow = payload.new
              if (DUMMY_IDS.has(newRow.id)) return

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

              // Masukkan order baru langsung di paling atas
              setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)])
              setLatestIncomingOrderId(newOrder.id)
              notifyNewOrder()

              // Hilangkan highlight setelah 4 detik
              setTimeout(() => {
                setLatestIncomingOrderId((curr) => (curr === newOrder.id ? null : curr))
              }, 4000)

            } else if (payload.eventType === 'UPDATE') {
              const updatedRow = payload.new
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === updatedRow.id
                    ? {
                        ...o,
                        customerName: updatedRow.customer_name || o.customerName,
                        customerPhone: updatedRow.customer_phone || o.customerPhone,
                        pickupAddress: updatedRow.pickup_address || o.pickupAddress,
                        dropoffAddress: updatedRow.dropoff_address || o.dropoffAddress,
                        serviceType: updatedRow.service_type || o.serviceType,
                        bailoutAmount: Number(updatedRow.bailout_amount ?? o.bailoutAmount),
                        notes: updatedRow.notes ?? o.notes,
                        status: updatedRow.status || o.status,
                        updatedAt: updatedRow.updated_at || new Date().toISOString(),
                      }
                    : o
                )
              )
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old?.id
              if (deletedId) {
                setOrders((prev) => prev.filter((o) => o.id !== deletedId))
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('[Dalanta Realtime Status]:', status)
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected')
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setRealtimeStatus('disconnected')
          } else {
            setRealtimeStatus('connecting')
          }
        })

      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      // Fallback: Realtime via BroadcastChannel antar-tab browser lokal
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        broadcast = new BroadcastChannel('dalanta_realtime_orders')
        setRealtimeStatus('connected')
        broadcast.onmessage = (event) => {
          const { type, order, orderId, newStatus } = event.data || {}
          if (type === 'NEW_ORDER' && order) {
            setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)])
            setLatestIncomingOrderId(order.id)
            notifyNewOrder()
            setTimeout(() => {
              setLatestIncomingOrderId((curr) => (curr === order.id ? null : curr))
            }, 4000)
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
      alert('Koneksi Supabase belum aktif di browser. Silakan refresh browser Anda.')
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

    // Update state lokal seketika
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
        console.log('[Dalanta] Sukses insert order ke Supabase:', newOrder.id)
      }
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

  /**
   * Membersihkan seluruh data pesanan (Reset ke kondisi kosong)
   */
  const clearAllOrders = async () => {
    setOrders([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      await supabase.from('orders').delete().neq('id', 'NONE_EXISTS')
    }
  }

  const getOrderById = (orderId) => {
    if (!orderId) return null
    const clean = orderId.trim().toUpperCase()
    return orders.find((order) => order.id.toUpperCase() === clean) || null
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
    realtimeStatus,
    latestIncomingOrderId,
    createOrder,
    createManualOrder,
    updateOrderStatus,
    advanceOrderStatus,
    deleteOrder,
    clearAllOrders,
    getOrderById,
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

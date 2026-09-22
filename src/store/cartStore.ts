'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CartItem, ColorProducto } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  isCheckoutOpen: boolean

  // Acciones
  addItem: (item: Omit<CartItem, 'cantidad'> & { cantidad?: number }) => void
  removeItem: (productoId: string, talla: string, colorNombre: string) => void
  updateQuantity: (productoId: string, talla: string, colorNombre: string, cantidad: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  openCheckout: () => void
  closeCheckout: () => void

  // Selectores computados
  getTotal: () => number
  getSubtotal: () => number
  getItemCount: () => number
  getItemQuantity: (productoId: string, talla: string, colorNombre: string) => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isCheckoutOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productoId === newItem.productoId &&
              item.talla === newItem.talla &&
              item.color.nombre === newItem.color.nombre
          )

          if (existingIndex >= 0) {
            const updatedItems = [...state.items]
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              cantidad: updatedItems[existingIndex].cantidad + (newItem.cantidad || 1),
            }
            return { items: updatedItems }
          }

          return {
            items: [...state.items, { ...newItem, cantidad: newItem.cantidad || 1 }],
          }
        })
      },

      removeItem: (productoId, talla, colorNombre) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.productoId === productoId && item.talla === talla && item.color.nombre === colorNombre)
          ),
        }))
      },

      updateQuantity: (productoId, talla, colorNombre, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(productoId, talla, colorNombre)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.productoId === productoId && item.talla === talla && item.color.nombre === colorNombre
              ? { ...item, cantidad }
              : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true, isCheckoutOpen: false }),
      closeCart: () => set({ isOpen: false }),
      openCheckout: () => set({ isCheckoutOpen: true, isOpen: false }),
      closeCheckout: () => set({ isCheckoutOpen: false }),

      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
      },

      getTotal: () => {
        return get().items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
      },

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.cantidad, 0)
      },

      getItemQuantity: (productoId, talla, colorNombre) => {
        const item = get().items.find(
          (i) => i.productoId === productoId && i.talla === talla && i.color.nombre === colorNombre
        )
        return item?.cantidad || 0
      },
    }),
    {
      name: 'futureme-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

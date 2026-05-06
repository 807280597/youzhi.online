import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_PRODUCTS } from './initData.js'

const STORAGE_KEY = 'ps_products'

export const useProductStore = defineStore('products', () => {
  const products = ref(JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_PRODUCTS)

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products.value))
  }

  function getSorted() {
    return [...products.value].sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999))
  }

  function getById(id) {
    return products.value.find(p => p.id === Number(id))
  }

  function getByCategory(categoryId) {
    const sorted = getSorted()
    if (!categoryId) return sorted
    return sorted.filter(p => p.categoryId === Number(categoryId))
  }

  function getFeatured() {
    return getSorted().filter(p => p.featured)
  }

  function add(product) {
    const id = products.value.length ? Math.max(...products.value.map(p => p.id)) + 1 : 1
    const sort = products.value.length ? Math.max(...products.value.map(p => p.sort ?? 0)) + 1 : 1
    products.value.push({ ...product, id, sort, createdAt: Date.now() })
    save()
    return id
  }

  function update(id, data) {
    const idx = products.value.findIndex(p => p.id === Number(id))
    if (idx !== -1) {
      products.value[idx] = { ...products.value[idx], ...data }
      save()
    }
  }

  function remove(id) {
    products.value = products.value.filter(p => p.id !== Number(id))
    save()
  }

  function reorder(orderedIds) {
    orderedIds.forEach((id, i) => {
      const p = products.value.find(p => p.id === id)
      if (p) p.sort = i + 1
    })
    save()
  }

  function getPriceText(product) {
    if (!product?.priceRichText) return '价格请咨询'
    return product.priceRichText.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() || '价格请咨询'
  }

  return { products, getSorted, getById, getByCategory, getFeatured, add, update, remove, reorder, getPriceText }
})

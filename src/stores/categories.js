import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_CATEGORIES } from './initData.js'

const STORAGE_KEY = 'ps_categories'

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref(JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_CATEGORIES)

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories.value))
  }

  function add(category) {
    const id = categories.value.length ? Math.max(...categories.value.map(c => c.id)) + 1 : 1
    categories.value.push({ ...category, id })
    save()
  }

  function update(id, data) {
    const idx = categories.value.findIndex(c => c.id === Number(id))
    if (idx !== -1) {
      categories.value[idx] = { ...categories.value[idx], ...data }
      save()
    }
  }

  function remove(id) {
    categories.value = categories.value.filter(c => c.id !== Number(id))
    save()
  }

  return { categories, add, update, remove }
})

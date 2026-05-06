import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_CONTACT_CONFIG } from './initData.js'

const STORAGE_KEY = 'ps_contact_config'

export const useContactStore = defineStore('contactConfig', () => {
  const config = ref(JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_CONTACT_CONFIG)

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
  }

  function updateConfig(data) {
    config.value = { ...config.value, ...data }
    save()
  }

  return { config, updateConfig }
})

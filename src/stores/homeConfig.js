import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_HOME_CONFIG } from './initData.js'

const STORAGE_KEY = 'ps_home_config'

export const useHomeConfigStore = defineStore('homeConfig', () => {
  const config = ref(JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_HOME_CONFIG)

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
  }

  function updateBanners(banners) {
    config.value.banners = banners
    save()
  }

  function updateFeaturedProducts(ids) {
    config.value.featuredProductIds = ids
    save()
  }

  function updateCompanyInfo(info) {
    config.value.companyInfo = { ...config.value.companyInfo, ...info }
    save()
  }

  function updateLogo(logoData) {
    config.value.logo = logoData
    save()
  }

  return { config, updateBanners, updateFeaturedProducts, updateCompanyInfo, updateLogo }
})

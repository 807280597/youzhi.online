<template>
  <header class="navbar" :class="{ scrolled: isScrolled }">
    <div class="navbar-inner">
      <router-link to="/" class="logo">
        <img v-if="logoUrl" :src="logoUrl" class="logo-img" alt="logo" />
        <el-icon v-else><Shop /></el-icon>
        <span>{{ siteName }}</span>
      </router-link>
      <nav class="nav-links" v-if="!isMobile">
        <router-link to="/">首页</router-link>
        <router-link to="/products">全部产品</router-link>
        <router-link
          v-for="cat in categories"
          :key="cat.id"
          :to="`/products?category=${cat.id}`"
        >{{ cat.name }}</router-link>
      </nav>
      <div class="nav-actions">
        <!-- PC端：联系我们按钮 -->
        <button v-if="!isMobile" class="contact-btn" @click="scrollToContact">
          📞 联系我们
        </button>
        <!-- 移动端：汉堡菜单 -->
        <el-button v-if="isMobile" :icon="Menu" circle text @click="drawerOpen = true" />
      </div>
    </div>
  </header>

  <!-- 移动端抽屉 -->
  <el-drawer v-model="drawerOpen" direction="ltr" size="240px" :with-header="false">
    <div class="mobile-menu">
      <router-link to="/" @click="drawerOpen = false">首页</router-link>
      <router-link to="/products" @click="drawerOpen = false">全部产品</router-link>
      <router-link
        v-for="cat in categories"
        :key="cat.id"
        :to="`/products?category=${cat.id}`"
        @click="drawerOpen = false"
      >{{ cat.name }}</router-link>
      <el-divider />
      <!-- 移动端：联系我们 -->
      <button class="mobile-contact-btn" @click="() => { drawerOpen = false; scrollToContact() }">
        📞 联系我们
      </button>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Menu } from '@element-plus/icons-vue'
import { useCategoryStore } from '@/stores/categories'
import { useHomeConfigStore } from '@/stores/homeConfig'

const categoryStore = useCategoryStore()
const homeStore = useHomeConfigStore()
const categories = computed(() => categoryStore.categories)
const siteName = computed(() => homeStore.config?.companyInfo?.name || '产品展示')
const logoUrl = computed(() => homeStore.config?.logo || '')

const isScrolled = ref(false)
const isMobile = ref(window.innerWidth < 768)
const drawerOpen = ref(false)

function onScroll() { isScrolled.value = window.scrollY > 50 }
function onResize() { isMobile.value = window.innerWidth < 768 }

function scrollToContact() {
  const el = document.getElementById('contact-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  } else {
    // 当前页面没有联系区域时，滚动到页面底部
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.navbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f0f0f0;
  transition: box-shadow 0.3s;
}
.navbar.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
.navbar-inner {
  max-width: 1200px; margin: 0 auto;
  padding: 0 24px; height: 64px;
  display: flex; align-items: center; gap: 32px;
}
.logo {
  display: flex; align-items: center; gap: 8px;
  font-size: 18px; font-weight: 700; color: #1a1a2e;
  text-decoration: none;
}
.logo-img { height: 36px; width: auto; object-fit: contain; }
.logo .el-icon { font-size: 22px; color: #409eff; }
.nav-links { display: flex; gap: 4px; flex: 1; }
.nav-links a {
  padding: 6px 14px; border-radius: 6px;
  color: #555; text-decoration: none; font-size: 14px;
  transition: all 0.2s;
}
.nav-links a:hover, .nav-links a.router-link-active { color: #409eff; background: #ecf5ff; }
.nav-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }

/* 联系我们按钮 */
.contact-btn {
  padding: 7px 16px; border-radius: 20px;
  border: 1px solid #409eff; background: transparent;
  color: #409eff; font-size: 13px; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
}
.contact-btn:hover { background: #409eff; color: #fff; }

.mobile-menu { padding: 20px; display: flex; flex-direction: column; gap: 4px; }
.mobile-menu a {
  padding: 12px 16px; border-radius: 8px;
  color: #333; text-decoration: none; font-size: 15px;
}
.mobile-menu a:hover { background: #f5f7fa; }
.mobile-contact-btn {
  padding: 12px 16px; border-radius: 8px;
  border: none; background: transparent;
  color: #409eff; font-size: 15px; cursor: pointer;
  text-align: left; width: 100%;
}
.mobile-contact-btn:hover { background: #ecf5ff; }
</style>

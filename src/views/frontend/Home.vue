<template>
  <div class="home">

    <!-- Banner 轮播：有配置才展示，1张时不显示指示点 -->
    <section v-if="validBanners.length > 0" class="banner-section">
      <el-carousel
        :height="bannerHeight"
        :interval="5000"
        :arrow="validBanners.length > 1 ? 'always' : 'never'"
        :indicator-position="validBanners.length > 1 ? '' : 'none'"
        :loop="validBanners.length > 1"
      >
        <el-carousel-item v-for="banner in validBanners" :key="banner.id">
          <div class="banner-item" :style="{ backgroundImage: `url(${banner.image})` }">
            <div class="banner-content">
              <h1 v-if="banner.title">{{ banner.title }}</h1>
              <p v-if="banner.subtitle">{{ banner.subtitle }}</p>
              <el-button
                v-if="banner.link"
                type="primary" size="large" round
                @click="$router.push(banner.link)"
              >立即探索</el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 精选推荐 -->
    <section v-if="featuredProducts.length > 0" class="featured-section">
      <div class="container">
        <div class="section-header">
          <h2>精选推荐</h2>
          <router-link to="/products" class="view-all">查看全部 →</router-link>
        </div>
        <div class="products-grid">
          <ProductCard v-for="p in featuredProducts" :key="p.id" :product="p" />
        </div>
      </div>
    </section>

    <!-- 关于我们：有文字才展示，纯文字无配图 -->
    <section v-if="aboutText.trim()" class="about-section">
      <div class="container">
        <h2 class="about-title">关于我们</h2>
        <p v-if="companyInfo.slogan" class="about-slogan">{{ companyInfo.slogan }}</p>
        <div class="about-body">
          <p
            v-for="(para, i) in aboutParagraphs"
            :key="i"
            class="about-para"
          >{{ para }}</p>
        </div>
        <el-button type="primary" plain @click="$router.push('/products')">浏览产品</el-button>
      </div>
    </section>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProductCard from '@/components/frontend/ProductCard.vue'
import { useHomeConfigStore } from '@/stores/homeConfig'
import { useProductStore } from '@/stores/products'

const homeStore = useHomeConfigStore()
const productStore = useProductStore()
const config = computed(() => homeStore.config)
const companyInfo = computed(() => config.value.companyInfo || {})

// 只展示有图片的 Banner
const validBanners = computed(() =>
  (config.value.banners || []).filter(b => b.image && b.image.trim())
)

// 移动端降低 banner 高度
const bannerHeight = computed(() => '450px')

// 推荐产品
const featuredProducts = computed(() =>
  (config.value.featuredProductIds || [])
    .map(id => productStore.getById(id))
    .filter(Boolean)
)

// 关于我们文字
const aboutText = computed(() => companyInfo.value.aboutText || '')

// 按换行拆分段落，过滤空行
const aboutParagraphs = computed(() =>
  aboutText.value.split('\n').filter(p => p.trim())
)
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* Banner */
.banner-item {
  width: 100%; height: 100%;
  background-size: cover; background-position: center;
  display: flex; align-items: center;
}
.banner-content {
  max-width: 1200px; margin: 0 auto; padding: 0 48px;
  color: #fff;
}
.banner-content h1 {
  font-size: 42px; font-weight: 700; margin: 0 0 12px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.banner-content p {
  font-size: 18px; margin: 0 0 28px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
}

/* 精选推荐 */
.featured-section { padding: 60px 0; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.section-header h2 { font-size: 28px; font-weight: 700; margin: 0; }
.view-all { color: #409eff; text-decoration: none; font-size: 14px; }
.products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

/* 关于我们 */
.about-section { background: #fff; padding: 72px 0; border-top: 1px solid #f0f0f0; }
.about-title { font-size: 32px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px; }
.about-slogan { font-size: 18px; color: #409eff; margin: 0 0 24px; }
.about-body { margin-bottom: 32px; }
.about-para {
  font-size: 15px; color: #555; line-height: 1.9;
  margin: 0 0 12px;
}
.about-para:last-child { margin-bottom: 0; }

@media (max-width: 1024px) {
  .products-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .banner-content h1 { font-size: 26px; }
  .banner-content p { font-size: 14px; }
  .products-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .products-grid { grid-template-columns: 1fr; }
}
</style>

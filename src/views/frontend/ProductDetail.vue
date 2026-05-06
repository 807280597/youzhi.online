<template>
  <div class="product-detail-page" v-if="product">
    <div class="container">
      <!-- 面包屑 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/products' }">产品</el-breadcrumb-item>
        <el-breadcrumb-item v-if="category" :to="{ path: '/products', query: { category: category.id } }">
          {{ category.name }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="detail-layout">
        <!-- 左侧图片区 -->
        <div class="image-section">
          <!-- 主图：1:1 正方形，点击可查看原图 -->
          <div class="main-image" @click="openLightbox(activeIndex)">
            <img
              v-if="activeImage"
              :src="activeImage"
              :alt="product.name"
            />
            <div v-else class="img-placeholder">
              <el-icon><Picture /></el-icon>
              <span>暂无图片</span>
            </div>
            <div v-if="activeImage" class="zoom-hint">
              <el-icon><ZoomIn /></el-icon>
            </div>
          </div>

          <!-- 缩略图列表：1:1 正方形，严格按后台顺序 -->
          <div class="thumb-list" v-if="productImages.length > 1">
            <div
              v-for="(img, i) in productImages"
              :key="i"
              class="thumb-item"
              :class="{ active: activeIndex === i }"
              @click="activeIndex = i"
            >
              <img :src="img" :alt="`${product.name} 图${i + 1}`" />
            </div>
          </div>
        </div>

        <!-- 右侧信息 -->
        <div class="info-section">
          <div class="category-tag" v-if="category">{{ category.name }}</div>
          <h1 class="product-name">{{ product.name }}</h1>
          <p class="short-desc">{{ product.shortDesc }}</p>

          <!-- 价格 -->
          <div class="price-block" v-html="priceHtml"></div>

          <el-divider />

          <!-- 规格参数 -->
          <div class="specs" v-if="product.specs && product.specs.length">
            <h3>规格参数</h3>
            <table class="spec-table">
              <tbody>
                <tr v-for="spec in product.specs" :key="spec.name">
                  <td class="spec-name">{{ spec.name }}</td>
                  <td class="spec-value">{{ spec.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 产品详情内容块 -->
      <div class="detail-blocks" v-if="detailBlocks.length">
        <h2 class="blocks-title">产品详情</h2>
        <div
          v-for="(block, i) in detailBlocks"
          :key="i"
          class="detail-block"
        >
          <p v-if="block.type === 'text'" class="block-text">{{ block.content }}</p>
          <div v-else-if="block.type === 'image'" class="block-image">
            <img :src="block.content" :alt="block.caption || '产品图片'" />
            <p v-if="block.caption" class="block-caption">{{ block.caption }}</p>
          </div>
        </div>
      </div>

      <!-- 相关产品 -->
      <div class="related-section" v-if="relatedProducts.length">
        <h2>相关产品</h2>
        <div class="related-grid">
          <ProductCard v-for="p in relatedProducts" :key="p.id" :product="p" />
        </div>
      </div>
    </div>
  </div>

  <!-- Lightbox：查看原图 -->
  <teleport to="body">
    <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
      <button class="lb-close" @click="closeLightbox">✕</button>
      <button v-if="productImages.length > 1" class="lb-arrow lb-prev" @click="lbPrev">‹</button>
      <div class="lb-img-wrap">
        <img :src="productImages[lbIndex]" :alt="`${product.name} 图${lbIndex + 1}`" />
      </div>
      <button v-if="productImages.length > 1" class="lb-arrow lb-next" @click="lbNext">›</button>
      <div class="lb-counter" v-if="productImages.length > 1">
        {{ lbIndex + 1 }} / {{ productImages.length }}
      </div>
    </div>
  </teleport>

  <div v-if="!product" class="not-found">
    <el-empty description="产品不存在">
      <el-button type="primary" @click="$router.push('/products')">返回产品列表</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/frontend/ProductCard.vue'
import { useProductStore } from '@/stores/products'
import { useCategoryStore } from '@/stores/categories'

const route = useRoute()
const productStore = useProductStore()
const categoryStore = useCategoryStore()

const product = computed(() => productStore.getById(route.params.id))
const category = computed(() =>
  product.value
    ? categoryStore.categories.find(c => c.id === product.value.categoryId)
    : null
)

// ── 图片：严格按后台 images 数组顺序，1:1 映射 ──────────────────────────────
// images 是唯一图片来源，image 字段仅作兜底（旧数据兼容）
const productImages = computed(() => {
  if (!product.value) return []
  const imgs = product.value.images
  if (Array.isArray(imgs) && imgs.length > 0) return imgs
  // 旧数据兼容：只有 image 字段时包装成数组
  return product.value.image ? [product.value.image] : []
})

// 当前激活图片的索引（切换产品时重置为 0）
const activeIndex = ref(0)
watch(
  () => product.value?.id,
  () => { activeIndex.value = 0 },
  { immediate: true }
)

const activeImage = computed(() => productImages.value[activeIndex.value] || '')

// ── 价格 ────────────────────────────────────────────────────────────────────
const priceHtml = computed(() => {
  const rt = product.value?.priceRichText
  return rt || '<span style="color:#aaa;">价格请咨询</span>'
})

// ── 详情块 ──────────────────────────────────────────────────────────────────
const detailBlocks = computed(() => {
  if (!product.value) return []
  if (product.value.detailBlocks?.length) return product.value.detailBlocks
  if (product.value.description) return [{ type: 'text', content: product.value.description }]
  return []
})

// ── 相关产品 ────────────────────────────────────────────────────────────────
const relatedProducts = computed(() => {
  if (!product.value) return []
  return productStore.getSorted()
    .filter(p => p.categoryId === product.value.categoryId && p.id !== product.value.id)
    .slice(0, 4)
})

// ── Lightbox ─────────────────────────────────────────────────────────────────
const lightboxOpen = ref(false)
const lbIndex = ref(0)

function openLightbox(i) {
  if (!productImages.value.length) return
  lbIndex.value = i
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}
function closeLightbox() {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}
function lbPrev() {
  lbIndex.value = (lbIndex.value - 1 + productImages.value.length) % productImages.value.length
}
function lbNext() {
  lbIndex.value = (lbIndex.value + 1) % productImages.value.length
}

// 键盘导航
function onKeydown(e) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') lbPrev()
  if (e.key === 'ArrowRight') lbNext()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.product-detail-page { padding: 32px 0 60px; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.breadcrumb { margin-bottom: 28px; }

.detail-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 60px; }

/* 主图：1:1 正方形，居中裁剪，点击可查看原图 */
.main-image {
  position: relative; border-radius: 16px; overflow: hidden;
  width: 100%; aspect-ratio: 1 / 1;
  background: #f5f5f5; cursor: zoom-in;
}
/* fallback */
@supports not (aspect-ratio: 1/1) {
  .main-image { height: 0; padding-bottom: 100%; }
  .main-image img, .main-image .img-placeholder, .main-image .zoom-hint {
    position: absolute; top: 0; left: 0;
  }
}
.main-image img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center; display: block;
}
.img-placeholder {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; color: #ccc;
}
.img-placeholder .el-icon { font-size: 48px; }
.img-placeholder span { font-size: 14px; }

/* 悬停时显示放大提示 */
.zoom-hint {
  position: absolute; bottom: 10px; right: 10px;
  background: rgba(0,0,0,0.45); color: #fff;
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; opacity: 0; transition: opacity 0.2s;
}
.main-image:hover .zoom-hint { opacity: 1; }

/* 缩略图：1:1 正方形 */
.thumb-list { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.thumb-item {
  width: 68px; aspect-ratio: 1 / 1;
  border-radius: 8px; overflow: hidden;
  cursor: pointer; border: 2px solid transparent; flex-shrink: 0;
  transition: border-color 0.2s; background: #f5f5f5;
}
/* fallback */
@supports not (aspect-ratio: 1/1) {
  .thumb-item { height: 68px; }
}
.thumb-item.active { border-color: #409eff; }
.thumb-item img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center; display: block;
}

/* 信息区 */
.category-tag {
  display: inline-block; font-size: 12px; color: #409eff;
  background: #ecf5ff; padding: 3px 10px; border-radius: 4px; margin-bottom: 12px;
}
.product-name { font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px; }
.short-desc { font-size: 15px; color: #666; margin: 0; line-height: 1.6; }

.price-block {
  margin: 20px 0; padding: 14px 0;
  border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;
  line-height: 1.6;
}

.specs h3 { font-size: 16px; font-weight: 600; margin: 0 0 12px; }
.spec-table { width: 100%; border-collapse: collapse; }
.spec-table tr { border-bottom: 1px solid #f0f0f0; }
.spec-table tr:last-child { border-bottom: none; }
.spec-name { padding: 10px 16px 10px 0; font-size: 13px; color: #888; width: 40%; }
.spec-value { padding: 10px 0; font-size: 13px; color: #333; font-weight: 500; }

/* 详情块 */
.detail-blocks { margin-bottom: 60px; }
.blocks-title {
  font-size: 22px; font-weight: 700; margin: 0 0 28px;
  padding-bottom: 12px; border-bottom: 2px solid #f0f0f0;
}
.detail-block { margin-bottom: 28px; }
.block-text { font-size: 15px; color: #444; line-height: 1.9; margin: 0; white-space: pre-wrap; }
.block-image { text-align: center; }
.block-image img { max-width: 100%; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.block-caption { font-size: 13px; color: #aaa; margin: 10px 0 0; }

/* 相关产品 */
.related-section h2 { font-size: 22px; font-weight: 700; margin: 0 0 24px; }
.related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

.not-found { padding: 120px 0; text-align: center; }

@media (max-width: 768px) {
  .detail-layout { grid-template-columns: 1fr; gap: 24px; }
  .related-grid { grid-template-columns: repeat(2, 1fr); }
}

/* ── Lightbox ──────────────────────────────────────────────────────────────── */
.lightbox {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center;
}
.lb-img-wrap {
  max-width: 90vw; max-height: 90vh;
  display: flex; align-items: center; justify-content: center;
}
.lb-img-wrap img {
  max-width: 90vw; max-height: 90vh;
  object-fit: contain; border-radius: 4px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6);
}
.lb-close {
  position: absolute; top: 20px; right: 24px;
  background: rgba(255,255,255,0.15); border: none; color: #fff;
  width: 40px; height: 40px; border-radius: 50%; font-size: 18px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.lb-close:hover { background: rgba(255,255,255,0.3); }
.lb-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.15); border: none; color: #fff;
  width: 48px; height: 48px; border-radius: 50%; font-size: 28px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s; user-select: none;
}
.lb-arrow:hover { background: rgba(255,255,255,0.3); }
.lb-prev { left: 20px; }
.lb-next { right: 20px; }
.lb-counter {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  color: rgba(255,255,255,0.7); font-size: 14px;
  background: rgba(0,0,0,0.4); padding: 4px 14px; border-radius: 20px;
}
</style>

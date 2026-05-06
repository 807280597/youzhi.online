<template>
  <div class="product-card" @click="$router.push(`/products/${product.id}`)">
    <div class="card-image">
      <img :src="product.images?.[0] || product.image" :alt="product.name" loading="lazy" />
      <div class="card-overlay">
        <el-button type="primary" round size="small">查看详情</el-button>
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ product.name }}</h3>
      <p class="card-desc">{{ product.shortDesc }}</p>
      <div class="card-footer">
        <span class="card-category">{{ categoryName }}</span>
        <div class="card-price" v-html="priceHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCategoryStore } from '@/stores/categories'

const props = defineProps({ product: { type: Object, required: true } })
const categoryStore = useCategoryStore()

const categoryName = computed(() => {
  const cat = categoryStore.categories.find(c => c.id === props.product.categoryId)
  return cat ? cat.name : '未分类'
})

// 卡片上显示纯文本价格（去除 HTML 标签），保留简洁
const priceHtml = computed(() => {
  const rt = props.product.priceRichText
  if (rt) return rt
  return '<span style="color:#aaa;font-size:13px;">价格请咨询</span>'
})
</script>

<style scoped>
.product-card {
  background: #fff; border-radius: 12px;
  overflow: hidden; cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: transform 0.3s, box-shadow 0.3s;
}
.product-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }

/* 缩略图：强制 1:1 正方形，居中裁剪 */
.card-image {
  position: relative; overflow: hidden;
  width: 100%; aspect-ratio: 1 / 1;
  background: #f5f5f5;
}
/* aspect-ratio 不支持时的 fallback */
@supports not (aspect-ratio: 1/1) {
  .card-image { height: 0; padding-bottom: 100%; }
  .card-image img, .card-image .card-overlay { position: absolute; top: 0; left: 0; }
}
.card-image img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  transition: transform 0.4s; display: block;
}
.product-card:hover .card-image img { transform: scale(1.05); }
.card-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s;
}
.product-card:hover .card-overlay { opacity: 1; }
.card-body { padding: 16px; }
.card-title { font-size: 15px; font-weight: 600; color: #1a1a2e; margin: 0 0 6px; }
.card-desc { font-size: 13px; color: #888; margin: 0 0 12px; line-height: 1.5; }
.card-footer { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; }
.card-category {
  font-size: 12px; color: #409eff;
  background: #ecf5ff; padding: 2px 8px; border-radius: 4px; flex-shrink: 0;
}
.card-price { text-align: right; line-height: 1.4; }
</style>

<template>
  <div class="product-list-page">
    <div class="page-hero">
      <div class="container">
        <h1>{{ currentCategory ? currentCategory.name : '全部产品' }}</h1>
        <p>共 {{ filteredProducts.length }} 款产品</p>
      </div>
    </div>

    <div class="container page-body">
      <!-- 分类筛选 -->
      <div class="category-tabs">
        <button
          class="cat-tab"
          :class="{ active: !selectedCategoryId }"
          @click="selectCategory(null)"
        >全部</button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="cat-tab"
          :class="{ active: selectedCategoryId === cat.id }"
          @click="selectCategory(cat.id)"
        >{{ cat.name }}</button>
      </div>

      <!-- 产品网格 -->
      <div v-if="filteredProducts.length" class="products-grid">
        <ProductCard v-for="p in filteredProducts" :key="p.id" :product="p" />
      </div>
      <el-empty v-else description="该分类暂无产品" :image-size="120" style="padding: 80px 0" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/frontend/ProductCard.vue'
import { useProductStore } from '@/stores/products'
import { useCategoryStore } from '@/stores/categories'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const categoryStore = useCategoryStore()

const categories = computed(() => categoryStore.categories)
const selectedCategoryId = ref(route.query.category ? Number(route.query.category) : null)

const currentCategory = computed(() =>
  selectedCategoryId.value
    ? categories.value.find(c => c.id === selectedCategoryId.value)
    : null
)

const filteredProducts = computed(() =>
  productStore.getByCategory(selectedCategoryId.value)
)
function selectCategory(id) {
  selectedCategoryId.value = id
  router.replace({ query: id ? { category: id } : {} })
}

watch(() => route.query.category, val => {
  selectedCategoryId.value = val ? Number(val) : null
})
</script>

<style scoped>
.page-hero {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 48px 0 40px; color: #fff;
}
.page-hero h1 { font-size: 32px; font-weight: 700; margin: 0 0 8px; }
.page-hero p { color: #aaa; margin: 0; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.page-body { padding-top: 32px; padding-bottom: 60px; }

.category-tabs { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 32px; }
.cat-tab {
  padding: 8px 20px; border-radius: 20px; border: 1px solid #e0e0e0;
  background: #fff; color: #555; cursor: pointer; font-size: 14px;
  transition: all 0.2s;
}
.cat-tab:hover { border-color: #409eff; color: #409eff; }
.cat-tab.active { background: #409eff; border-color: #409eff; color: #fff; }

.products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

@media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .products-grid { grid-template-columns: 1fr; } }
</style>

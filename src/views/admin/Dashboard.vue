<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card" v-for="s in stats" :key="s.label">
        <el-icon class="stat-icon" :style="{ color: s.color }"><component :is="s.icon" /></el-icon>
        <div>
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h3>快捷操作</h3>
      <div class="action-grid">
        <el-card class="action-card" shadow="hover" @click="$router.push('/admin/products')">
          <el-icon><Plus /></el-icon>
          <span>新增产品</span>
        </el-card>
        <el-card class="action-card" shadow="hover" @click="$router.push('/admin/categories')">
          <el-icon><FolderAdd /></el-icon>
          <span>管理分类</span>
        </el-card>
        <el-card class="action-card" shadow="hover" @click="$router.push('/admin/home-config')">
          <el-icon><PictureFilled /></el-icon>
          <span>配置首页</span>
        </el-card>
        <el-card class="action-card" shadow="hover" @click="$router.push('/')">
          <el-icon><View /></el-icon>
          <span>预览网站</span>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProductStore } from '@/stores/products'
import { useCategoryStore } from '@/stores/categories'

const productStore = useProductStore()
const categoryStore = useCategoryStore()

const stats = computed(() => [
  { label: '产品总数', value: productStore.products.length, icon: 'Goods', color: '#409eff' },
  { label: '产品分类', value: categoryStore.categories.length, icon: 'Menu', color: '#67c23a' },
  { label: '推荐展示', value: productStore.getFeatured().length, icon: 'Star', color: '#e6a23c' },
  { label: '数据存储', value: 'Local', icon: 'DataLine', color: '#909399' }
])
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
.stat-card {
  background: #fff; border-radius: 12px; padding: 24px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.stat-icon { font-size: 36px; }
.stat-value { font-size: 28px; font-weight: 700; color: #1a1a2e; }
.stat-label { font-size: 13px; color: #888; margin-top: 2px; }

.quick-actions h3 { font-size: 16px; font-weight: 600; margin: 0 0 16px; }
.action-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.action-card {
  cursor: pointer; text-align: center; padding: 8px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.action-card :deep(.el-card__body) { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 24px; }
.action-card .el-icon { font-size: 28px; color: #409eff; }
.action-card span { font-size: 14px; color: #555; }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .action-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

<template>
  <div class="product-manage">
    <div class="toolbar">
      <el-input v-model="search" placeholder="搜索产品名称..." clearable style="width: 240px;">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="filterCategory" placeholder="全部分类" clearable style="width: 160px;">
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-button type="primary" @click="$router.push('/admin/products/new')">
        <el-icon><Plus /></el-icon> 新增产品
      </el-button>
      <el-tooltip content="拖动左侧 ⠿ 图标可调整产品顺序，顺序影响前台展示" placement="top">
        <el-icon style="color:#aaa;cursor:help;font-size:16px;"><QuestionFilled /></el-icon>
      </el-tooltip>
    </div>

    <!-- 产品表格（支持拖拽排序） -->
    <el-table
      ref="tableRef"
      :data="filteredProducts"
      stripe border
      row-key="id"
      style="width: 100%;"
    >
      <!-- 拖拽手柄列 -->
      <el-table-column width="44" align="center">
        <template #default>
          <span class="drag-handle" title="拖动排序">⠿</span>
        </template>
      </el-table-column>

      <el-table-column label="排序" width="60" align="center">
        <template #default="{ row }">
          <span style="color:#aaa;font-size:12px;">{{ row.sort }}</span>
        </template>
      </el-table-column>

      <el-table-column label="图片" width="90">
        <template #default="{ row }">
          <img :src="row.images?.[0] || row.image" style="width:60px;height:45px;object-fit:cover;border-radius:6px;" />
        </template>
      </el-table-column>

      <el-table-column prop="name" label="产品名称" min-width="150" />

      <el-table-column label="分类" width="110">
        <template #default="{ row }">{{ getCategoryName(row.categoryId) }}</template>
      </el-table-column>

      <el-table-column label="价格" width="160">
        <template #default="{ row }">
          <span class="price-text" v-html="row.priceRichText || '价格请咨询'"></span>
        </template>
      </el-table-column>

      <el-table-column label="图片数" width="70" align="center">
        <template #default="{ row }">{{ row.images?.length || 1 }}</template>
      </el-table-column>

      <el-table-column label="推荐" width="70" align="center">
        <template #default="{ row }">
          <el-tag :type="row.featured ? 'success' : 'info'" size="small">{{ row.featured ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <el-button text type="primary" size="small" @click="$router.push(`/admin/products/${row.id}/edit`)">编辑</el-button>
          <el-popconfirm title="确认删除该产品？" @confirm="deleteProduct(row.id)">
            <template #reference>
              <el-button text type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import Sortable from 'sortablejs'
import { useProductStore } from '@/stores/products'
import { useCategoryStore } from '@/stores/categories'

const productStore = useProductStore()
const categoryStore = useCategoryStore()

const search = ref('')
const filterCategory = ref(null)
const tableRef = ref()
const categories = computed(() => categoryStore.categories)

const filteredProducts = computed(() => {
  const sorted = productStore.getSorted()
  return sorted.filter(p => {
    const matchSearch = !search.value || p.name.includes(search.value)
    const matchCat = !filterCategory.value || p.categoryId === filterCategory.value
    return matchSearch && matchCat
  })
})

function getCategoryName(id) {
  return categories.value.find(c => c.id === id)?.name || '未分类'
}

function deleteProduct(id) {
  productStore.remove(id)
  ElMessage.success('已删除')
}

// ── 拖拽排序 ──────────────────────────────────────
let sortableInstance = null

function initSortable() {
  nextTick(() => {
    const el = tableRef.value?.$el?.querySelector('.el-table__body tbody')
    if (!el || sortableInstance) return
    sortableInstance = Sortable.create(el, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd({ newIndex, oldIndex }) {
        if (newIndex === oldIndex) return
        // 获取当前显示顺序的 id 列表
        const rows = [...el.querySelectorAll('tr')]
        const orderedIds = rows.map(tr => {
          const nameCell = tr.querySelector('td:nth-child(4)')
          const name = nameCell?.textContent?.trim()
          return filteredProducts.value.find(p => p.name === name)?.id
        }).filter(Boolean)
        if (orderedIds.length) {
          productStore.reorder(orderedIds)
          ElMessage.success('排序已保存')
        }
      }
    })
  })
}

onMounted(() => { initSortable() })
onUnmounted(() => { sortableInstance?.destroy(); sortableInstance = null })
watch(filteredProducts, () => {
  sortableInstance?.destroy()
  sortableInstance = null
  initSortable()
})
</script>

<style scoped>
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.drag-handle { cursor: grab; font-size: 18px; color: #bbb; user-select: none; padding: 0 4px; }
.drag-handle:active { cursor: grabbing; }
.price-text { font-size: 13px; }
.price-text :deep(strong) { font-weight: 600; }
:global(.sortable-ghost) { opacity: 0.4; background: #ecf5ff !important; }
</style>

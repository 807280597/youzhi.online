<template>
  <div class="category-manage">
    <div class="toolbar">
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 新增分类
      </el-button>
    </div>

    <el-table :data="categories" stripe border style="width: 100%; max-width: 600px;">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="分类名称" />
      <el-table-column label="产品数量" width="100">
        <template #default="{ row }">
          {{ getProductCount(row.id) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button text type="primary" size="small" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="删除分类不会删除产品，确认删除？" @confirm="deleteCategory(row.id)">
            <template #reference>
              <el-button text type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑分类' : '新增分类'" width="400px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useCategoryStore } from '@/stores/categories'
import { useProductStore } from '@/stores/products'

const categoryStore = useCategoryStore()
const productStore = useProductStore()
const categories = computed(() => categoryStore.categories)

function getProductCount(categoryId) {
  return productStore.products.filter(p => p.categoryId === categoryId).length
}

const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref()
const form = reactive({ name: '', sort: 1 })
const rules = { name: [{ required: true, message: '请输入分类名称' }] }

function openDialog(category = null) {
  editingId.value = category?.id || null
  Object.assign(form, category ? { name: category.name, sort: category.sort } : { name: '', sort: 1 })
  dialogVisible.value = true
}

async function submitForm() {
  await formRef.value.validate()
  if (editingId.value) {
    categoryStore.update(editingId.value, { ...form })
    ElMessage.success('分类已更新')
  } else {
    categoryStore.add({ ...form })
    ElMessage.success('分类已添加')
  }
  dialogVisible.value = false
}

function deleteCategory(id) {
  categoryStore.remove(id)
  ElMessage.success('已删除')
}
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
</style>

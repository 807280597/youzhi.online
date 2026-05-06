<template>
  <div class="product-edit">
    <!-- 顶部操作栏 -->
    <div class="edit-header">
      <el-button text @click="$router.push('/admin/products')">
        <el-icon><ArrowLeft /></el-icon> 返回列表
      </el-button>
      <h2>{{ isEdit ? '编辑产品' : '新增产品' }}</h2>
      <el-button type="primary" :loading="saving" @click="save">保存</el-button>
    </div>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="edit-form">
      <div class="edit-grid">

        <!-- 左列：基础信息 + 价格 + 规格 -->
        <div class="col-left">
          <el-card shadow="never" class="section-card">
            <template #header><span class="card-title">基础信息</span></template>
            <el-form-item label="产品名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="产品分类" prop="categoryId">
              <el-select v-model="form.categoryId" style="width:100%">
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="简短描述" prop="shortDesc">
              <el-input v-model="form.shortDesc" maxlength="60" show-word-limit />
            </el-form-item>
            <el-form-item label="库存">
              <el-input-number v-model="form.stock" :min="0" style="width:100%" />
            </el-form-item>
            <el-form-item label="首页推荐">
              <el-switch v-model="form.featured" />
            </el-form-item>
          </el-card>

          <!-- 价格配置（富文本） -->
          <el-card shadow="never" class="section-card">
            <template #header><span class="card-title">价格设置</span></template>

            <!-- 快捷模板 -->
            <div class="price-templates">
              <span class="template-label">快捷填入：</span>
              <el-button size="small" @click="applyPriceTemplate('single')">固定价格</el-button>
              <el-button size="small" @click="applyPriceTemplate('range')">区间价格</el-button>
              <el-button size="small" @click="applyPriceTemplate('usd')">含美元</el-button>
              <el-button size="small" @click="applyPriceTemplate('inquiry')">询价</el-button>
            </div>

            <!-- 富文本工具栏 -->
            <div class="rte-toolbar">
              <button type="button" class="rte-btn" title="加粗" @mousedown.prevent="execCmd('bold')"><b>B</b></button>
              <button type="button" class="rte-btn" title="斜体" @mousedown.prevent="execCmd('italic')"><i>I</i></button>
              <span class="rte-divider"></span>
              <label class="rte-btn rte-btn--color" title="字体颜色">
                <span>A</span>
                <input type="color" value="#e6a23c" @input="e => execCmd('foreColor', e.target.value)" />
              </label>
              <button type="button" class="rte-btn" title="清除格式" @mousedown.prevent="execCmd('removeFormat')">
                <el-icon><RefreshLeft /></el-icon>
              </button>
            </div>

            <!-- 富文本编辑区 -->
            <div
              ref="priceEditorRef"
              class="rte-editor"
              contenteditable="true"
              @input="onPriceInput"
              @blur="onPriceInput"
            ></div>

            <div class="price-hint">
              示例：<code>¥199 ~ ¥599</code>、<code>¥299 / $49</code>、<code>询价 / 面议</code>
            </div>

            <!-- 隐藏数值价格 -->
            <el-form-item label="参考数值" style="margin-top:14px">
              <el-input-number v-model="form.priceNumber" :min="0" :precision="2" style="width:100%" />
              <div class="field-hint">前台不展示，保留供未来排序/筛选使用</div>
            </el-form-item>
          </el-card>

          <!-- 规格参数 -->
          <el-card shadow="never" class="section-card">
            <template #header><span class="card-title">规格参数</span></template>
            <div class="specs-editor">
              <div v-for="(spec, i) in form.specs" :key="i" class="spec-row">
                <el-input v-model="spec.name" placeholder="参数名" style="width:130px" />
                <el-input v-model="spec.value" placeholder="参数值" style="flex:1" />
                <el-button text type="danger" :icon="Delete" @click="form.specs.splice(i,1)" />
              </div>
              <el-button size="small" @click="form.specs.push({name:'',value:''})">
                <el-icon><Plus /></el-icon> 添加参数
              </el-button>
            </div>
          </el-card>
        </div>

        <!-- 右列：图片管理 + 详情块 -->
        <div class="col-right">

          <!-- 产品图片管理 -->
          <el-card shadow="never" class="section-card">
            <template #header>
              <span class="card-title">产品图片</span>
              <span class="card-hint">第一张为主图/缩略图 · 拖动可排序 · 前端以 1:1 正方形展示</span>
            </template>
            <p class="img-upload-tip">
              <el-icon><InfoFilled /></el-icon>
              前端将以 <strong>1:1 正方形</strong>比例展示，图片会居中裁剪。请确保产品主体在画面中央，可上传任意尺寸原图。
            </p>
            <div class="image-grid" ref="imageGridRef">
              <div
                v-for="(img, i) in form.images"
                :key="img + i"
                class="img-item"
                :class="{ 'is-main': i === 0 }"
              >
                <img :src="img" :alt="`图片${i+1}`" />
                <span v-if="i === 0" class="main-badge">主图</span>
                <div class="img-actions">
                  <el-button v-if="i > 0" circle size="small" type="primary" title="设为主图" @click="setMain(i)">
                    <el-icon><Star /></el-icon>
                  </el-button>
                  <el-button circle size="small" type="danger" @click="removeImg(i)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <label class="img-upload-btn" for="img-upload">
                <el-icon><Plus /></el-icon>
                <span>上传图片</span>
                <small>JPG/PNG ≤2MB</small>
              </label>
              <input id="img-upload" type="file" accept="image/*" multiple hidden @change="onImgUpload" />
            </div>
          </el-card>

          <!-- 详情内容块 -->
          <el-card shadow="never" class="section-card">
            <template #header>
              <span class="card-title">产品详情</span>
              <span class="card-hint">拖动 ⠿ 可调整顺序，前台按此顺序渲染</span>
            </template>
            <div class="blocks-list" ref="blocksRef">
              <div
                v-for="(block, i) in form.detailBlocks"
                :key="block._key"
                class="block-item"
              >
                <div class="block-header">
                  <span class="drag-handle">⠿</span>
                  <el-tag size="small" :type="block.type === 'image' ? 'success' : 'info'">
                    {{ block.type === 'image' ? '图片块' : '文字块' }}
                  </el-tag>
                  <el-button text type="danger" size="small" :icon="Delete" @click="removeBlock(i)" />
                </div>

                <template v-if="block.type === 'text'">
                  <el-input
                    v-model="block.content"
                    type="textarea"
                    :rows="4"
                    placeholder="输入段落文字..."
                    style="margin-top:8px"
                  />
                </template>

                <template v-else>
                  <div style="margin-top:8px">
                    <div v-if="block.content" class="block-img-preview">
                      <img :src="block.content" alt="详情图" />
                      <el-button class="replace-btn" size="small" type="primary" @click="triggerBlockImgUpload(i)">替换图片</el-button>
                    </div>
                    <label v-else class="block-img-placeholder" @click="triggerBlockImgUpload(i)">
                      <el-icon><Picture /></el-icon>
                      <span>点击上传图片</span>
                      <small>建议宽度 800px 以上</small>
                    </label>
                    <input :ref="el => blockImgInputs[i] = el" type="file" accept="image/*" hidden @change="e => onBlockImgUpload(e, i)" />
                  </div>
                  <el-input v-model="block.caption" placeholder="图片说明（可选）" size="small" style="margin-top:8px" />
                </template>
              </div>
            </div>
            <div class="add-block-btns">
              <el-button @click="addBlock('text')"><el-icon><Document /></el-icon> 添加文字块</el-button>
              <el-button @click="addBlock('image')"><el-icon><Picture /></el-icon> 添加图片块</el-button>
            </div>
          </el-card>

        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import { useProductStore } from '@/stores/products'
import { useCategoryStore } from '@/stores/categories'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const categoryStore = useCategoryStore()

const isEdit = computed(() => !!route.params.id)
const categories = computed(() => categoryStore.categories)
const saving = ref(false)
const formRef = ref()
const imageGridRef = ref()
const blocksRef = ref()
const blockImgInputs = ref([])
const priceEditorRef = ref()

// ── 表单数据 ──────────────────────────────────────
const form = reactive({
  name: '', categoryId: null, shortDesc: '', stock: 0, featured: false,
  priceRichText: '', priceNumber: null,
  specs: [], images: [], detailBlocks: []
})

const rules = {
  name: [{ required: true, message: '请输入产品名称' }],
  categoryId: [{ required: true, message: '请选择分类' }],
  shortDesc: [{ required: true, message: '请输入简短描述' }]
}

// 加载已有产品数据
if (isEdit.value) {
  const p = productStore.getById(route.params.id)
  if (p) {
    const data = JSON.parse(JSON.stringify(p))
    if (!data.images?.length) data.images = data.image ? [data.image] : []
    if (!data.detailBlocks) {
      data.detailBlocks = data.description
        ? [{ type: 'text', content: data.description, caption: '', _key: Date.now() }]
        : []
    }
    data.detailBlocks = data.detailBlocks.map((b, i) => ({ ...b, _key: b._key || Date.now() + i }))
    Object.assign(form, data)
  }
}

// ── 价格富文本编辑器 ──────────────────────────────
function onPriceInput() {
  form.priceRichText = priceEditorRef.value?.innerHTML || ''
}

function execCmd(cmd, value) {
  priceEditorRef.value?.focus()
  document.execCommand(cmd, false, value ?? null)
  onPriceInput()
}

const PRICE_TEMPLATES = {
  single:  '<strong style="color:#e6a23c;font-size:18px;">¥199</strong>',
  range:   '<strong style="color:#e6a23c;font-size:18px;">¥199 ~ ¥599</strong>',
  usd:     '<strong style="color:#e6a23c;font-size:18px;">¥299</strong>&nbsp;<span style="color:#999;font-size:13px;">/ $49.99</span>',
  inquiry: '<span style="color:#e6a23c;font-size:16px;">询价 / 面议</span>'
}

function applyPriceTemplate(type) {
  form.priceRichText = PRICE_TEMPLATES[type]
  if (priceEditorRef.value) priceEditorRef.value.innerHTML = form.priceRichText
}

// ── 图片管理 ──────────────────────────────────────
function onImgUpload(e) {
  Array.from(e.target.files).forEach(file => {
    if (file.size > 2 * 1024 * 1024) { ElMessage.warning(`${file.name} 超过2MB，已跳过`); return }
    const reader = new FileReader()
    reader.onload = ev => form.images.push(ev.target.result)
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

function removeImg(i) { form.images.splice(i, 1) }

function setMain(i) {
  const [img] = form.images.splice(i, 1)
  form.images.unshift(img)
}

let imgSortable = null
function initImgSortable() {
  nextTick(() => {
    const el = imageGridRef.value
    if (!el || imgSortable) return
    imgSortable = Sortable.create(el, {
      animation: 150, filter: '.img-upload-btn', ghostClass: 'sortable-ghost',
      onEnd({ newIndex, oldIndex }) {
        if (newIndex === oldIndex) return
        const moved = form.images.splice(oldIndex, 1)[0]
        form.images.splice(newIndex, 0, moved)
      }
    })
  })
}

// ── 详情块管理 ────────────────────────────────────
function addBlock(type) {
  form.detailBlocks.push({ type, content: '', caption: '', _key: Date.now() })
}
function removeBlock(i) { form.detailBlocks.splice(i, 1) }
function triggerBlockImgUpload(i) { blockImgInputs.value[i]?.click() }
function onBlockImgUpload(e, i) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { ElMessage.warning('图片超过2MB'); return }
  const reader = new FileReader()
  reader.onload = ev => { form.detailBlocks[i].content = ev.target.result }
  reader.readAsDataURL(file)
  e.target.value = ''
}

let blockSortable = null
function initBlockSortable() {
  nextTick(() => {
    const el = blocksRef.value
    if (!el || blockSortable) return
    blockSortable = Sortable.create(el, {
      handle: '.drag-handle', animation: 150, ghostClass: 'sortable-ghost',
      onEnd({ newIndex, oldIndex }) {
        if (newIndex === oldIndex) return
        const moved = form.detailBlocks.splice(oldIndex, 1)[0]
        form.detailBlocks.splice(newIndex, 0, moved)
      }
    })
  })
}

// ── 保存 ──────────────────────────────────────────
async function save() {
  await formRef.value.validate()
  if (!form.images.length) { ElMessage.warning('请至少上传一张产品图片'); return }
  saving.value = true
  try {
    const data = JSON.parse(JSON.stringify(form))
    data.image = data.images[0]
    data.detailBlocks = data.detailBlocks.map(({ _key, ...b }) => b)
    if (isEdit.value) {
      productStore.update(Number(route.params.id), data)
      ElMessage.success('产品已更新')
    } else {
      productStore.add(data)
      ElMessage.success('产品已添加')
    }
    router.push('/admin/products')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  // 初始化富文本编辑器内容
  if (priceEditorRef.value) {
    priceEditorRef.value.innerHTML = form.priceRichText || ''
  }
  initImgSortable()
  initBlockSortable()
})
onUnmounted(() => {
  imgSortable?.destroy()
  blockSortable?.destroy()
})
</script>

<style scoped>
.product-edit { padding-bottom: 40px; }

.edit-header {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 24px; padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}
.edit-header h2 { flex: 1; margin: 0; font-size: 18px; }

.edit-grid { display: grid; grid-template-columns: 420px 1fr; gap: 20px; align-items: start; }
.col-left, .col-right { display: flex; flex-direction: column; gap: 16px; }

.section-card :deep(.el-card__header) {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px;
}
.card-title { font-weight: 600; font-size: 14px; }
.card-hint { font-size: 12px; color: #aaa; }
.field-hint { font-size: 11px; color: #bbb; margin-top: 4px; }

/* 价格富文本编辑器 */
.price-templates {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  margin-bottom: 10px;
}
.template-label { font-size: 12px; color: #888; }

.rte-toolbar {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 8px; background: #f5f7fa;
  border: 1px solid #e0e0e0; border-bottom: none;
  border-radius: 6px 6px 0 0;
}
.rte-btn {
  min-width: 30px; height: 28px; padding: 0 8px;
  border: 1px solid transparent; border-radius: 4px;
  background: transparent; cursor: pointer; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.rte-btn:hover { background: #e0e6f0; border-color: #c0c8d8; }
.rte-btn--color { position: relative; gap: 2px; }
.rte-btn--color span { font-weight: 700; font-size: 14px; text-decoration: underline; text-decoration-color: #e6a23c; }
.rte-btn--color input[type=color] {
  position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
}
.rte-divider { width: 1px; height: 18px; background: #ddd; margin: 0 2px; }

.rte-editor {
  min-height: 52px; padding: 10px 12px;
  border: 1px solid #e0e0e0; border-radius: 0 0 6px 6px;
  font-size: 15px; line-height: 1.6; outline: none;
  background: #fff; cursor: text;
}
.rte-editor:focus { border-color: #409eff; box-shadow: 0 0 0 2px rgba(64,158,255,0.15); }
.rte-editor:empty::before {
  content: '在此输入价格，如：¥199 ~ ¥599';
  color: #bbb; pointer-events: none;
}

.price-hint {
  margin-top: 8px; font-size: 12px; color: #aaa;
}
.price-hint code {
  background: #f0f0f0; padding: 1px 5px; border-radius: 3px;
  font-size: 11px; margin: 0 2px;
}

.specs-editor { width: 100%; }
.spec-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }

/* 图片网格 */
.image-grid { display: flex; flex-wrap: wrap; gap: 10px; min-height: 90px; }
.img-item {
  position: relative; width: 100px; height: 100px; /* 1:1 正方形预览 */
  border-radius: 8px; overflow: hidden;
  border: 2px solid #e0e0e0; cursor: grab;
}
.img-item.is-main { border-color: #409eff; }
.img-item img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
.main-badge {
  position: absolute; top: 4px; left: 4px;
  background: #409eff; color: #fff;
  font-size: 10px; padding: 1px 6px; border-radius: 3px;
}
.img-actions {
  position: absolute; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; gap: 6px;
  opacity: 0; transition: opacity 0.2s;
}
.img-item:hover .img-actions { opacity: 1; }
.img-upload-btn {
  width: 100px; height: 100px; border-radius: 8px; /* 与预览保持一致 */
  border: 2px dashed #d0d0d0; background: #fafafa;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; cursor: pointer; color: #aaa; transition: all 0.2s;
}
.img-upload-btn:hover { border-color: #409eff; color: #409eff; }
.img-upload-btn .el-icon { font-size: 20px; }
.img-upload-btn span { font-size: 11px; }
.img-upload-btn small { font-size: 10px; color: #ccc; }

.img-upload-tip {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 12px; color: #888; margin: 0 0 12px;
  padding: 8px 10px; background: #f8faff; border-radius: 6px;
}
.img-upload-tip .el-icon { color: #409eff; flex-shrink: 0; margin-top: 1px; }
.img-upload-tip strong { color: #409eff; }

/* 详情块 */
.blocks-list { display: flex; flex-direction: column; gap: 12px; min-height: 40px; }
.block-item { border: 1px solid #e8e8e8; border-radius: 10px; padding: 12px; background: #fafafa; }
.block-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.drag-handle { cursor: grab; font-size: 18px; color: #bbb; user-select: none; }
.drag-handle:active { cursor: grabbing; }
.block-header .el-button { margin-left: auto; }

.block-img-preview { position: relative; display: inline-block; }
.block-img-preview img { max-width: 100%; max-height: 200px; border-radius: 8px; display: block; }
.replace-btn { position: absolute; bottom: 8px; right: 8px; }
.block-img-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; border: 2px dashed #d0d0d0; border-radius: 10px;
  padding: 32px; cursor: pointer; color: #aaa; transition: all 0.2s;
}
.block-img-placeholder:hover { border-color: #409eff; color: #409eff; }
.block-img-placeholder .el-icon { font-size: 28px; }

.add-block-btns { display: flex; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; }

:global(.sortable-ghost) { opacity: 0.4; background: #ecf5ff !important; }

@media (max-width: 1100px) {
  .edit-grid { grid-template-columns: 1fr; }
}
</style>

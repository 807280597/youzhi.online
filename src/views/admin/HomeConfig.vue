<template>
  <div class="home-config">
    <el-tabs v-model="activeTab">

      <!-- Logo 配置 -->
      <el-tab-pane label="Logo 配置" name="logo">
        <div class="tab-content">
          <el-form label-width="100px">
            <el-form-item label="网站 Logo">
              <div class="upload-area">
                <div class="img-preview logo-preview" v-if="logoPreview">
                  <img :src="logoPreview" alt="logo" />
                  <el-button class="remove-btn" type="danger" circle size="small" :icon="Delete" @click="removeLogo" />
                </div>
                <label v-else class="upload-placeholder" for="logo-upload">
                  <el-icon><Plus /></el-icon>
                  <span>点击上传</span>
                  <small>建议尺寸：200×60px，PNG/SVG，透明背景</small>
                </label>
                <input id="logo-upload" type="file" accept="image/*" hidden @change="onLogoUpload" />
              </div>
            </el-form-item>
          </el-form>
          <div class="form-actions">
            <el-button type="primary" @click="saveLogo">保存 Logo</el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- Banner 配置 -->
      <el-tab-pane label="Banner 轮播" name="banner">
        <div class="tab-content">
          <el-alert
            title="只有上传了图片的 Banner 才会在前台展示；不配置任何 Banner 则整个轮播区域不显示。"
            type="info" :closable="false" show-icon style="margin-bottom:16px"
          />
          <p class="tip">建议尺寸：1200×450px，JPG/PNG，≤ 2MB</p>

          <div class="banner-list" v-if="banners.length">
            <el-card v-for="(banner, i) in banners" :key="banner.id" class="banner-item" shadow="never">
              <div class="upload-area">
                <div class="img-preview banner-preview" v-if="banner.image">
                  <img :src="banner.image" alt="banner" />
                  <el-button class="remove-btn" type="danger" circle size="small" :icon="Delete" @click="banner.image = ''" />
                </div>
                <label v-else class="upload-placeholder banner-placeholder" :for="`banner-upload-${i}`">
                  <el-icon><Picture /></el-icon>
                  <span>点击上传 Banner 图</span>
                  <small>1200×450px · 未上传图片则此条不展示</small>
                </label>
                <input :id="`banner-upload-${i}`" type="file" accept="image/*" hidden @change="e => onBannerUpload(e, i)" />
              </div>

              <el-form :model="banner" label-width="70px" size="small" style="margin-top:12px">
                <el-form-item label="标题">
                  <el-input v-model="banner.title" />
                </el-form-item>
                <el-form-item label="副标题">
                  <el-input v-model="banner.subtitle" />
                </el-form-item>
                <el-form-item label="链接">
                  <el-input v-model="banner.link" placeholder="/products" />
                </el-form-item>
              </el-form>
              <el-button type="danger" text size="small" @click="removeBanner(i)">
                <el-icon><Delete /></el-icon> 删除此 Banner
              </el-button>
            </el-card>
          </div>

          <el-empty v-else description="暂无 Banner，点击下方按钮添加" :image-size="80" />

          <el-button @click="addBanner" style="margin-top:12px">
            <el-icon><Plus /></el-icon> 添加 Banner
          </el-button>
          <div class="form-actions">
            <el-button type="primary" @click="saveBanners">保存 Banner 配置</el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- 推荐产品 -->
      <el-tab-pane label="推荐产品" name="featured">
        <div class="tab-content">
          <p class="tip">选择在首页展示的推荐产品（建议4-8个）</p>
          <div class="product-select-grid">
            <div
              v-for="p in allProducts"
              :key="p.id"
              class="product-select-item"
              :class="{ selected: featuredIds.includes(p.id) }"
              @click="toggleFeatured(p.id)"
            >
              <img :src="p.images?.[0] || p.image" :alt="p.name" />
              <div class="item-info">
                <span class="item-name">{{ p.name }}</span>
                <el-icon v-if="featuredIds.includes(p.id)" class="check-icon"><CircleCheckFilled /></el-icon>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <el-button type="primary" @click="saveFeatured">保存推荐配置</el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- 关于我们 -->
      <el-tab-pane label="关于我们" name="about">
        <div class="tab-content">
          <el-alert
            title="有文字内容才展示「关于我们」模块；清空文字后保存，前台将不显示该模块。"
            type="info" :closable="false" show-icon style="margin-bottom:16px"
          />
          <el-form :model="companyInfo" label-width="100px">
            <el-form-item label="公司名称">
              <el-input v-model="companyInfo.name" />
            </el-form-item>
            <el-form-item label="口号">
              <el-input v-model="companyInfo.slogan" placeholder="显示在关于我们文字上方" />
            </el-form-item>
            <el-form-item label="关于我们">
              <el-input
                v-model="companyInfo.aboutText"
                type="textarea"
                :rows="6"
                placeholder="输入关于我们的文字内容，支持换行（按 Enter 分段）。留空则前台不显示此模块。"
              />
              <div class="field-hint">
                当前字数：{{ (companyInfo.aboutText || '').length }} 字 ·
                <span :style="{ color: companyInfo.aboutText?.trim() ? '#67c23a' : '#f56c6c' }">
                  {{ companyInfo.aboutText?.trim() ? '前台将显示此模块' : '前台将隐藏此模块' }}
                </span>
              </div>
            </el-form-item>
          </el-form>
          <div class="form-actions">
            <el-button type="primary" @click="saveCompany">保存关于我们</el-button>
          </div>
        </div>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Picture } from '@element-plus/icons-vue'
import { useHomeConfigStore } from '@/stores/homeConfig'
import { useProductStore } from '@/stores/products'

const homeStore = useHomeConfigStore()
const productStore = useProductStore()

const activeTab = ref('logo')
const allProducts = computed(() => productStore.getSorted())

// ── Logo ──────────────────────────────────────────
const logoPreview = ref(homeStore.config.logo || '')
function onLogoUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { logoPreview.value = ev.target.result }
  reader.readAsDataURL(file)
  e.target.value = ''
}
function removeLogo() { logoPreview.value = '' }
function saveLogo() {
  homeStore.updateLogo(logoPreview.value)
  ElMessage.success('Logo 已保存')
}

// ── Banner ────────────────────────────────────────
const banners = reactive(JSON.parse(JSON.stringify(homeStore.config.banners || [])))

function onBannerUpload(e, i) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { ElMessage.warning('图片超过2MB'); return }
  const reader = new FileReader()
  reader.onload = ev => { banners[i].image = ev.target.result }
  reader.readAsDataURL(file)
  e.target.value = ''
}
function addBanner() {
  banners.push({ id: Date.now(), image: '', title: '', subtitle: '', link: '/products' })
}
function removeBanner(i) { banners.splice(i, 1) }
function saveBanners() {
  homeStore.updateBanners(JSON.parse(JSON.stringify(banners)))
  ElMessage.success('Banner 配置已保存')
}

// ── Featured ──────────────────────────────────────
const featuredIds = ref([...(homeStore.config.featuredProductIds || [])])
function toggleFeatured(id) {
  const idx = featuredIds.value.indexOf(id)
  if (idx === -1) featuredIds.value.push(id)
  else featuredIds.value.splice(idx, 1)
}
function saveFeatured() {
  homeStore.updateFeaturedProducts([...featuredIds.value])
  ElMessage.success('推荐产品已保存')
}

// ── 关于我们 ──────────────────────────────────────
const companyInfo = reactive({
  name: homeStore.config.companyInfo?.name || '',
  slogan: homeStore.config.companyInfo?.slogan || '',
  aboutText: homeStore.config.companyInfo?.aboutText || ''
})
function saveCompany() {
  homeStore.updateCompanyInfo({ ...companyInfo })
  ElMessage.success('关于我们已保存')
}
</script>

<style scoped>
.tab-content { padding: 20px 0; }
.tip { color: #888; font-size: 13px; margin: 0 0 16px; }
.field-hint { font-size: 12px; color: #aaa; margin-top: 6px; }

/* 上传区 */
.upload-area { position: relative; display: inline-block; }
.upload-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; border: 2px dashed #d0d0d0; border-radius: 10px;
  cursor: pointer; color: #aaa; transition: border-color 0.2s; background: #fafafa;
}
.upload-placeholder:hover { border-color: #409eff; color: #409eff; }
.upload-placeholder .el-icon { font-size: 28px; }
.upload-placeholder span { font-size: 13px; }
.upload-placeholder small { font-size: 11px; color: #bbb; }

/* Logo */
.logo-preview { position: relative; display: inline-block; }
.logo-preview img { height: 60px; max-width: 200px; object-fit: contain; border-radius: 6px; border: 1px solid #eee; padding: 4px; }
label.upload-placeholder:not(.banner-placeholder) { width: 200px; height: 70px; }

/* Banner */
.banner-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.banner-preview { position: relative; }
.banner-preview img { width: 100%; aspect-ratio: 8/3; object-fit: cover; border-radius: 8px; display: block; }
.banner-placeholder { width: 100%; aspect-ratio: 8/3; }

.img-preview { position: relative; }
.remove-btn { position: absolute; top: 6px; right: 6px; opacity: 0; transition: opacity 0.2s; }
.img-preview:hover .remove-btn { opacity: 1; }

/* 推荐产品 */
.product-select-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.product-select-item {
  border: 2px solid #e0e0e0; border-radius: 10px;
  overflow: hidden; cursor: pointer; transition: all 0.2s;
}
.product-select-item.selected { border-color: #409eff; background: #ecf5ff; }
.product-select-item img { width: 100%; aspect-ratio: 3/2; object-fit: cover; }
.item-info { padding: 8px; display: flex; align-items: center; justify-content: space-between; }
.item-name { font-size: 12px; color: #333; }
.check-icon { color: #409eff; font-size: 16px; }

.form-actions { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f0f0f0; }

@media (max-width: 768px) {
  .banner-list { grid-template-columns: 1fr; }
  .product-select-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

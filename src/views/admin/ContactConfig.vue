<template>
  <div class="contact-config">

    <!-- 基础联系信息 -->
    <el-card shadow="never" class="section-card">
      <template #header><span class="card-title">基础联系信息</span></template>
      <el-form :model="form" label-width="100px">

        <!-- 联系电话（多个） -->
        <el-form-item label="联系电话">
          <div class="multi-input-list">
            <div v-for="(phone, i) in form.phones" :key="i" class="multi-input-row">
              <el-input v-model="form.phones[i]" placeholder="如：400-888-8888" style="flex:1" />
              <el-button text type="danger" :icon="Delete" @click="form.phones.splice(i,1)" />
            </div>
            <el-button size="small" @click="form.phones.push('')">
              <el-icon><Plus /></el-icon> 添加电话
            </el-button>
          </div>
        </el-form-item>

        <!-- 电子邮箱（多个） -->
        <el-form-item label="电子邮箱">
          <div class="multi-input-list">
            <div v-for="(email, i) in form.emails" :key="i" class="multi-input-row">
              <el-input v-model="form.emails[i]" placeholder="如：contact@example.com" style="flex:1" />
              <el-button text type="danger" :icon="Delete" @click="form.emails.splice(i,1)" />
            </div>
            <el-button size="small" @click="form.emails.push('')">
              <el-icon><Plus /></el-icon> 添加邮箱
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="公司地址">
          <el-input v-model="form.address" placeholder="如：北京市朝阳区xxx街道123号" />
        </el-form-item>

        <el-form-item label="工作时间">
          <el-input v-model="form.workHours" placeholder="如：周一至周五 9:00-18:00" />
        </el-form-item>

        <el-form-item label="版权文字">
          <el-input v-model="form.copyright" placeholder="留空则自动使用公司名称" />
          <div class="field-hint">显示在页面底部，如：© 2026 XX公司 版权所有</div>
        </el-form-item>

      </el-form>
    </el-card>

    <!-- 二维码配置 -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <span class="card-title">二维码</span>
        <span class="card-hint">支持公众号、客服微信等，鼠标悬停前台放大显示</span>
      </template>

      <div class="qrcode-grid">
        <div v-for="(qr, i) in form.qrcodes" :key="i" class="qrcode-item">
          <!-- 图片上传 -->
          <div class="qr-upload">
            <div v-if="qr.image" class="qr-preview">
              <img :src="qr.image" :alt="qr.name" />
              <el-button class="qr-remove" type="danger" circle size="small" :icon="Delete" @click="qr.image = ''" />
            </div>
            <label v-else class="qr-placeholder" :for="`qr-upload-${i}`">
              <el-icon><Picture /></el-icon>
              <span>上传二维码</span>
              <small>建议 300×300px</small>
            </label>
            <input :id="`qr-upload-${i}`" type="file" accept="image/*" hidden @change="e => onQrUpload(e, i)" />
          </div>
          <!-- 名称 -->
          <el-input v-model="qr.name" placeholder="名称，如：客服微信" size="small" style="margin-top:8px" />
          <el-button type="danger" text size="small" style="margin-top:4px" @click="form.qrcodes.splice(i,1)">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
        </div>

        <!-- 添加按钮 -->
        <div class="qrcode-add" @click="addQrcode">
          <el-icon><Plus /></el-icon>
          <span>添加二维码</span>
        </div>
      </div>
    </el-card>

    <!-- 社交链接 -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <span class="card-title">社交链接</span>
        <span class="card-hint">前台底部显示为图标链接，悬停有交互效果</span>
      </template>

      <div class="social-list">
        <div v-for="(link, i) in form.socialLinks" :key="link.id" class="social-row">
          <el-select v-model="link.platform" placeholder="平台" style="width:130px" @change="v => onPlatformChange(v, i)">
            <el-option v-for="p in PLATFORMS" :key="p.value" :label="p.label" :value="p.value">
              <span>{{ p.emoji }} {{ p.label }}</span>
            </el-option>
          </el-select>
          <el-input v-model="link.name" placeholder="显示名称" style="width:120px" />
          <el-input v-model="link.url" placeholder="链接 URL" style="flex:1" />
          <el-button text type="danger" :icon="Delete" @click="form.socialLinks.splice(i,1)" />
        </div>
        <el-button size="small" @click="addSocialLink">
          <el-icon><Plus /></el-icon> 添加社交链接
        </el-button>
      </div>
    </el-card>

    <!-- 保存按钮 -->
    <div class="save-bar">
      <el-button type="primary" size="large" @click="saveAll">保存所有配置</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Picture } from '@element-plus/icons-vue'
import { useContactStore } from '@/stores/contactConfig'

const contactStore = useContactStore()

// 支持的平台列表
const PLATFORMS = [
  { value: 'wechat',    label: '微信',      emoji: '💬' },
  { value: 'weibo',     label: '微博',      emoji: '🔴' },
  { value: 'douyin',    label: '抖音',      emoji: '🎵' },
  { value: 'xiaohongshu', label: '小红书',  emoji: '📕' },
  { value: 'bilibili',  label: 'B站',       emoji: '📺' },
  { value: 'zhihu',     label: '知乎',      emoji: '🔵' },
  { value: 'facebook',  label: 'Facebook',  emoji: '👤' },
  { value: 'twitter',   label: 'Twitter/X', emoji: '🐦' },
  { value: 'instagram', label: 'Instagram', emoji: '📷' },
  { value: 'youtube',   label: 'YouTube',   emoji: '▶️' },
  { value: 'linkedin',  label: 'LinkedIn',  emoji: '💼' },
  { value: 'other',     label: '其他',      emoji: '🔗' }
]

// 深拷贝初始化表单
const raw = contactStore.config
const form = reactive({
  phones:      [...(raw.phones || [])],
  emails:      [...(raw.emails || [])],
  address:     raw.address || '',
  workHours:   raw.workHours || '',
  copyright:   raw.copyright || '',
  qrcodes:     JSON.parse(JSON.stringify(raw.qrcodes || [])),
  socialLinks: JSON.parse(JSON.stringify(raw.socialLinks || []))
})

// ── 二维码 ────────────────────────────────────────
function addQrcode() {
  form.qrcodes.push({ id: Date.now(), name: '', image: '' })
}
function onQrUpload(e, i) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 1 * 1024 * 1024) { ElMessage.warning('二维码图片建议不超过1MB'); }
  const reader = new FileReader()
  reader.onload = ev => { form.qrcodes[i].image = ev.target.result }
  reader.readAsDataURL(file)
  e.target.value = ''
}

// ── 社交链接 ──────────────────────────────────────
function addSocialLink() {
  form.socialLinks.push({ id: Date.now(), platform: 'other', name: '', url: '', icon: 'other' })
}
function onPlatformChange(val, i) {
  const p = PLATFORMS.find(p => p.value === val)
  if (p) {
    form.socialLinks[i].icon = val
    if (!form.socialLinks[i].name) form.socialLinks[i].name = p.label
  }
}

// ── 保存 ──────────────────────────────────────────
function saveAll() {
  // 过滤空值
  const data = {
    phones:      form.phones.filter(p => p.trim()),
    emails:      form.emails.filter(e => e.trim()),
    address:     form.address.trim(),
    workHours:   form.workHours.trim(),
    copyright:   form.copyright.trim(),
    qrcodes:     form.qrcodes.filter(q => q.image || q.name),
    socialLinks: form.socialLinks.filter(s => s.url.trim())
  }
  contactStore.updateConfig(data)
  ElMessage.success('联系方式配置已保存')
}
</script>

<style scoped>
.contact-config { display: flex; flex-direction: column; gap: 16px; }

.section-card :deep(.el-card__header) {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px;
}
.card-title { font-weight: 600; font-size: 14px; }
.card-hint { font-size: 12px; color: #aaa; }
.field-hint { font-size: 11px; color: #bbb; margin-top: 4px; }

/* 多输入行 */
.multi-input-list { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.multi-input-row { display: flex; align-items: center; gap: 8px; }

/* 二维码网格 */
.qrcode-grid { display: flex; flex-wrap: wrap; gap: 16px; }
.qrcode-item {
  display: flex; flex-direction: column; align-items: center;
  width: 130px;
}
.qr-upload { width: 120px; height: 120px; position: relative; }
.qr-preview { width: 100%; height: 100%; position: relative; }
.qr-preview img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #eee; }
.qr-remove { position: absolute; top: 4px; right: 4px; opacity: 0; transition: opacity 0.2s; }
.qr-preview:hover .qr-remove { opacity: 1; }
.qr-placeholder {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; border: 2px dashed #d0d0d0; border-radius: 8px;
  cursor: pointer; color: #aaa; transition: all 0.2s; background: #fafafa;
}
.qr-placeholder:hover { border-color: #409eff; color: #409eff; }
.qr-placeholder .el-icon { font-size: 24px; }
.qr-placeholder span { font-size: 12px; }
.qr-placeholder small { font-size: 10px; color: #ccc; }

.qrcode-add {
  width: 120px; height: 120px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; border: 2px dashed #d0d0d0; border-radius: 8px;
  cursor: pointer; color: #aaa; transition: all 0.2s; background: #fafafa;
  margin-top: 0;
}
.qrcode-add:hover { border-color: #409eff; color: #409eff; }
.qrcode-add .el-icon { font-size: 24px; }
.qrcode-add span { font-size: 12px; }

/* 社交链接 */
.social-list { display: flex; flex-direction: column; gap: 10px; }
.social-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* 保存栏 */
.save-bar { padding: 16px 0; }
</style>

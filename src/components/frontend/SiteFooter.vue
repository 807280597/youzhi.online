<template>
  <footer class="site-footer">

    <!-- 联系方式区域：有任意内容才展示 -->
    <div v-if="hasContact" id="contact-section" class="footer-contact">
      <div class="footer-inner">
        <div class="footer-grid">

          <!-- 联系我们 -->
          <div v-if="hasBasicInfo" class="footer-col">
            <h4 class="col-title">联系我们</h4>
            <ul class="contact-list">
              <li v-for="(phone, i) in contact.phones" :key="'p'+i" class="contact-item">
                <span class="contact-icon">📞</span>
                <a :href="`tel:${phone}`">{{ phone }}</a>
              </li>
              <li v-for="(email, i) in contact.emails" :key="'e'+i" class="contact-item">
                <span class="contact-icon">✉️</span>
                <a :href="`mailto:${email}`">{{ email }}</a>
              </li>
              <li v-if="contact.address" class="contact-item">
                <span class="contact-icon">📍</span>
                <span>{{ contact.address }}</span>
              </li>
              <li v-if="contact.workHours" class="contact-item">
                <span class="contact-icon">🕐</span>
                <span>{{ contact.workHours }}</span>
              </li>
            </ul>
          </div>

          <!-- 关注我们（二维码 + 社交链接） -->
          <div v-if="hasFollowInfo" class="footer-col">
            <h4 class="col-title">关注我们</h4>

            <!-- 二维码 -->
            <div v-if="validQrcodes.length" class="qrcode-row">
              <div
                v-for="qr in validQrcodes"
                :key="qr.id || qr.name"
                class="qrcode-wrap"
              >
                <div class="qrcode-thumb">
                  <img :src="qr.image" :alt="qr.name" />
                  <!-- 悬停放大预览 -->
                  <div class="qrcode-popup">
                    <img :src="qr.image" :alt="qr.name" />
                    <p>{{ qr.name }}</p>
                  </div>
                </div>
                <span class="qrcode-name">{{ qr.name }}</span>
              </div>
            </div>

            <!-- 社交链接图标 -->
            <div v-if="validSocialLinks.length" class="social-icons">
              <a
                v-for="link in validSocialLinks"
                :key="link.id || link.platform"
                :href="link.url"
                :title="link.name"
                target="_blank"
                rel="noopener noreferrer"
                class="social-icon"
                :class="`social-${link.platform}`"
              >
                <span class="social-emoji">{{ getPlatformEmoji(link.platform) }}</span>
                <span class="social-label">{{ link.name }}</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 版权栏 -->
    <div class="footer-copyright">
      <div class="footer-inner">
        <p>© {{ currentYear }} {{ copyrightText }} · 保留所有权利</p>
      </div>
    </div>

  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useContactStore } from '@/stores/contactConfig'
import { useHomeConfigStore } from '@/stores/homeConfig'

const contactStore = useContactStore()
const homeStore = useHomeConfigStore()

const contact = computed(() => contactStore.config || {})
const currentYear = new Date().getFullYear()

// 版权文字：优先用配置，否则用公司名
const copyrightText = computed(() => {
  return contact.value.copyright?.trim()
    || homeStore.config?.companyInfo?.name
    || '版权所有'
})

// 有效数据过滤
const validQrcodes = computed(() =>
  (contact.value.qrcodes || []).filter(q => q.image)
)
const validSocialLinks = computed(() =>
  (contact.value.socialLinks || []).filter(s => s.url?.trim())
)

// 是否有基础联系信息
const hasBasicInfo = computed(() =>
  (contact.value.phones?.some(p => p.trim())) ||
  (contact.value.emails?.some(e => e.trim())) ||
  contact.value.address?.trim() ||
  contact.value.workHours?.trim()
)

// 是否有关注信息
const hasFollowInfo = computed(() =>
  validQrcodes.value.length > 0 || validSocialLinks.value.length > 0
)

// 整个联系区域是否有内容
const hasContact = computed(() => hasBasicInfo.value || hasFollowInfo.value)

// 平台 emoji 映射
const PLATFORM_EMOJI = {
  wechat: '💬', weibo: '🔴', douyin: '🎵', xiaohongshu: '📕',
  bilibili: '📺', zhihu: '🔵', facebook: '👤', twitter: '🐦',
  instagram: '📷', youtube: '▶️', linkedin: '💼', other: '🔗'
}
function getPlatformEmoji(platform) {
  return PLATFORM_EMOJI[platform] || '🔗'
}
</script>

<style scoped>
.site-footer { background: #1a1a2e; color: #aaa; }

.footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* 联系方式区域 */
.footer-contact { padding: 48px 0 40px; border-bottom: 1px solid #2a2a4e; }

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 40px;
}

.footer-col { }
.col-title {
  font-size: 15px; font-weight: 600; color: #fff;
  margin: 0 0 20px; padding-bottom: 10px;
  border-bottom: 2px solid #409eff; display: inline-block;
}

/* 联系列表 */
.contact-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.contact-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; line-height: 1.5; }
.contact-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }
.contact-item a { color: #bbb; text-decoration: none; transition: color 0.2s; }
.contact-item a:hover { color: #409eff; }
.contact-item span:last-child { color: #bbb; }

/* 二维码 */
.qrcode-row { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; }
.qrcode-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.qrcode-thumb {
  position: relative; width: 72px; height: 72px;
  border-radius: 8px; overflow: visible; cursor: pointer;
}
.qrcode-thumb > img {
  width: 72px; height: 72px; object-fit: cover;
  border-radius: 8px; border: 2px solid #2a2a4e;
  transition: border-color 0.2s;
}
.qrcode-thumb:hover > img { border-color: #409eff; }

/* 悬停放大弹出 */
.qrcode-popup {
  position: absolute; bottom: calc(100% + 10px); left: 50%;
  transform: translateX(-50%) scale(0.8);
  transform-origin: bottom center;
  background: #fff; border-radius: 10px;
  padding: 10px; text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  opacity: 0; pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 100; white-space: nowrap;
}
.qrcode-popup img { width: 140px; height: 140px; object-fit: cover; border-radius: 6px; display: block; }
.qrcode-popup p { font-size: 12px; color: #333; margin: 6px 0 0; }
.qrcode-thumb:hover .qrcode-popup {
  opacity: 1; transform: translateX(-50%) scale(1);
}

.qrcode-name { font-size: 12px; color: #888; }

/* 社交图标 */
.social-icons { display: flex; flex-wrap: wrap; gap: 10px; }
.social-icon {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 20px;
  background: rgba(255,255,255,0.06);
  color: #bbb; text-decoration: none; font-size: 13px;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s;
}
.social-icon:hover {
  background: #409eff; color: #fff;
  border-color: #409eff; transform: translateY(-2px);
}
.social-emoji { font-size: 15px; }

/* 版权栏 */
.footer-copyright { padding: 20px 0; text-align: center; }
.footer-copyright p { margin: 0; font-size: 13px; color: #666; }

/* 响应式 */
@media (max-width: 768px) {
  .footer-contact { padding: 32px 0 28px; }
  .footer-grid { grid-template-columns: 1fr; gap: 28px; }
  .qrcode-popup { left: 0; transform: translateX(0) scale(0.8); }
  .qrcode-thumb:hover .qrcode-popup { transform: translateX(0) scale(1); }
}
</style>

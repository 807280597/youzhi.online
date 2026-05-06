<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="admin-aside">
      <div class="aside-logo">
        <el-icon><Setting /></el-icon>
        <span>管理后台</span>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#1a1a2e"
        text-color="#bbb"
        active-text-color="#409eff"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>概览</span>
        </el-menu-item>
        <el-menu-item index="/admin/home-config">
          <el-icon><HomeFilled /></el-icon>
          <span>首页配置</span>
        </el-menu-item>
        <el-menu-item index="/admin/products">
          <el-icon><Goods /></el-icon>
          <span>产品管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/categories">
          <el-icon><Menu /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/contact">
          <el-icon><Phone /></el-icon>
          <span>联系方式</span>
        </el-menu-item>
        <el-divider style="border-color: #2a2a4e; margin: 8px 0;" />
        <el-menu-item index="preview" @click.prevent="previewSite">
          <el-icon><View /></el-icon>
          <span>预览网站</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <span class="page-title">{{ pageTitle }}</span>

        <div class="header-actions">
          <!-- 预览网站（新标签页） -->
          <el-button text @click="previewSite">
            <el-icon><View /></el-icon> 预览网站
          </el-button>

          <!-- 用户信息 + 操作下拉 -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-icon><UserFilled /></el-icon>
              <span>{{ authStore.username }}</span>
              <el-icon class="arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="changePwd">
                  <el-icon><Key /></el-icon> 修改密码
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  <span style="color:#f56c6c">退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>

  <!-- 修改密码弹窗 -->
  <el-dialog v-model="pwdDialogVisible" title="修改密码" width="400px" :close-on-click-modal="false">
    <el-form :model="pwdForm" label-width="90px">
      <el-form-item label="当前密码">
        <el-input v-model="pwdForm.current" type="password" show-password placeholder="请输入当前密码" />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="pwdForm.newPwd" type="password" show-password placeholder="至少6位" />
      </el-form-item>
      <el-form-item label="确认新密码">
        <el-input v-model="pwdForm.confirm" type="password" show-password placeholder="再次输入新密码" />
      </el-form-item>
      <p v-if="pwdError" class="pwd-error">{{ pwdError }}</p>
    </el-form>
    <template #footer>
      <el-button @click="pwdDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitChangePwd">确认修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// ── 页面标题 ──────────────────────────────────────
const titleMap = {
  '/admin/dashboard': '概览',
  '/admin/home-config': '首页配置',
  '/admin/products': '产品管理',
  '/admin/products/new': '新增产品',
  '/admin/categories': '分类管理',
  '/admin/contact': '联系方式配置'
}
const pageTitle = computed(() => {
  if (route.path.endsWith('/edit')) return '编辑产品'
  return titleMap[route.path] || '管理后台'
})

// ── 预览网站（新标签页）────────────────────────────
function previewSite() {
  window.open(window.location.origin + '/', '_blank')
}

// ── 下拉菜单命令 ──────────────────────────────────
function handleCommand(cmd) {
  if (cmd === 'changePwd') openChangePwd()
  if (cmd === 'logout') handleLogout()
}

// ── 退出登录 ──────────────────────────────────────
async function handleLogout() {
  await ElMessageBox.confirm('确认退出登录？', '提示', {
    confirmButtonText: '退出', cancelButtonText: '取消', type: 'warning'
  }).catch(() => null)
  authStore.logout()
  router.replace('/admin/login')
}

// ── 修改密码 ──────────────────────────────────────
const pwdDialogVisible = ref(false)
const pwdForm = reactive({ current: '', newPwd: '', confirm: '' })
const pwdError = ref('')

function openChangePwd() {
  pwdForm.current = ''
  pwdForm.newPwd = ''
  pwdForm.confirm = ''
  pwdError.value = ''
  pwdDialogVisible.value = true
}

function submitChangePwd() {
  pwdError.value = ''
  if (!pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm) {
    pwdError.value = '请填写所有字段'
    return
  }
  if (pwdForm.newPwd !== pwdForm.confirm) {
    pwdError.value = '两次输入的密码不一致'
    return
  }
  if (pwdForm.newPwd.length < 6) {
    pwdError.value = '密码长度至少6位'
    return
  }
  const result = authStore.changePassword(pwdForm.current, pwdForm.newPwd)
  if (!result.ok) {
    pwdError.value = result.msg
    return
  }
  pwdDialogVisible.value = false
  ElMessage.success('密码修改成功，请重新登录')
  setTimeout(() => {
    authStore.logout()
    router.replace('/admin/login')
  }, 1200)
}
</script>

<style scoped>
.admin-layout { height: 100vh; }
.admin-aside { background: #1a1a2e; overflow: hidden; }
.aside-logo {
  height: 64px; display: flex; align-items: center; gap: 10px;
  padding: 0 20px; color: #fff; font-size: 16px; font-weight: 700;
  border-bottom: 1px solid #2a2a4e;
}
.aside-logo .el-icon { font-size: 20px; color: #409eff; }
.admin-header {
  height: 64px; background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px;
}
.page-title { font-size: 16px; font-weight: 600; color: #1a1a2e; }
.admin-main { background: #f5f7fa; padding: 24px; overflow-y: auto; }

.header-actions { display: flex; align-items: center; gap: 8px; }

.user-info {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 8px; cursor: pointer;
  font-size: 14px; color: #555;
  transition: background 0.2s;
}
.user-info:hover { background: #f5f7fa; }
.user-info .el-icon { font-size: 16px; color: #409eff; }
.user-info .arrow { font-size: 12px; color: #aaa; }

.pwd-error { color: #f56c6c; font-size: 13px; margin: -4px 0 0 90px; }
</style>

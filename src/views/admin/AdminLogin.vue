<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <el-icon class="logo-icon"><Setting /></el-icon>
        <h1>管理后台</h1>
      </div>

      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
            autocomplete="username"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <el-button
          type="primary"
          size="large"
          style="width:100%"
          :loading="loading"
          @click="handleLogin"
        >登 录</el-button>
      </el-form>

      <p class="login-hint">默认账号：admin / admin123</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ username: '', password: '' })
const errorMsg = ref('')
const loading = ref(false)

function handleLogin() {
  errorMsg.value = ''
  if (!form.username || !form.password) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  // 模拟短暂延迟，避免按钮闪烁
  setTimeout(() => {
    const ok = authStore.login(form.username, form.password)
    loading.value = false
    if (ok) {
      router.replace('/admin/dashboard')
    } else {
      errorMsg.value = '用户名或密码错误'
      form.password = ''
    }
  }, 300)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.login-card {
  background: #fff; border-radius: 16px;
  padding: 48px 40px; width: 100%; max-width: 400px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.4);
}
.login-logo {
  text-align: center; margin-bottom: 36px;
}
.logo-icon {
  font-size: 48px; color: #409eff;
  display: block; margin: 0 auto 12px;
}
.login-logo h1 {
  font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0;
}
.error-msg {
  color: #f56c6c; font-size: 13px;
  margin: -8px 0 12px; text-align: center;
}
.login-hint {
  text-align: center; font-size: 12px; color: #bbb;
  margin: 16px 0 0;
}
</style>

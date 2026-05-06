import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const ACCOUNT_KEY = 'ps_admin_account'
const SESSION_KEY = 'ps_admin_logged_in'

// 简单的 base64 编码（非加密，仅混淆，满足题目要求）
function encode(str) { return btoa(unescape(encodeURIComponent(str))) }
function decode(str) {
  try { return decodeURIComponent(escape(atob(str))) } catch { return '' }
}

// 首次使用时初始化默认账号
function ensureAccount() {
  if (!localStorage.getItem(ACCOUNT_KEY)) {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify({
      username: 'admin',
      password: encode('admin123')
    }))
  }
}
ensureAccount()

export const useAuthStore = defineStore('auth', () => {
  // 用 sessionStorage 存登录态：关闭浏览器自动退出，刷新保持
  const isLoggedIn = ref(sessionStorage.getItem(SESSION_KEY) === 'true')

  const username = computed(() => {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNT_KEY))?.username || 'admin'
    } catch { return 'admin' }
  })

  function login(user, pass) {
    const account = JSON.parse(localStorage.getItem(ACCOUNT_KEY))
    if (!account) return false
    if (account.username === user && decode(account.password) === pass) {
      isLoggedIn.value = true
      sessionStorage.setItem(SESSION_KEY, 'true')
      return true
    }
    return false
  }

  function logout() {
    isLoggedIn.value = false
    sessionStorage.removeItem(SESSION_KEY)
  }

  function changePassword(currentPass, newPass) {
    const account = JSON.parse(localStorage.getItem(ACCOUNT_KEY))
    if (!account) return { ok: false, msg: '账号数据异常' }
    if (decode(account.password) !== currentPass) return { ok: false, msg: '当前密码错误' }
    if (newPass.length < 6) return { ok: false, msg: '密码长度至少6位' }
    account.password = encode(newPass)
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account))
    return { ok: true }
  }

  return { isLoggedIn, username, login, logout, changePassword }
})

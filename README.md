# 产品展示网站

基于 Vue 3 + Vite + Element Plus + Pinia 构建的产品展示网站，含前台展示和管理后台。

## 快速启动

```bash
cd product-showcase
npm install
npm run dev
```

浏览器访问：
- 前台：http://localhost:5173/
- 后台：http://localhost:5173/admin

## 目录结构

```
src/
├── main.js                  # 入口
├── router/index.js          # 路由（前台 / 后台）
├── stores/
│   ├── products.js          # 产品数据（localStorage）
│   ├── categories.js        # 分类数据（localStorage）
│   └── homeConfig.js        # 首页配置（localStorage）
├── components/
│   └── frontend/
│       ├── FrontLayout.vue  # 前台布局（含导航栏）
│       ├── Navbar.vue       # 顶部导航
│       └── ProductCard.vue  # 产品卡片
└── views/
    ├── frontend/
    │   ├── Home.vue         # 首页
    │   ├── ProductList.vue  # 产品列表
    │   └── ProductDetail.vue# 产品详情
    └── admin/
        ├── AdminLayout.vue  # 后台布局
        ├── Dashboard.vue    # 概览
        ├── HomeConfig.vue   # 首页配置
        ├── ProductManage.vue# 产品管理
        └── CategoryManage.vue# 分类管理
```

## 数据说明

所有数据存储在浏览器 localStorage，key 前缀为 `ps_`。
后期替换为真实 API 只需修改 `src/stores/` 中各 store 的读写逻辑即可。

## 产品数据结构（已预留电商字段）

```js
{
  id, categoryId,
  name, shortDesc, description,
  specs: [{ name, value }],
  image, images: [],
  price,    // 电商迭代用
  stock,    // 电商迭代用
  featured, createdAt
}
```

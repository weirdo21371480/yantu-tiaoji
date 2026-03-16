# 研途调剂 - 考研调剂信息平台

全栈考研调剂信息服务网站，帮助考研学子快速找到适合的调剂院校。

## 技术栈

- **前端**: React 19 + Vite 8 + Tailwind CSS 4 + React Router 7
- **后端**: Express 5 + SQLite (better-sqlite3) + JWT
- **部署**: Docker / Node.js

## 功能

- 首页：搜索、数据统计、热门/最新调剂信息
- 调剂信息列表：多维度筛选（专业、地区、学位类型）、排序
- 调剂详情：完整信息展示、在线申请
- 院校库：高校信息浏览与搜索
- 用户系统：注册、登录、JWT 认证

## 快速开始

```bash
# 安装依赖
npm install --legacy-peer-deps

# 开发模式（前后端同时启动）
# 终端1 - 后端
npm run dev:server

# 终端2 - 前端
npm run dev
```

前端: http://localhost:5173  
后端 API: http://localhost:3000/api

**演示账号**: demo@example.com / demo123456

## 生产部署

### 方式一：Node.js 直接部署

```bash
# 构建前端
npm run build

# 启动生产服务器（同时提供 API 和前端静态文件）
npm start
```

访问 http://localhost:3000

### 方式二：Docker 部署

```bash
# 使用 Docker Compose
docker compose up -d

# 或手动构建
docker build -t yantu-tiaoji .
docker run -p 3000:3000 -e JWT_SECRET=your-secret yantu-tiaoji
```

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 当前用户信息 |
| GET | `/api/listings` | 调剂列表（支持筛选排序） |
| GET | `/api/listings/hot` | 热门调剂 |
| GET | `/api/listings/latest` | 最新调剂 |
| GET | `/api/listings/stats` | 统计数据 |
| GET | `/api/listings/:id` | 调剂详情 |
| POST | `/api/listings/:id/apply` | 申请调剂 |
| GET | `/api/schools` | 院校列表 |
| GET | `/api/schools/:id` | 院校详情 |

## 项目结构

```
├── server/                 # 后端
│   ├── index.js           # Express 入口
│   ├── db.js              # 数据库初始化 & 种子数据
│   ├── routes/            # API 路由
│   │   ├── auth.js        # 认证
│   │   ├── listings.js    # 调剂信息
│   │   └── schools.js     # 院校
│   └── middleware/
│       └── auth.js        # JWT 中间件
├── src/                    # 前端
│   ├── api.js             # API 请求模块
│   ├── context/           # React Context
│   ├── components/        # 公共组件
│   ├── pages/             # 页面
│   └── data/              # Mock 数据（备用）
├── Dockerfile
├── docker-compose.yml
└── package.json
```

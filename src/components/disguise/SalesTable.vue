<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

interface OrderRow {
  id: string;
  customer: string;
  region: string;
  owner: string;
  amount: number;
  status: 'ok' | 'wait' | 'bad';
  date: string;
}

const customers = [
  '杭州云启科技',
  '苏州明远贸易',
  '广州锐驰电子',
  '成都天成物流',
  '南京华芯半导',
  '深圳联合数据',
  '武汉长江仪器',
  '西安西北能源',
  '青岛海联食品',
  '合肥智造机械',
  '天津北方化工',
  '长沙湘江传媒',
  '厦门鹭岛旅游',
  '重庆山城建材',
  '沈阳东北重工',
];

const regions = ['华东', '华南', '华中', '西南', '华北', '东北', '西北'];
const owners = ['张伟', '李静', '王强', '刘洋', '陈晨', '赵敏', '孙磊', '周涛'];
const statuses: OrderRow['status'][] = ['ok', 'wait', 'bad', 'ok', 'ok', 'wait'];

const rows = ref<OrderRow[]>([]);
const currentTime = ref('');
let refreshTimer: number | null = null;
let clockTimer: number | null = null;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatAmount(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function generateRows(count = 12): OrderRow[] {
  const list: OrderRow[] = [];
  for (let i = 0; i < count; i++) {
    const day = randomInt(1, 28);
    const month = randomInt(1, 9);
    list.push({
      id: `SO2026${String(10000 + i * 7 + randomInt(0, 6))}`,
      customer: randomPick(customers),
      region: randomPick(regions),
      owner: randomPick(owners),
      amount: randomInt(2000, 500000),
      status: randomPick(statuses),
      date: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }
  return list;
}

function refreshData() {
  rows.value = generateRows();
}

function updateClock() {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false });
}

onMounted(() => {
  refreshData();
  updateClock();

  // 每 5 秒刷新一次数据（模拟实时业务系统）
  refreshTimer = window.setInterval(refreshData, 5000);
  // 每秒更新一次时钟
  clockTimer = window.setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (refreshTimer !== null) clearInterval(refreshTimer);
  if (clockTimer !== null) clearInterval(clockTimer);
});

const emit = defineEmits<{
  /** 用户点击品牌区域，请求返回听书界面 */
  back: [];
}>();
</script>

<template>
  <div class="disguise">
    <!-- 顶部蓝色导航栏 -->
    <header class="top-bar">
      <button class="brand" type="button" @click="emit('back')">
        <span class="logo"></span>
        <span class="title">企业数据中台 · 销售分析</span>
      </button>
      <span class="spacer"></span>
      <span class="user">张伟 ｜ 退出</span>
    </header>

    <div class="main">
      <!-- 左侧导航 -->
      <nav class="sidebar">
        <a class="nav-item on">数据总览</a>
        <a class="nav-item">订单明细</a>
        <a class="nav-item">客户管理</a>
        <a class="nav-item">库存周转</a>
        <a class="nav-item">回款跟踪</a>
        <a class="nav-item">报表导出</a>
        <a class="nav-item">系统设置</a>
      </nav>

      <!-- 右侧内容区 -->
      <section class="content">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <select class="filter-select">
            <option>2026 Q3</option>
            <option>2026 Q2</option>
            <option>2026 Q1</option>
          </select>
          <select class="filter-select">
            <option>全部区域</option>
            <option>华东</option>
            <option>华南</option>
          </select>
          <select class="filter-select">
            <option>全部状态</option>
            <option>已回款</option>
            <option>待回款</option>
          </select>
          <button class="filter-btn primary">查询</button>
          <button class="filter-btn">导出 Excel</button>
          <span class="spacer"></span>
          <span class="clock">{{ currentTime }}</span>
        </div>

        <!-- 数据表格 -->
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>订单编号</th>
                <th>客户名称</th>
                <th>区域</th>
                <th>负责人</th>
                <th class="num">金额(元)</th>
                <th>回款状态</th>
                <th>更新日期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id">
                <td>{{ row.id }}</td>
                <td>{{ row.customer }}</td>
                <td>{{ row.region }}</td>
                <td>{{ row.owner }}</td>
                <td class="num">{{ formatAmount(row.amount) }}</td>
                <td>
                  <span class="tag" :class="row.status">
                    {{
                      row.status === 'ok' ? '已回款' : row.status === 'wait' ? '待回款' : '已逾期'
                    }}
                  </span>
                </td>
                <td>{{ row.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <span>共 128 条记录</span>
          <span class="spacer"></span>
          <button class="page-btn">上一页</button>
          <span class="page-num on">1</span>
          <span class="page-num">2</span>
          <span class="page-num">3</span>
          <span class="page-num">…</span>
          <span class="page-num">11</span>
          <button class="page-btn">下一页</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.disguise {
  position: fixed;
  inset: 0;
  z-index: 900;
  background: #f2f4f7;
  color: #1f2937;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  font-size: 13px;
  overflow: hidden;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  margin-left: -8px;
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s;
}

.brand:hover {
  background: rgba(255, 255, 255, 0.12);
}

.brand:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 1px;
}

.brand .logo {
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 4px;
  flex: none;
}

.brand .title {
  white-space: nowrap;
}
/* ========== 顶部栏 ========== */
.top-bar {
  height: 48px;
  background: #2f6fd6;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  flex: none;
}

.logo {
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 4px;
}

.title {
  font-size: 14px;
  font-weight: 500;
}

.spacer {
  flex: 1;
}

.user {
  font-size: 13px;
  opacity: 0.9;
}

/* ========== 主体 ========== */
.main {
  flex: 1;
  display: flex;
  min-height: 0;
}

/* ========== 左侧导航 ========== */
.sidebar {
  width: 168px;
  background: #fff;
  border-right: 1px solid #e3e7ee;
  padding: 12px 0;
  flex: none;
  overflow-y: auto;
}

.nav-item {
  display: block;
  padding: 9px 20px;
  font-size: 13px;
  color: #5b6472;
  cursor: default;
  user-select: none;
}

.nav-item.on {
  background: #eef4ff;
  color: #2f6fd6;
  border-right: 3px solid #2f6fd6;
  font-weight: 600;
}

/* ========== 右侧内容 ========== */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  min-width: 0;
  min-height: 0;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
  flex: none;
}

.filter-select {
  font-size: 12px;
  padding: 6px 10px;
  border: 1px solid #d5dae3;
  background: #fff;
  border-radius: 5px;
  color: #39414f;
  cursor: pointer;
  min-width: 100px;
}

.filter-btn {
  font-size: 12px;
  padding: 6px 14px;
  border: 1px solid #d5dae3;
  background: #fff;
  border-radius: 5px;
  color: #39414f;
  cursor: pointer;
}

.filter-btn.primary {
  background: #2f6fd6;
  color: #fff;
  border-color: #2f6fd6;
}

.clock {
  font-size: 12px;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}

/* 表格 */
.table-wrap {
  flex: 1;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 6px;
  overflow: auto;
  min-height: 0;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.table th {
  background: #f7f9fc;
  text-align: left;
  padding: 10px 12px;
  font-weight: 600;
  color: #4a5361;
  border-bottom: 1px solid #e3e7ee;
  white-space: nowrap;
  position: sticky;
  top: 0;
}

.table td {
  padding: 9px 12px;
  border-bottom: 1px solid #f0f2f6;
  color: #39414f;
  white-space: nowrap;
}

.table tr:last-child td {
  border-bottom: none;
}

.table .num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  line-height: 1.5;
}

.tag.ok {
  background: #e7f7ee;
  color: #1a8a4a;
}

.tag.wait {
  background: #fff4e0;
  color: #b5761a;
}

.tag.bad {
  background: #fdeaea;
  color: #c0392b;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
  flex: none;
}

.page-btn {
  font-size: 12px;
  padding: 4px 10px;
  border: 1px solid #d5dae3;
  background: #fff;
  border-radius: 4px;
  color: #39414f;
  cursor: pointer;
}

.page-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid #d5dae3;
  background: #fff;
  border-radius: 4px;
  cursor: default;
  font-size: 12px;
}

.page-num.on {
  background: #2f6fd6;
  color: #fff;
  border-color: #2f6fd6;
}
</style>

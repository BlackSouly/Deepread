function wait(ms = 500) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

const WEREAD_MODE = 'mock'

export const WEREAD_CONNECTION_STATUS = {
  connected: 'connected',
  notConfigured: 'not_configured',
  failed: 'failed',
}

function createConnectionStatus(status, detail) {
  const labels = {
    [WEREAD_CONNECTION_STATUS.connected]: '已连接',
    [WEREAD_CONNECTION_STATUS.notConfigured]: '未配置',
    [WEREAD_CONNECTION_STATUS.failed]: '连接失败',
  }
  return {
    status,
    label: labels[status],
    mode: WEREAD_MODE,
    detail,
  }
}

function createCover(title, color) {
  const initials = title.slice(0, 4)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="420" viewBox="0 0 320 420">
      <rect width="320" height="420" rx="18" fill="${color}" />
      <rect x="34" y="38" width="252" height="344" rx="14" fill="rgba(255,255,255,0.18)" />
      <text x="54" y="118" font-family="serif" font-size="34" font-weight="600" fill="#fff">${initials}</text>
      <rect x="54" y="142" width="64" height="6" rx="3" fill="rgba(255,255,255,0.8)" />
      <text x="54" y="344" font-family="sans-serif" font-size="18" fill="rgba(255,255,255,0.82)">微信读书</text>
    </svg>
  `
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const mockBookshelf = [
  {
    id: 'weread_deep_work',
    title: '深度工作',
    author: 'Cal Newport',
    cover: createCover('深度工作', '#1D9E75'),
    progress: 42,
    totalChapters: 7,
    category: '工具效率',
    status: 'reading',
  },
  {
    id: 'weread_poor_charlie',
    title: '穷查理宝典',
    author: 'Charlie T. Munger',
    cover: createCover('穷查理', '#7F77DD'),
    progress: 18,
    totalChapters: 12,
    category: '商业投资',
    status: 'reading',
  },
  {
    id: 'weread_sapiens',
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: createCover('人类简史', '#378ADD'),
    progress: 100,
    totalChapters: 20,
    category: '历史叙事',
    status: 'finished',
  },
  {
    id: 'weread_atomic_habits',
    title: '掌控习惯',
    author: 'James Clear',
    cover: createCover('掌控习惯', '#D85A30'),
    progress: 63,
    totalChapters: 8,
    category: '成长方法',
    status: 'reading',
  },
  {
    id: 'weread_thinking_fast_slow',
    title: '思考，快与慢',
    author: 'Daniel Kahneman',
    cover: createCover('快与慢', '#085041'),
    progress: 0,
    totalChapters: 9,
    category: '认知理论',
    status: 'wish',
  },
]

const mockDetails = {
  weread_deep_work: ['深度工作是一种稀缺能力', '拥抱无聊', '像经商一样执行', '减少肤浅工作'],
  weread_poor_charlie: ['查理的思维方式', '多元思维模型', '误判心理学', '投资原则'],
  weread_sapiens: ['认知革命', '农业革命', '人类的融合统一', '科学革命'],
  weread_atomic_habits: ['微习惯的复利', '身份认同', '提示与渴望', '让好习惯更容易'],
  weread_thinking_fast_slow: ['两个系统', '启发式与偏见', '过度自信', '选择与幸福'],
}

const mockHighlights = {
  weread_deep_work: ['高质量工作产出 = 时间 x 专注强度。', '深度工作不是怀旧，而是稀缺能力。'],
  weread_poor_charlie: ['反过来想，总是反过来想。', '跨学科模型能减少单一视角误判。'],
  weread_sapiens: ['虚构故事让大规模协作成为可能。'],
  weread_atomic_habits: ['你不会上升到目标水平，而会下降到系统水平。'],
  weread_thinking_fast_slow: ['系统一快速直觉，系统二缓慢分析。'],
}

export function mapWereadCategory(category) {
  if (/工具|方法|效率|成长/.test(category)) return '工具书'
  if (/历史|叙事|人物|文学/.test(category)) return '叙事'
  if (/理论|认知|心理|哲学/.test(category)) return '理论'
  return '其他'
}

export const wereadService = {
  async getConnectionStatus() {
    await wait(200)
    if (WEREAD_MODE === 'mock') {
      return createConnectionStatus(WEREAD_CONNECTION_STATUS.connected, '当前使用微信读书 mock 数据，后续可替换为 WeRead MCP Server。')
    }
    return createConnectionStatus(WEREAD_CONNECTION_STATUS.notConfigured, '尚未配置 WeRead MCP Server。')
  },

  async getBookshelf() {
    await wait()
    return mockBookshelf
  },

  async getBookDetail(bookId) {
    await wait()
    const book = mockBookshelf.find((item) => item.id === bookId)
    if (!book) return null
    return {
      ...book,
      chapters: mockDetails[bookId] ?? [],
      highlights: mockHighlights[bookId] ?? [],
    }
  },

  async getBookCover(bookId) {
    await wait(200)
    return mockBookshelf.find((item) => item.id === bookId)?.cover ?? ''
  },

  async getReadingProgress(bookId) {
    await wait(200)
    return mockBookshelf.find((item) => item.id === bookId)?.progress ?? 0
  },

  async getHighlights(bookId) {
    await wait()
    return mockHighlights[bookId] ?? []
  },
}

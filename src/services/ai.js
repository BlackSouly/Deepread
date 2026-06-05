const AI_CONFIG = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
}

const COMMON_TERMS = new Set([
  '我的费曼复述',
  '我的整章费曼复述',
  '本小节',
  '本章节',
  '本章',
  '章节',
  '小节',
  '核心',
  '概念',
  '标准概括',
])

function wait(ms = 500) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function splitText(value) {
  return normalizeText(value)
    .split(/[。！？!?；;，,\n\r、·:：|/]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function cleanTerm(value) {
  return normalizeText(value)
    .replace(/^第[一二三四五六七八九十\d]+[章节篇部课]?/, '')
    .replace(/^(我的|本章|本小节|章节|小节|关于|围绕|试着|不用看原文)/, '')
    .replace(/[「」《》“”"'（）()]/g, '')
    .trim()
}

function unique(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = item.toLowerCase()
    if (!item || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function extractConcepts(value, limit = 6) {
  const text = normalizeText(value)
  const quoted = [...text.matchAll(/[「《“"]([^」》”"]{2,24})[」》”"]/g)].map((match) => cleanTerm(match[1]))
  const clauses = splitText(text)
    .map(cleanTerm)
    .flatMap((clause) => {
      if (clause.length <= 14) return [clause]
      return clause
        .split(/和|与|及|以及|通过|因为|所以|然后|最后|需要|把|将/)
        .map(cleanTerm)
        .filter(Boolean)
    })

  return unique([...quoted, ...clauses])
    .filter((term) =>
      term.length >= 2 &&
      term.length <= 18 &&
      !COMMON_TERMS.has(term) &&
      !/^围绕/.test(term) &&
      !/重点不是|记住名称|而是说清|使用场景|成立原因|场景中被使用/.test(term)
    )
    .slice(0, limit)
}

function primaryTheme(value, fallback = '章节核心') {
  return extractConcepts(value, 1)[0] ?? fallback
}

function includesConcept(text, concept) {
  const source = normalizeText(text)
  const target = normalizeText(concept)
  return source.includes(target) || target.includes(source)
}

function hasExample(value) {
  return /例如|比如|举例|场景|案例|我会|可以用在|迁移到/.test(value)
}

function buildEvaluation(userRecall, standardAnswer) {
  const recall = normalizeText(userRecall)
  const standardConcepts = extractConcepts(standardAnswer, 5)
  const matched = standardConcepts.filter((concept) => includesConcept(recall, concept))
  const missingConcepts = standardConcepts.filter((concept) => !includesConcept(recall, concept))
  const coverage = standardConcepts.length === 0 ? 0 : matched.length / standardConcepts.length
  const missing = [
    ...missingConcepts.map((concept) => `补上「${concept}」`),
    ...(hasExample(recall) ? [] : ['加入一个自己的例子或使用场景']),
    ...(recall.length >= 80 ? [] : ['把一句结论扩展成“是什么、为什么、怎么用”']),
  ].slice(0, 3)

  if (!recall) {
    return {
      correct: '尚未提交有效复述。',
      missing: standardConcepts.length ? standardConcepts.map((concept) => `先解释「${concept}」`).slice(0, 3) : ['先写出你理解到的核心概念'],
      suggestion: '先用一句话说明本节在解决什么问题，再补充原因和应用场景。',
    }
  }

  return {
    correct: coverage >= 0.75
      ? `复述已经覆盖主要内容，尤其是「${matched.slice(0, 2).join('」「')}」。`
      : matched.length
        ? `已经抓到「${matched.join('」「')}」，但结构还可以更完整。`
        : '已经开始用自己的话表达，但与标准概括的关键点重合较少。',
    missing: missing.length ? missing : ['下一轮可以压缩成更清楚的一句话结论'],
    suggestion: '下一轮按“定义 -> 因果机制 -> 例子 -> 行动启示”的顺序复述，会更容易暴露理解缺口。',
  }
}

export const aiService = {
  config: AI_CONFIG,

  async generateSectionSummary(sectionContent) {
    await wait()
    const theme = primaryTheme(sectionContent, '本小节')
    const concepts = extractConcepts(sectionContent, 3).filter((concept) => concept !== theme)
    return `本小节围绕「${theme}」展开。重点不是记住名称，而是说清它的定义、成立原因${concepts.length ? `，以及它和「${concepts.join('」「')}」的关系` : '，以及它能在哪个场景中被使用'}。`
  },

  async evaluateFeynmanRecall(userRecall, standardAnswer) {
    await wait()
    return buildEvaluation(userRecall, standardAnswer)
  },

  async generateChapterSummary(chapterContent) {
    await wait()
    const theme = primaryTheme(chapterContent, '章节主题')
    const concepts = extractConcepts(chapterContent, 4).filter((concept) => concept !== theme)
    return `本章围绕「${theme}」建立理解框架。建议把它拆成三个层次：先定义问题，再解释${concepts[0] ? `「${concepts[0]}」背后的机制` : '背后的机制'}，最后形成一个可执行的阅读或复习动作。`
  },

  async generateMindmap(chapterContent) {
    await wait()
    const theme = primaryTheme(chapterContent, '章节核心')
    const concepts = extractConcepts(chapterContent, 6)
    const [first = '关键定义', second = '成立原因', third = '使用条件', fourth = '实践动作', fifth = '常见误区', sixth = '复习问题'] = concepts.filter((concept) => concept !== theme)

    return {
      id: 'root',
      text: theme,
      children: [
        { id: 'branch-1', text: '概念层', children: [{ id: 'leaf-1', text: first }, { id: 'leaf-2', text: second }] },
        { id: 'branch-2', text: '机制层', children: [{ id: 'leaf-3', text: third }, { id: 'leaf-4', text: fifth }] },
        { id: 'branch-3', text: '行动层', children: [{ id: 'leaf-5', text: fourth }, { id: 'leaf-6', text: sixth }] },
      ],
    }
  },

  async generateToyotaBackground(chapterContent) {
    await wait()
    const theme = primaryTheme(chapterContent, '本章主题')
    const concepts = extractConcepts(chapterContent, 3).filter((concept) => concept !== theme)
    return `背景：本章讨论「${theme}」。当前需要把它从阅读材料转化为判断框架，尤其要说明${concepts.length ? `「${concepts.join('」「')}」之间的关系` : '核心问题、原因和可执行动作'}。`
  },

  async suggestKeyChapter(chapterTitle, bookPurpose) {
    await wait()
    const titleConcepts = extractConcepts(chapterTitle, 4)
    const purposeConcepts = extractConcepts(bookPurpose, 8)
    const matched = titleConcepts.filter((concept) => purposeConcepts.some((purpose) => includesConcept(purpose, concept)))
    const suggest = matched.length > 0 || titleConcepts.some((concept) => /方法|原则|能力|系统|实践|执行|工作|复习|理解/.test(concept))
    const theme = primaryTheme(chapterTitle, '这一章')

    return {
      suggest,
      reason: suggest
        ? `建议重点阅读「${theme}」：它${matched.length ? `直接命中阅读目的中的「${matched.join('」「')}」` : '包含可迁移的方法或能力结构'}，适合进入费曼复述和后续复习。`
        : `暂不建议设为重点：当前标题与阅读目的的直接交集较弱，可以先按普通章节阅读，读后再根据收获调整。`,
    }
  },

  async generateReviewQuestion(title, context) {
    await wait()
    const theme = primaryTheme(title, '这个知识点')
    const contextConcepts = extractConcepts(context, 2)
    return `不用看原文，请复述「${theme}」：它解决什么问题，为什么成立？${contextConcepts.length ? `再说明它和「${contextConcepts.join('」「')}」有什么关系。` : '最后补一个你自己的应用场景。'}`
  },
}

import { useMemo, useState } from 'react'
import ReactFlow, { Background, Controls, applyNodeChanges } from 'reactflow'
import 'reactflow/dist/style.css'
import { IconWand } from '@tabler/icons-react'
import { aiService } from '../../services/ai.js'
import { Button } from '../common/Button.jsx'
import { useToast } from '../common/ToastProvider.jsx'

const stableNodeTypes = {}
const stableEdgeTypes = {}

function updateTreeText(node, id, text) {
  if (node.id === id) return { ...node, text }
  return { ...node, children: node.children?.map((child) => updateTreeText(child, id, text)) ?? [] }
}

function updateTreePosition(node, id, position) {
  if (node.id === id) return { ...node, position }
  return { ...node, children: node.children?.map((child) => updateTreePosition(child, id, position)) ?? [] }
}

function treeToFlow(node, depth = 0, index = 0, parentId = null, acc = { nodes: [], edges: [] }) {
  const x = node.position?.x ?? depth * 240
  const y = node.position?.y ?? index * 96
  acc.nodes.push({
    id: node.id,
    position: { x, y },
    data: { text: node.text },
  })
  if (parentId) {
    acc.edges.push({ id: `${parentId}-${node.id}`, source: parentId, target: node.id, type: 'smoothstep' })
  }
  node.children?.forEach((child, childIndex) => treeToFlow(child, depth + 1, index * 2 + childIndex, node.id, acc))
  return acc
}

export function MindmapPanel({ value, onChange, chapterTitle }) {
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const flow = useMemo(() => (value ? treeToFlow(value) : { nodes: [], edges: [] }), [value])
  const nodes = flow.nodes.map((node) => ({
    ...node,
    data: {
      label: (
        <input
          className="nodrag min-w-32 rounded-full border border-brand-200 bg-white px-3 py-2 text-center text-[12px] shadow-sm outline-none focus:ring-2 focus:ring-brand-50"
          value={node.data.text}
          onChange={(event) => onChange(updateTreeText(value, node.id, event.target.value))}
        />
      ),
    },
  }))

  async function generate() {
    try {
      setLoading(true)
      onChange(await aiService.generateMindmap(chapterTitle))
      showToast('思维导图已生成。', 'success')
    } catch {
      showToast('思维导图生成失败，请稍后重试。', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleNodesChange(changes) {
    applyNodeChanges(changes, nodes)
    const positionChanges = changes.filter((change) => change.type === 'position' && change.position)
    if (positionChanges.length === 0) return
    let nextTree = value
    positionChanges.forEach((change) => {
      nextTree = updateTreePosition(nextTree, change.id, change.position)
    })
    onChange(nextTree)
  }

  return (
    <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[13px] font-medium">章节思维导图</h2>
        <Button size="sm" onClick={generate} disabled={loading}><IconWand size={15} />{loading ? '生成中' : '生成思维导图'}</Button>
      </div>
      {value ? (
        <div className="h-[420px] overflow-hidden rounded-xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
          <ReactFlow nodes={nodes} edges={flow.edges} nodeTypes={stableNodeTypes} edgeTypes={stableEdgeTypes} onNodesChange={handleNodesChange} fitView>
            <Background gap={18} size={1} color="#dfe5e1" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] p-8 text-center text-[12px] text-[var(--color-text-tertiary)]">
          根节点 → 三个分支 → 各两个叶子节点。点击生成后替换为 React Flow 可拖拽版本。
        </div>
      )}
    </section>
  )
}

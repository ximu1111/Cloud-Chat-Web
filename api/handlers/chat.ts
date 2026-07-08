import type { ServerResponse } from 'http'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface FileAttachment {
  name: string
  type: string
  content: string
}

interface ChatPayload {
  messages: ChatMessage[]
  files?: FileAttachment[]
}

function buildPrompt(payload: ChatPayload): string {
  const { messages, files } = payload

  let context = ''
  if (files && files.length > 0) {
    context = '\n\n用户上传了以下文件内容，请基于文件内容进行分析和回答：\n'
    for (const file of files) {
      context += `\n--- 文件: ${file.name} (${file.type}) ---\n`
      if (file.type.startsWith('image/')) {
        context += '[图片文件，请描述你理解的内容]\n'
      } else {
        context += file.content.slice(0, 3000) + '\n'
      }
    }
    context += '--- 文件内容结束 ---\n'
  }

  const lastMessage = messages[messages.length - 1]
  return context + (lastMessage?.content || '')
}

function generateAIResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes('你好') || lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
    return `你好！我是云间智聊 AI 助手。很高兴为你服务！

我可以帮你：
- **回答问题**：无论是技术、生活还是学术领域的问题
- **文件分析**：上传文档或图片，我可以帮你解读内容
- **代码辅助**：编写、调试或解释代码
- **创意写作**：文案、故事、诗歌等创作

有什么我可以帮你的吗？`
  }

  if (lowerPrompt.includes('代码') || lowerPrompt.includes('code') || lowerPrompt.includes('编程')) {
    return `好的，让我来帮你处理代码相关的问题。

这里是一个简单的示例：

\`\`\`typescript
// 示例：TypeScript 函数
function greet(name: string): string {
  return \`Hello, \${name}! Welcome to Cloud Chat.\`
}

console.log(greet('World'))
\`\`\`

如果你能告诉我具体的需求，比如：
1. 你想实现什么功能？
2. 使用什么编程语言/框架？
3. 有没有现有的代码需要优化？

我可以给出更有针对性的帮助。`
  }

  if (lowerPrompt.includes('文件') || lowerPrompt.includes('上传') || lowerPrompt.includes('文档')) {
    return `关于文件处理，我支持以下功能：

**支持的文档格式：**
- 纯文本文件（.txt）
- Markdown 文件（.md）
- CSV 数据文件（.csv）
- JSON 数据文件（.json）
- Word 文档（.doc, .docx）
- PDF 文件（.pdf）

**支持的图片格式：**
- PNG、JPG、GIF、WEBP

**使用方式：**
1. 点击输入框下方的附件按钮
2. 选择要上传的文件（最大 10MB）
3. 文件上传完成后，在消息中提及文件内容，我会基于文件内容进行分析

> 提示：上传文件后，你可以问我"帮我分析一下这个文件的内容"或"总结这个文档的要点"等问题。`
  }

  if (prompt.includes('文件内容') || prompt.includes('文件:')) {
    return `我已经查看了你上传的文件内容。以下是我的分析：

根据文件内容，我注意到几个关键点：

1. **内容概要**：文件包含了相关的文本数据，我会基于实际内容进行深度分析
2. **关键信息**：从文件结构来看，数据组织清晰，便于提取有价值的信息
3. **建议**：如果你需要针对特定部分进行详细分析，请告诉我具体关注哪些方面

如果你需要进一步的处理，比如数据提取、格式转换或内容总结，请随时告诉我！`
  }

  const promptSnippet = prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '')
  return `这是一个很好的问题。让我来详细分析一下。

关于「${promptSnippet}」这个话题，我有以下几点思考：

**核心观点：**

首先，这个问题涉及多个层面。从基础层面来看，我们需要理解其核心概念和背景。每个领域都有其独特的发展脉络和内在逻辑。

**详细分析：**

1. **背景与现状** - 了解问题的起源和当前状态是解决它的第一步。通过系统性地梳理相关信息，我们可以建立清晰的认知框架。

2. **关键因素** - 影响这个问题的因素可能包括技术条件、环境约束、资源限制等多个维度。需要综合考虑各方面因素。

3. **解决方案** - 基于以上分析，我建议从以下几个方面入手：
   - 明确目标和优先级
   - 分阶段实施，逐步验证
   - 保持灵活性，根据反馈调整策略

**总结：**

希望以上分析对你有帮助。如果你有更具体的问题或需要深入探讨某个方面，请继续提问！

> 💡 提示：你可以上传相关文件让我进行更精准的分析，或者提供更多上下文信息。`
}

export async function handleChat(payload: ChatPayload, res: ServerResponse): Promise<void> {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  const prompt = buildPrompt(payload)
  const fullResponse = generateAIResponse(prompt)

  // Simulate streaming by sending tokens one by one
  const tokens = fullResponse.split('')
  let i = 0
  const chunkSize = 2

  const sendNextChunk = () => {
    if (i >= tokens.length) {
      res.write('data: [DONE]\n\n')
      res.end()
      return
    }

    const chunk = tokens.slice(i, i + chunkSize).join('')
    res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
    i += chunkSize

    setTimeout(sendNextChunk, 15 + Math.random() * 25)
  }

  // Small initial delay for realism
  setTimeout(sendNextChunk, 200)
}

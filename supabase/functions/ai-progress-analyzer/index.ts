// Supabase Edge Function: AI 進度分析
// 部署後可透過 supabaseClient.functions.invoke('ai-progress-analyzer', { body: {...} }) 呼叫

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const KIMI_API_KEY = Deno.env.get('KIMI_API_KEY')
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions'

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { description, projectContext } = await req.json()
    
    if (!description) {
      return new Response(
        JSON.stringify({ error: '缺少進度描述' }),
        { status: 400, headers: corsHeaders }
      )
    }

    if (!KIMI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'KIMI_API_KEY 未設定' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // 呼叫 Kimi API
    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: `你是一個專案進度分析助手。請分析使用者的進度描述，並回傳以下 JSON 格式：
{
  "progress": 0-100 的整數,
  "phase": "proposing" | "quoting" | "sampling" | "production" | "completed",
  "deadline": "YYYY-MM-DD 格式的日期或空字串",
  "notes": "分析摘要"
}

階段對照：
- proposing: 提案/概念階段
- quoting: 報價/詢價階段
- sampling: 打樣/樣品階段
- production: 生產/大貨階段
- completed: 已完成/結案

進度判斷：
- 剛開始/規劃: 10-20%
- 進行中/處理: 30-50%
- 接近完成: 60-80%
- 完成: 100%`
          },
          {
            role: 'user',
            content: `專案進度描述：${description}

${projectContext ? `專案上下文：${JSON.stringify(projectContext)}` : ''}

請分析並回傳 JSON 格式的結果。`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Kimi API 錯誤:', errorText)
      throw new Error(`Kimi API 錯誤: ${response.status}`)
    }

    const aiResult = await response.json()
    const aiContent = aiResult.choices?.[0]?.message?.content

    if (!aiContent) {
      throw new Error('AI 回應格式錯誤')
    }

    // 解析 AI 回應（可能是 JSON 或需要提取）
    let parsedResult
    try {
      // 嘗試直接解析 JSON
      parsedResult = JSON.parse(aiContent)
    } catch {
      // 如果不是純 JSON，嘗試提取 JSON 部分
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('無法解析 AI 回應')
      }
    }

    // 驗證並設定預設值
    const result = {
      progress: Math.min(100, Math.max(0, parseInt(parsedResult.progress) || 0)),
      phase: ['proposing', 'quoting', 'sampling', 'production', 'completed'].includes(parsedResult.phase) 
        ? parsedResult.phase 
        : 'proposing',
      deadline: parsedResult.deadline || '',
      notes: parsedResult.notes || description
    }

    return new Response(
      JSON.stringify(result),
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Edge Function 錯誤:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        progress: 0,
        phase: 'proposing',
        deadline: '',
        notes: 'AI 分析失敗，請稍後再試'
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})

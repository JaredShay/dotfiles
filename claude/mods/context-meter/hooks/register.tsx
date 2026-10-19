import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

// Bumped whenever the context window may have moved; the band reads it so each bump redraws it.
const tick = atom({ plugin: 'context-meter', key: 'tick' } as const, 0)

// The main loop's effort, last seen on a turn step; the API has no getter for it.
const effort = atom({ plugin: 'context-meter', key: 'effort' } as const, null)

const LIVE = ['pending', 'running', 'waiting']

const LABELS: Record<string, string> = { five_hour: '5h', seven_day: '7d', spend_limit: 'spend' }

export const levelOf = (p: number) => (p >= 85 ? 'error' : p >= 60 ? 'warning' : 'success')

// Compact time left, two units at most: 3d4h, 2h14m, 45m.
export const untilReset = (resetsAt: string | undefined, now: number) => {
  if (resetsAt === undefined) return undefined
  const mins = Math.max(0, Math.ceil((Date.parse(resetsAt) - now) / 60_000))
  if (Number.isNaN(mins)) return undefined
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = mins % 60
  return d > 0 ? `${d}d${h}h` : h > 0 ? `${h}h${m}m` : `${m}m`
}

const bump = ($: EngineInterface) => update($, tick, n => n + 1)

export const register: Register = on => {
  let lastCount = 0
  let lastMinute = 0

  on('session.start', async ($, e, next) => {
    // Redraw when the number of live subagents changes.
    $.clock.every(1000, async () => {
      const count = (await $.agent.list()).filter(a => LIVE.includes(a.status)).length
      const minute = Math.floor((await $.clock.now()) / 60_000)
      // Redraw each minute so the reset countdowns stay current.
      if (count !== lastCount || minute !== lastMinute) await bump($)
      lastCount = count
      lastMinute = minute
    })
    const result = await next(e)
    await bump($)

    return result
  })

  on('turn.step', async function* ($, e, next) {
    if (e.agentId === undefined) await update($, effort, () => (e.effort === undefined ? null : String(e.effort)))
    const result = yield* next(e)
    if (e.agentId === undefined) await bump($)

    return result
  })

  on('session.compact', async ($, e, next) => {
    const result = await next(e)
    await bump($)

    return result
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    await read($, tick)
    const level = await read($, effort)
    const model = await $.session.model()
    const { context, rateLimits } = await $.session.usage()
    const now = await $.clock.now()
    const agents = (await $.agent.list()).filter(a => LIVE.includes(a.status)).length
    const p = context.percent

    if (e.props.hasSurvey) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    // Rate limits only arrive with the first API response, so keep the main windows as placeholders until then.
    const limits = new Map<string, { percent?: number; reset?: string }>(['five_hour', 'seven_day'].map(k => [k, {}]))
    for (const r of rateLimits) limits.set(r.kind, { percent: r.percentUsed, reset: r.kind === 'five_hour' ? untilReset(r.resetsAt, now) : undefined })
    const meters = [
      { key: 'agents', label: 'sub-agt', count: agents },
      { key: 'cxt', label: 'cxt', percent: p },
      ...[...limits].map(([kind, { percent, reset }]) => ({ key: kind, label: LABELS[kind] ?? kind, percent, reset })),
    ]

    return (
      <Box flexDirection="column" alignItems="flex-end">
        <Box>
          {meters.map((m, i) => (
            <Text key={m.key}>
              {i > 0 ? <Text dimColor> · </Text> : null}
              <Text dimColor>{m.label} </Text>
              {m.count !== undefined ? (
                <Text color={m.count > 0 ? 'cyan' : undefined} dimColor={m.count === 0} bold={m.count > 0}>{m.count}</Text>
              ) : m.percent === undefined ? (
                <Text dimColor>–</Text>
              ) : (
                <Text color={levelOf(m.percent)} bold={m.percent >= 85}>{Math.round(m.percent)}%</Text>
              )}
              {m.reset === undefined ? null : <Text dimColor> {m.reset}</Text>}
            </Text>
          ))}
        </Box>
        <Text dimColor>
          {model}{level === null ? '' : ` · ${level}`}
        </Text>
      </Box>
    )
  })
}

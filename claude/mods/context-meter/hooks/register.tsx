import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

// Bumped whenever the context window may have moved; the band reads it so each bump redraws it.
const tick = atom({ plugin: 'context-meter', key: 'tick' } as const, 0)

// The main loop's effort, last seen on a turn step; the API has no getter for it.
const effort = atom({ plugin: 'context-meter', key: 'effort' } as const, null)

const LIVE = ['pending', 'running', 'waiting']

const LABELS: Record<string, string> = { five_hour: '5h', seven_day: '7d', spend_limit: 'spend' }

export const levelOf = (p: number) => (p >= 85 ? 'error' : p >= 60 ? 'warning' : 'success')

const bump = ($: EngineInterface) => update($, tick, n => n + 1)

export const register: Register = on => {
  let lastCount = 0

  on('session.start', async ($, e, next) => {
    // Redraw when the number of live subagents changes.
    $.clock.every(1000, async () => {
      const count = (await $.agent.list()).filter(a => LIVE.includes(a.status)).length
      if (count !== lastCount) await bump($)
      lastCount = count
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
    const agents = (await $.agent.list()).filter(a => LIVE.includes(a.status)).length
    const p = context.percent

    if (e.props.hasSurvey) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    // Rate limits only arrive with the first API response, so keep the main windows as placeholders until then.
    const limits = new Map<string, number | undefined>(['five_hour', 'seven_day'].map(k => [k, undefined]))
    for (const r of rateLimits) limits.set(r.kind, r.percentUsed)
    const meters = [
      { key: 'agents', label: 'sub-agt', count: agents },
      { key: 'cxt', label: 'cxt', percent: p },
      ...[...limits].map(([kind, percent]) => ({ key: kind, label: LABELS[kind] ?? kind, percent })),
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

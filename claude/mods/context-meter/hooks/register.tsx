import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

// Bumped whenever the context window may have moved; the band reads it so each bump redraws it.
const tick = atom({ plugin: 'context-meter', key: 'tick' } as const, 0)

const CELLS = 24

// Green → yellow → orange → red, by how far along the bar a cell sits.
const STOPS: Array<[number, [number, number, number]]> = [
  [0, [80, 200, 120]],
  [0.6, [235, 200, 60]],
  [0.85, [240, 120, 50]],
  [1, [230, 60, 70]],
]

export const colorAt = (t: number): string => {
  const i = Math.max(1, STOPS.findIndex(([at]) => at >= t))
  const [a, from] = STOPS[i - 1]
  const [b, to] = STOPS[i]
  const k = b === a ? 0 : (t - a) / (b - a)
  const hex = from.map((c, j) => Math.round(c + (to[j] - c) * k).toString(16).padStart(2, '0'))

  return `#${hex.join('')}`
}

export const levelOf = (p: number) => (p >= 85 ? 'error' : p >= 60 ? 'warning' : 'success')

const bump = ($: EngineInterface) => update($, tick, n => n + 1)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await bump($)

    return result
  })

  on('turn.step', async function* ($, e, next) {
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
    const { context } = await $.session.usage()
    const p = context.percent

    if (e.props.hasSurvey || p === undefined) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const filled = Math.round((Math.min(p, 100) / 100) * CELLS)
    const cells = Array.from({ length: CELLS }, (_, i) =>
      i < filled ? (
        <Text color={colorAt(i / (CELLS - 1))}>█</Text>
      ) : (
        <Text dimColor>░</Text>
      ),
    )

    return (
      <Box>
        <Text dimColor>context </Text>
        <Text>{cells}</Text>
        <Text color={levelOf(p)} bold={p >= 85}>
          {' '}{p}%{p >= 85 ? ' · consider /compact' : ''}
        </Text>
      </Box>
    )
  })
}

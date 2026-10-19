import { describe, expect, test } from 'claude-code/testing'
import type { SessionUsage } from 'claude-code'

import { levelOf, untilReset } from './register'

const usageAt = (percent: number | undefined) =>
  ({
    startedAt: 0,
    context: { window: 200_000, tokens: percent === undefined ? undefined : percent * 2_000, percent },
    rateLimits: [
      { kind: 'five_hour', percentUsed: 42, resetsAt: new Date(134 * 60_000).toISOString() },
      { kind: 'seven_day', percentUsed: 7, resetsAt: new Date(3 * 86_400_000 + 4 * 3_600_000).toISOString() },
    ],
    cost: {},
  }) as unknown as SessionUsage

describe('context-meter', () => {
  test('level thresholds', async () => {
    expect(levelOf(10)).toBe('success')
    expect(levelOf(60)).toBe('warning')
    expect(levelOf(92)).toBe('error')
  })

  test('reset countdown format', async () => {
    expect(untilReset(undefined, 0)).toBeUndefined()
    expect(untilReset(new Date(45 * 60_000).toISOString(), 0)).toBe('45m')
    expect(untilReset(new Date(134 * 60_000).toISOString(), 0)).toBe('2h14m')
    expect(untilReset(new Date(3 * 86_400_000 + 4 * 3_600_000).toISOString(), 0)).toBe('3d4h')
    expect(untilReset(new Date(0).toISOString(), 1000)).toBe('0m')
  })

  test('band shows context, limits and model', async ($, on) => {
    on('session.usage', () => ({ value: usageAt(90) }))
    on('session.model', () => ({ value: 'claude-sonnet-5-5' }))
    on('agent.list', () => ({ value: [] }))
    on('clock.now', () => ({ value: 0 }))

    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({
        plugin: 'context-meter',
        surface,
        component: 'AbovePrompt',
        props: { hasSurvey: false, isWorking: false },
      })
      expect(await ui.find({ type: 'Text', text: /90%/ })).toBeDefined()
      expect(await ui.find({ type: 'Text', text: /claude-sonnet-5-5/ })).toBeDefined()
      expect(await ui.find({ type: 'Text', text: /42%/ })).toBeDefined()
      expect(await ui.find({ type: 'Text', text: /2h14m/ })).toBeDefined()
      expect(await ui.find({ type: 'Text', text: /3d4h/ })).toBeUndefined()
      await ui.unmount()
    }
  })

  test('band shows a placeholder before the first reading', async ($, on) => {
    on('session.usage', () => ({ value: usageAt(undefined) }))
    on('session.model', () => ({ value: 'claude-sonnet-5-5' }))
    on('agent.list', () => ({ value: [] }))
    on('clock.now', () => ({ value: 0 }))
    const ui = await $.ui.mount({
      plugin: 'context-meter',
      surface: 'terminal',
      component: 'AbovePrompt',
      props: { hasSurvey: false, isWorking: false },
    })
    expect(await ui.find({ type: 'Text', text: /cxt/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /5h/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /7d/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /claude-sonnet-5-5/ })).toBeDefined()
    await ui.unmount()
  })
})

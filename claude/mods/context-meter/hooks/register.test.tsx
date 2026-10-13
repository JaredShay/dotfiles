import { describe, expect, test } from 'claude-code/testing'
import type { SessionUsage } from 'claude-code'

import { colorAt, levelOf } from './register'

const usageAt = (percent: number | undefined) =>
  ({
    startedAt: 0,
    context: { window: 200_000, tokens: percent === undefined ? undefined : percent * 2_000, percent },
    rateLimits: {},
    cost: {},
  }) as unknown as SessionUsage

describe('context-meter', () => {
  test('gradient runs green to red', async () => {
    expect(colorAt(0)).toBe('#50c878')
    expect(colorAt(1)).toBe('#e63c46')
  })

  test('level thresholds', async () => {
    expect(levelOf(10)).toBe('success')
    expect(levelOf(60)).toBe('warning')
    expect(levelOf(92)).toBe('error')
  })

  test('band shows the percentage and a nudge near full', async ($, on) => {
    on('session.usage', () => ({ value: usageAt(90) }))

    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({
        plugin: 'context-meter',
        surface,
        component: 'AbovePrompt',
        props: { hasSurvey: false, isWorking: false },
      })
      expect(await ui.find({ type: 'Text', text: /90%.*compact/ })).toBeDefined()
      await ui.unmount()
    }
  })

  test('band stays out of the way before the first reading', async ($, on) => {
    on('session.usage', () => ({ value: usageAt(undefined) }))
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
      const { Box } = $.ui.resolve(e)
      return <Box key="engine" />
    })

    const ui = await $.ui.mount({
      plugin: 'context-meter',
      surface: 'terminal',
      component: 'AbovePrompt',
      props: { hasSurvey: false, isWorking: false },
    })
    expect(await ui.find({ type: 'Text', text: /%/ })).toBeUndefined()
    await ui.unmount()
  })
})

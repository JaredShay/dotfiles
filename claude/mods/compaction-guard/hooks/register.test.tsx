import { describe, expect, mock, test } from 'claude-code/testing'

import { isForceAdd, isImplementationSkill, shouldCompact, THRESHOLD } from './register'

describe('compaction-guard', () => {
  test('compacts at the threshold or when asked', async () => {
    expect(shouldCompact(THRESHOLD - 1, false)).toBe(false)
    expect(shouldCompact(THRESHOLD, false)).toBe(true)
    expect(shouldCompact(undefined, false)).toBe(false)
    expect(shouldCompact(10, true)).toBe(true)
  })

  test('recognises the implementation skills', async () => {
    expect(isImplementationSkill('superpowers:subagent-driven-development')).toBe(true)
    expect(isImplementationSkill('executing-plans')).toBe(true)
    expect(isImplementationSkill('superpowers:writing-plans')).toBe(false)
    expect(isImplementationSkill(undefined)).toBe(false)
  })

  test('recognises forced adds only', async () => {
    expect(isForceAdd('git add -f docs/superpowers/plans/x.md')).toBe(true)
    expect(isForceAdd('git add --force docs/x.md')).toBe(true)
    expect(isForceAdd('git add docs/x.md')).toBe(false)
    expect(isForceAdd('git commit -m "fix -f"')).toBe(false)
  })

  test('first implementation skill call is denied and queues a compaction', async ($, on) => {
    const result = await $.tool.call({ tool: 'Skill', skill: 'superpowers:subagent-driven-development' })
    expect(result.deny).toMatch(/Compacting first/)
  })

  test('force-adding is denied', async ($) => {
    const result = await $.tool.call({ tool: 'Bash', command: 'git add -f docs/superpowers/specs/a.md' })
    expect(result.deny).toMatch(/ignored files stay out/)
  })

  test('after the compaction the skill is let through once, then gated again', async ($, on) => {
    const clock = mock.clock(on)
    const submitted: string[] = []
    on('session.compact', () => ({ messages: [{ role: 'user', text: 'summary', toolUses: [] }] }) as never)
    on('tool.call', () => ({ result: 'ok' }))
    on('turn.complete', () => ({ text: '' }))
    on('session.usage', () => ({ value: { context: { percent: 10 }, rateLimits: [] } }) as never)
    on('ui.toast', () => ({ value: undefined }) as never)
    on('prompt.submit', (_$, e) => {
      submitted.push(e.text)

      return { text: e.text }
    })
    const skill = 'superpowers:executing-plans'

    expect((await $.tool.call({ tool: 'Skill', skill })).deny).toMatch(/Compacting first/)
    await $.turn.complete({ answer: '', durationMs: 0, isAborted: false, turnId: 't1', reason: 'answer' })
    await clock.advance(1_000)
    expect(submitted).toHaveLength(1)
    expect(submitted[0]).toMatch(/executing-plans/)

    expect((await $.tool.call({ tool: 'Skill', skill })).deny).toBeUndefined()
    expect((await $.tool.call({ tool: 'Skill', skill })).deny).toMatch(/Compacting first/)
  })

  test('subagents are not gated', async ($, on) => {
    on('tool.call', () => ({ result: 'ok' }))
    const result = await $.tool.call({ tool: 'Skill', skill: 'executing-plans', agentId: 'sub-1' })
    expect(result.deny).toBeUndefined()
  })
})

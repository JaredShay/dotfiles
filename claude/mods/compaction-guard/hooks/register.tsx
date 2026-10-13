import type { EngineInterface, Register } from 'claude-code'

export const THRESHOLD = 65

const TOOL = 'handoff'

export const INSTRUCTIONS = [
  'This compaction is a handoff: the work continues immediately afterwards, so the summary must let it resume without asking the user anything.',
  'Keep, in this order: (1) the overall goal and the user\'s constraints and preferences; (2) the active plan or spec and exactly which step is done, in progress and left; (3) decisions made and why; (4) files touched and their state, failing tests or errors still open; (5) a final section headed "Next action" with the single concrete thing to do first, specific enough to act on without re-reading anything.',
].join('\n')

// Implementation starts from a clean context: the spec and plan on disk carry everything it needs.
export const IMPLEMENTATION_SKILLS = ['subagent-driven-development', 'executing-plans']

export const isImplementationSkill = (skill: unknown) =>
  typeof skill === 'string' && IMPLEMENTATION_SKILLS.includes(skill.replace(/^superpowers:/, ''))

export const isForceAdd = (command: unknown) =>
  typeof command === 'string' && /\bgit\s+(?:-\S+\s+)*add\b[^;&|\n]*\s(?:-f|--force)\b/.test(command)

const forceAddDenial =
  'Refused: ignored files stay out of source control. Superpowers specs and plans in ignored paths are intentionally left uncommitted, so skip the commit step for them and keep working.'

const gateInstructions = (skill: string) =>
  `The next step is to invoke the ${skill} skill. The summary must name the absolute path of the spec and the implementation plan on disk, and say that they, not this conversation, are the source of truth. Make the "Next action" exactly: invoke ${skill} on that plan.`

const gateResume = (skill: string) =>
  `The conversation was just compacted so implementation starts with a clean context. Read the spec and plan files named in the summary, then invoke the ${skill} skill on the plan now. Do not ask what to do or recap the summary.`

export const RESUME = 'The conversation was just compacted. Continue exactly where you left off: do the "Next action" from the summary, then carry on with the plan. Do not ask what to do or recap the summary.'

// A turn is still "running" for a moment after turn.complete, and compaction rejects until it is idle.
const RETRY_MS = 400
const RETRIES = 20

export const shouldCompact = (percent: number | undefined, isPending: boolean) =>
  isPending || (percent !== undefined && percent >= THRESHOLD)

let isPending = false
let isBusy = false
// The implementation skill that triggered the compaction in flight, and then the one let through once.
let gatedSkill: string | undefined
let passedSkill: string | undefined

async function run($: EngineInterface, tries = 0): Promise<void> {
  if (tries === 0) {
    if (isBusy) return
    isBusy = true
  }

  try {
    const skill = gatedSkill
    const instructions = skill === undefined ? INSTRUCTIONS : `${INSTRUCTIONS}\n${gateInstructions(skill)}`
    const result = await $.session.compact({ instructions })
    if ('skip' in result && result.skip) {
      await $.ui.toast(`Compaction skipped: ${result.skip}`)
    } else {
      await $.ui.toast('Compacted; resuming')
      passedSkill = skill
      gatedSkill = undefined
      await $.prompt.submit({ text: skill === undefined ? RESUME : gateResume(skill), asUser: true })
    }
  } catch (error) {
    if (tries < RETRIES) {
      $.clock.after(RETRY_MS, () => void run($, tries + 1))

      return
    }
    await $.ui.toast(`Compaction failed: ${error instanceof Error ? error.message : String(error)}`)
  }
  isBusy = false
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'handoff',
      description: 'Compact now with a handoff summary, then resume the work automatically',
    })
    await $.tool.register({
      name: TOOL,
      description:
        'Compact the conversation and automatically resume the work afterwards. Call this when the user asks to compact, hand off, or "do the auto compact thing". It runs once this turn ends; finish the turn with one short line and do not continue working.',
      isDeferred: false,
    })

    return next(e)
  })

  on('command.run', { command: 'handoff' }, async $ => {
    void run($)

    return { text: 'Compacting with a handoff summary; work resumes automatically.' }
  })

  on('tool.call', { tool: 'mcp__compaction-guard__handoff' }, async () => {
    isPending = true

    return { result: 'Compaction is scheduled for when this turn ends and the work resumes on its own. End your turn now with one short line.' }
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'Skill' }, async ($, e, next) => {
    if (e.agentId !== undefined || !isImplementationSkill(e.skill)) return next(e)

    if (passedSkill !== undefined) {
      passedSkill = undefined

      return next(e)
    }
    gatedSkill = String(e.skill)
    isPending = true

    return {
      deny: `Compacting first so implementation starts with a clean context. End your turn now with one short line; after the compaction you will be asked to invoke ${gatedSkill} again.`,
    }
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (isForceAdd(e.command)) return { deny: forceAddDenial }

    return next(e)
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)

    if (e.agentId === undefined && !e.isAborted) {
      const { context } = await $.session.usage()
      if (shouldCompact(context.percent, isPending)) {
        isPending = false
        $.clock.after(RETRY_MS, () => void run($))
      }
    }

    return result
  })
}

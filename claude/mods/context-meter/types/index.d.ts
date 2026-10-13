export type Tick = number
export type Effort = string | null

declare module 'claude-code' {
  interface PluginState {
    'context-meter': { tick: Tick; effort: Effort }
  }
}

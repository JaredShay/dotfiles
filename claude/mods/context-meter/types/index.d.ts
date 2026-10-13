export type Tick = number

declare module 'claude-code' {
  interface PluginState {
    'context-meter': { tick: Tick }
  }
}

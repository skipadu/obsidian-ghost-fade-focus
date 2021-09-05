export interface State {
  currentLine?: number;
  pluginEnabled?: boolean;
}
type ValueOf<T> = T[keyof T];
export type PluginStateKey = keyof State;
export type PluginStateValue = ValueOf<State>;

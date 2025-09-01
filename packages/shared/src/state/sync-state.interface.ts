import { StateKey } from "./state.enum";

export interface ISyncState {
  state: StateKey
  lastSynchronisedAt: Date
  message: string
}

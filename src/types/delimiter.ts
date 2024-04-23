export const delimiter = ["comma", "tab", "space", "pipe"] as const
export type delimiter = typeof delimiter[number]

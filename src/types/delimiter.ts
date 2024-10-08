export const delimiter = ["comma", "tab", "space", "pipe"] as const;
export type Delimiter = typeof delimiter[number];

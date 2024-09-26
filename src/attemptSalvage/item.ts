import type { StructuredElements } from "@"

export const attemptSalvageItem: StructuredElements.Functions.AttemptSalvage<
  `item`
> = (_) =>
  // By default, we don't attempt to salvage individual items.
  {
    return undefined
  }

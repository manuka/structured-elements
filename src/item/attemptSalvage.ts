import type { Validation } from "@/lib/validation"

export const attemptItemSalvage: Validation.Functions.AttemptSalvage<`item`> = (
  _
) =>
  // By default, we don't attempt to salvage individual items.
  {
    return undefined
  }

import { isArray } from "@/is/array"

import type { StructuredElements } from "@"

export const attemptSalvageItemViaBlanking: StructuredElements.Functions.AttemptSalvage<
  "item"
> = <Registry extends StructuredElements.BaseRegistry, Element>({
  api,
  failures,
  name,
  subject,
  validElements,
}: {
  api: StructuredElements.API<Registry>
  failures: StructuredElements.Failure[]
  name: string
  subject: unknown
  validElements?: Partial<StructuredElements.StructuredElement<`item`, Element>>
}): Element | undefined => {
  if (failures.length === 0) {
    return subject as Element
  }

  const unsalvageableFailures: StructuredElements.Failure[] = []

  const salvage = failures.reduce((salvageInProgress, failure) => {
    if (
      isArray(failure.expectation) &&
      failure.expectation.includes(undefined)
    ) {
      return salvageInProgress
    }

    if (isArray(failure.expectation) && failure.expectation.includes(null)) {
      return {
        ...salvageInProgress,
        [failure.key]: null,
      }
    }

    unsalvageableFailures.push(failure)

    return salvageInProgress
  }, validElements)

  if (unsalvageableFailures.length > 0) {
    if (api.debugEnabled()) {
      console.log(
        `StructuredElements#attemptItemSalvageViaBlanking could not salvage subject: `,
        {
          salvage,
          failures,
          name,
          subject,
          unsalvageableFailures,
        },
      )
    }

    return
  }

  return salvage as Element
}

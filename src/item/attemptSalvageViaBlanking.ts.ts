import type { Validation } from "@/lib/validation"
import { isArray } from "@/lib/validation/isArray"

export const attemptItemSalvageViaBlanking: Validation.Functions.AttemptSalvage<
  "item"
> = <Registry extends Validation.BaseRegistry, Element>({
  api,
  failures,
  name,
  subject,
  validElements,
}: {
  api: Validation.API<Registry>
  failures: Validation.Failure[]
  name: string
  subject: unknown
  validElements?: Partial<Validation.StructuredElement<`item`, Element>>
}): Element | undefined => {
  if (failures.length === 0) {
    return subject as Element
  }

  const unsalvageableFailures: Validation.Failure[] = []

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
        `Validation#attemptItemSalvageViaBlanking could not salvage subject: `,
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

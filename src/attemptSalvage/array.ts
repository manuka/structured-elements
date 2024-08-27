import type { StructuredElements } from "@"

export const attemptSalvageArray: StructuredElements.Functions.AttemptSalvage<
  `array`
> = <Registry extends StructuredElements.BaseRegistry, Element>({
  api: _,
  failures,
  subject,
  validElements,
}: {
  api: StructuredElements.API<Registry>
  failures: StructuredElements.Failure[]
  subject: unknown
  validElements?: Element[]
}): Element[] | undefined => {
  if (failures.length === 0) {
    return subject as Element[]
  }

  if (validElements) {
    return validElements
  }

  return []
}

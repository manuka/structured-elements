import type { StructuredElements } from "@"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const attemptArraySalvage: StructuredElements.Functions.AttemptSalvage<
  `array`
> = <Registry extends StructuredElements.BaseRegistry, Element>({
  failures,
  subject,
  validElements,
}: {
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

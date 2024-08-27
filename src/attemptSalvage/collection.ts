import type { StructuredElements } from "@"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const attemptSalvageCollection: StructuredElements.Functions.AttemptSalvage<
  `collection`
> = <Element>({
  failures,
  subject,
  validElements,
}: {
  failures: StructuredElements.Failure[]
  subject: unknown
  validElements?: StructuredElements.Collection<Element>
}): StructuredElements.Collection<Element> | undefined => {
  if (failures.length === 0) {
    return subject as StructuredElements.Collection<Element>
  }

  if (validElements) {
    return validElements
  }

  return {}
}

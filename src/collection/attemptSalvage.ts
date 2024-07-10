import type { Validation } from "@/lib/validation"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const attemptCollectionSalvage: Validation.Functions.AttemptSalvage<
  `collection`
> = <Element>({
  failures,
  subject,
  validElements,
}: {
  failures: Validation.Failure[]
  subject: unknown
  validElements?: Validation.Collection<Element>
}): Validation.Collection<Element> | undefined => {
  if (failures.length === 0) {
    return subject as Validation.Collection<Element>
  }

  if (validElements) {
    return validElements
  }

  return {}
}

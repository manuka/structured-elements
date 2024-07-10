import { Mirror } from "@/lib/mirror"
import type { Validation } from "@/lib/validation"

export const attemptMirrorSalvage = <
  Subject extends Validation.Mirror<Element>,
  Element
>({
  failures,
  subject,
  validElements,
}: {
  failures: Validation.Failure[]
  subject: unknown
  validElements?: Subject
}): Subject | undefined => {
  if (failures.length === 0) {
    return subject as Subject
  }

  if (!validElements) {
    return {
      array: [],
      collection: {},
    } as unknown as Subject
  }

  const salvage = Mirror.build(validElements.collection)

  return salvage as Subject
}

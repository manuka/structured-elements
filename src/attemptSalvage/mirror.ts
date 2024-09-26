import { Mirror } from "@/mirror"

import type { StructuredElements } from "@"

export const attemptSalvageMirror = <
  Subject extends StructuredElements.Mirror<Element>,
  Element,
>({
  failures,
  subject,
  validElements,
}: {
  failures: StructuredElements.Failure[]
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

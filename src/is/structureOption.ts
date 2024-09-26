import { structureOptionsCollection } from "@/constants"

import type { StructuredElements } from "@"

export const isStructureOption = (
  subject: unknown,
): subject is StructuredElements.StructureOption => {
  return structureOptionsCollection[
    subject as StructuredElements.StructureOption
  ]
}

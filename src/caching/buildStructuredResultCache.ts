import type { Validation } from "@/lib/validation"
import { validationStructures } from "@/lib/validation/structures"

export const buildStructuredResultCache = <
  Element
>(): Validation.StructuredResultCache<Element> => {
  const results = new Map()

  validationStructures.forEach((structure) => {
    results.set(structure, new WeakMap())
  })

  return results
}

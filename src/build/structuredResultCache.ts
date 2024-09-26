import { structureOptions } from "@/constants"

import type { StructuredElements } from "@"

export const buildStructuredResultCache = <
  Element,
>(): StructuredElements.StructuredResultCache<Element> => {
  const results = new Map()

  structureOptions.forEach((structure) => {
    results.set(structure, new WeakMap())
  })

  return results
}

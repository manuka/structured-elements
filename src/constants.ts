import type { StructuredElements } from "@"

export const referenceToken: StructuredElements.ReferenceToken = `_StructuredElementReference`

export const structureOptions: StructuredElements.StructureOption[] = [
  `array`,
  `collection`,
  `item`,
  `mirror`,
]

export const structureOptionsCollection: Record<
  StructuredElements.StructureOption,
  true
> = {
  array: true,
  collection: true,
  item: true,
  mirror: true,
}

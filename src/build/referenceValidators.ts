import { buildArrayValidator } from "@/build/validator/array"
import { buildCollectionValidator } from "@/build/validator/collection"
import { buildItemValidator } from "@/build/validator/item"
import { buildMirrorValidator } from "@/build/validator/mirror"

import type { StructuredElements } from "@"

export const buildReferenceValidators = <
  Registry extends StructuredElements.BaseRegistry,
  Element,
>({
  api,
  expectation,
}: {
  api: StructuredElements.API<Registry>
  expectation: StructuredElements.Expectation<Registry, Element>
}): StructuredElements.ReferenceValidators<Element> => {
  return {
    array: buildArrayValidator({
      api,
      expectation,
    }),
    collection: buildCollectionValidator({
      api,
      expectation,
    }),
    item: buildItemValidator({
      api,
      expectation,
    }),
    mirror: buildMirrorValidator({
      api,
      expectation,
    }),
  }
}

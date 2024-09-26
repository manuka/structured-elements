import { isArray } from "@/is/array"
import type { Mirror } from "@/mirror"
import { buildMirrorCollection } from "@/mirror/buildCollection"

export const buildMirrorWithoutSorting = <Element>(
  data: Mirror.Format<Element>,
  options?: Mirror.Options<Element>,
): Mirror<Element> => {
  if (isArray(data)) {
    const collection = buildMirrorCollection(data, options)

    return {
      array: Object.freeze(data),
      collection: Object.freeze(collection),
    }
  }

  const collection: Mirror.Collection<Element> = {
    ...options?.base?.collection,
    ...data,
  }

  return {
    array: Object.freeze(Object.values(collection)),
    collection: Object.freeze(collection),
  }
}

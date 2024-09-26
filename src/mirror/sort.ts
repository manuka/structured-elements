import type { Mirror } from "@/mirror"
import { buildMirrorCollection } from "@/mirror/buildCollection"

export const sortMirror = <Element>({
  mirror,
  options,
}: {
  mirror: Mirror<Element>
  options: Mirror.Options<Element>
}): Mirror<Element> => {
  const array = [...mirror.array].sort(options.sort)

  return {
    array: Object.freeze(array),
    collection: Object.freeze(
      buildMirrorCollection(array, {
        ...options,
        // The base option is for when we're building a new version of a
        // mirror with changed data. We aren't doing that here; we just want
        // to build a sorted version of the existing data.
        base: undefined,
      }),
    ),
  }
}

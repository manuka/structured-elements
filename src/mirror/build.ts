import type { Mirror } from "@/mirror"
import { buildMirrorWithoutSorting } from "@/mirror/buildWithoutSorting"
import { sortMirror } from "@/mirror/sort"

export const buildMirror = <Element>(
  data: Mirror.Format<Element> = {},
  options?: Mirror.Options<Element>,
): Mirror<Element> => {
  const unsortedMirror = buildMirrorWithoutSorting(data, options)

  const maybeSortedMirror = options?.sort
    ? sortMirror({
        mirror: unsortedMirror,
        options,
      })
    : unsortedMirror

  return maybeSortedMirror
}

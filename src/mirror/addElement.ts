import type { Mirror } from "@/mirror"
import { buildMirror } from "@/mirror/build"

export const addElementToMirror = <Element>({
  element,
  mirror,
  options,
}: {
  element: Element
  mirror: Mirror<Element>
  options?: Mirror.Options<Element>
}): Mirror<Element> => {
  const key = options?.extractKey
    ? options.extractKey(element)
    : (element as { id: Mirror.Key }).id

  if (!key) {
    throw new Error(
      `addElementToMirror failed: element must have an id or options must provide an extractKey function. Called with: ${JSON.stringify(
        { element, mirror, options },
      )}`,
    )
  }

  return buildMirror(
    {
      ...mirror.collection,
      [key]: element,
    },
    options,
  )
}

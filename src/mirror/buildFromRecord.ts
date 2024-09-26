import type { Mirror } from "@/mirror"
import { buildMirror } from "@/mirror/build"

export type Transform<
  Element,
  Subject,
  Key extends keyof Element & keyof Subject,
> = (value: Subject[Key], key: Key) => Element[Key]

export const buildMirrorFromRecord = <
  Element,
  Subject extends Record<keyof Element, unknown>,
  SharedKey extends keyof Element & keyof Subject = keyof Element &
    keyof Subject,
>(
  subject: Subject,
  transformations: Record<
    SharedKey,
    Element[SharedKey] extends Subject[SharedKey]
      ? void | Transform<Element, Subject, SharedKey>
      : Transform<Element, Subject, SharedKey>
  >,
): Mirror<Element> => {
  const collection = {
    ...subject,
  } as Mirror.Collection<Element>

  for (const key in transformations) {
    const transform = transformations[key]

    if (transform) {
      collection[key] = transform(subject[key], key) as Element
    }
  }

  return buildMirror(collection)
}

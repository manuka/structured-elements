import { isRecordWithId } from "@/is/recordWithId"
import type { Mirror } from "@/mirror"

export const buildMirrorCollection = <Element>(
  array: Element[],
  options?: Mirror.Options<Element>,
): Mirror.Collection<Element> => {
  return array.reduce<Mirror.Collection<Element>>((result, record) => {
    if (options?.extractKey) {
      result[options.extractKey(record)] = record
      return result
    }

    if (isRecordWithId(record)) {
      result[record.id] = record
      return result
    }

    throw new Error(
      `buildMirror failed because a record has no id and no extractKey function was provided. { record: ${JSON.stringify(
        record,
      )} }`,
    )
  }, options?.base?.collection || {})
}

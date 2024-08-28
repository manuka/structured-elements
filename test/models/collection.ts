import { buildTestArray } from "&/models/array"
import type { RecordWithId } from "&/models/recordWithId"

export const buildTestCollection = ({
  base,
  length,
}: {
  base: RecordWithId
  length: number
}) => {
  const array = buildTestArray({ base, length })

  return array.reduce(
    (collection, item) => {
      collection[item.id] = item
      return collection
    },
    {} as Record<string, typeof base>,
  )
}

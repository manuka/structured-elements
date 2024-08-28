import type { RecordWithId } from "&/models/recordWithId"

export const buildTestArray = ({
  base,
  length,
}: {
  base: RecordWithId
  length: number
}) => {
  return Array.from({ length }, (_, index) => {
    return {
      ...base,
      id: `${base.id}-${index}`,
    }
  })
}

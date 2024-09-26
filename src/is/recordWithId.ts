import { isRecord } from "@/is/record"

export const isRecordWithId = <Subject>(
  subject: Subject,
): subject is Subject & { id: string } => {
  if (!isRecord(subject)) {
    return false
  }

  return typeof subject.id === `string`
}

import { isArray } from "@/is/array"
import { isRecord } from "@/is/record"
import { isStringKeyedRecord } from "@/is/stringKeyedRecord"
import type { Mirror } from "@/mirror"

export const isMirror = (subject: unknown): subject is Mirror<unknown> => {
  if (!isRecord(subject)) {
    return false
  }

  if (!isArray(subject.array)) {
    return false
  }

  if (!isStringKeyedRecord(subject.collection)) {
    return false
  }

  return true
}

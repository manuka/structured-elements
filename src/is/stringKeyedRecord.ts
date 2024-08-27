import { isRecord } from "@/is/record"

export const isStringKeyedRecord = (
  subject: unknown,
): subject is Record<string, unknown> => {
  if (!isRecord(subject)) {
    return false
  }

  for (const key in subject) {
    if (typeof key !== `string`) {
      return false
    }
  }

  return true
}

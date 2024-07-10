import type { StructuredElements } from "@"
import { isStringKeyedRecord } from "@/primitive/isStringKeyedRecord"
import { isReferenceContainer } from "@/reference/isContainer"

export const isRecordSchema = <
  Registry extends StructuredElements.BaseRegistry,
  Subject
>(
  api: StructuredElements.API<Registry>,
  expectation: unknown
): expectation is StructuredElements.RecordSchema<Registry, Subject> => {
  if (isReferenceContainer(api, expectation)) {
    return false
  }

  return isStringKeyedRecord(expectation)
}

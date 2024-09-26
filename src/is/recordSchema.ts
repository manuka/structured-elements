import { isReferenceContainer } from "@/is/referenceContainer"
import { isStringKeyedRecord } from "@/is/stringKeyedRecord"

import type { StructuredElements } from "@"

export const isRecordSchema = <
  Registry extends StructuredElements.BaseRegistry,
  Subject,
>(
  api: StructuredElements.API<Registry>,
  expectation: unknown,
): expectation is StructuredElements.RecordSchema<Registry, Subject> => {
  if (isReferenceContainer(api, expectation)) {
    return false
  }

  return isStringKeyedRecord(expectation)
}

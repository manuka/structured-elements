import { buildPrimitiveValidator } from "@/build/validator/primitive"
import { buildRecordValidator } from "@/build/validator/record"
import { isRecordSchema } from "@/is/recordSchema"

import type { StructuredElements } from "@"

export const buildItemValidator = <
  Registry extends StructuredElements.BaseRegistry,
  Subject,
>({
  api,
  expectation,
}: {
  api: StructuredElements.API<Registry>
  expectation: StructuredElements.Expectation<Registry, Subject>
}): StructuredElements.Validator<Subject, `item`> => {
  if (isRecordSchema(api, expectation)) {
    return buildRecordValidator({
      api,
      schema: expectation,
    }) as StructuredElements.Validator<Subject, `item`>
  }

  return buildPrimitiveValidator({
    api,
    expectation,
  })
}

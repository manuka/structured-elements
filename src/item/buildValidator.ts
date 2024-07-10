import type { Validation } from "@/lib/validation"
import { isRecordSchema } from "@/lib/validation/isRecordSchema"
import { buildPrimitiveValidator } from "@/lib/validation/item/buildPrimitiveValidator"
import { buildRecordValidator } from "@/lib/validation/item/buildRecordValidator"

export const buildItemValidator = <
  Registry extends Validation.BaseRegistry,
  Subject
>({
  api,
  expectation,
}: {
  api: Validation.API<Registry>
  expectation: Validation.Expectation<Registry, Subject>
}): Validation.Validator<Subject, `item`> => {
  if (isRecordSchema(api, expectation)) {
    return buildRecordValidator({
      api,
      schema: expectation,
    }) as Validation.Validator<Subject, `item`>
  }

  return buildPrimitiveValidator({
    api,
    expectation,
  })
}

import type { Validation } from "@/lib/validation"
import { isArray } from "@/lib/validation/isArray"
import { isExpectation } from "@/lib/validation/isExpectation"
import { isRecord } from "@/lib/validation/isRecord"
import { isString } from "@/lib/validation/isString"
import { isValidationStructure } from "@/lib/validation/isStructure"
import { referenceToken } from "@/lib/validation/referenceToken"

export const isReferenceContainer = <
  Registry extends Validation.BaseRegistry,
  Subject,
>(
  api: Validation.API<Registry>,
  subject: unknown,
): subject is Validation.ReferenceContainer<
  Registry,
  Subject,
  Validation.StructureOption
> => {
  if (!isRecord(subject)) {
    return false
  }

  const reference = subject[referenceToken] as
    | Validation.ReferenceContainer<
        Registry,
        Subject,
        Validation.StructureOption
      >[Validation.ReferenceToken]
    | undefined

  if (!reference) {
    return false
  }

  if (!isValidationStructure(reference.structure)) {
    if (api.debugEnabled()) {
      api.privateFunctions.debug(
        `Validation#isReferenceContainer found invalid structure:`,
        {
          subject,
          structure: reference.structure,
        },
      )
    }
    return false
  }

  if (isString(reference.target)) {
    return true
  }

  if (isArray(reference.target)) {
    const failures = reference.target.map((target, index) => {
      if (!isExpectation(api, target)) {
        return { index, target }
      }
    })

    if (failures.length === 0) {
      return true
    }

    if (api.debugEnabled()) {
      api.privateFunctions.debug(
        `Validation#isReferenceContainer found invalid target array:`,
        {
          subject,
          failures,
        },
      )
    }
  }

  if (typeof reference.target === `function`) {
    return true
  }

  if (api.debugEnabled()) {
    api.privateFunctions.debug(
      `Validation#isReferenceContainer found invalid target:`,
      {
        subject,
      },
    )
  }

  return false
}

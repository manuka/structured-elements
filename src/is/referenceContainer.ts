import { referenceToken } from "@/constants"
import { isArray } from "@/is/array"
import { isExpectation } from "@/is/expectation"
import { isRecord } from "@/is/record"
import { isString } from "@/is/string"
import { isStructureOption } from "@/is/structureOption"

import type { StructuredElements } from "@"

export const isReferenceContainer = <
  Registry extends StructuredElements.BaseRegistry,
  Subject,
>(
  api: StructuredElements.API<Registry>,
  subject: unknown,
): subject is StructuredElements.ReferenceContainer<
  Registry,
  Subject,
  StructuredElements.StructureOption
> => {
  if (!isRecord(subject)) {
    return false
  }

  const reference = subject[referenceToken] as
    | StructuredElements.ReferenceContainer<
        Registry,
        Subject,
        StructuredElements.StructureOption
      >[StructuredElements.ReferenceToken]
    | undefined

  if (!reference) {
    return false
  }

  if (!isStructureOption(reference.structure)) {
    if (api.debugEnabled()) {
      api.privateFunctions.debug(
        `StructuredElements#isReferenceContainer found invalid structure:`,
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
        `StructuredElements#isReferenceContainer found invalid target array:`,
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
      `StructuredElements#isReferenceContainer found invalid target:`,
      {
        subject,
      },
    )
  }

  return false
}

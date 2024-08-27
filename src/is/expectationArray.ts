import { isArray } from "@/is/array"
import { isExpectation } from "@/is/expectation"

import type { StructuredElements } from "@"

export const isExpectationArray = <
  Registry extends StructuredElements.BaseRegistry,
  Subject,
>(
  api: StructuredElements.API<Registry>,
  expectation: unknown,
  warn?: boolean,
): expectation is StructuredElements.ExpectationArray<Registry, Subject> => {
  if (!isArray(expectation)) {
    if (warn && api.debugEnabled()) {
      api.privateFunctions.debug(
        `StructuredElements#isExpectationArray expected an array but got:`,
        {
          expectation,
        },
      )
    }

    return false
  }

  const failures: { index: number; value: unknown }[] = []

  expectation.forEach((value, index) => {
    if (value === undefined) {
      return
    }

    if (value === null) {
      return
    }

    if (!isExpectation(api, value, warn)) {
      failures.push({ index, value })
    }
  })

  if (failures.length === 0) {
    return true
  }

  if (warn && api.debugEnabled()) {
    api.privateFunctions.debug(
      `StructuredElements#isExpectation found invalid expectation array:`,
      {
        expectation,
        failures,
      },
    )
  }

  return false
}

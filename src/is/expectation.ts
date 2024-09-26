import { referenceToken } from "@/constants"
import { isArray } from "@/is/array"
import { isExpectationArray } from "@/is/expectationArray"
import { isReferenceContainer } from "@/is/referenceContainer"
import { isStringKeyedRecord } from "@/is/stringKeyedRecord"

import type { StructuredElements } from "@"

export const isExpectation = <
  Registry extends StructuredElements.BaseRegistry,
  Subject,
>(
  api: StructuredElements.API<Registry>,
  expectation: unknown,
  warn?: boolean,
): expectation is StructuredElements.Expectation<Registry, Subject> => {
  if (isReferenceContainer(api, expectation)) {
    return true
  }

  if (isArray(expectation)) {
    return isExpectationArray(api, expectation, warn)
  }

  if (isStringKeyedRecord(expectation)) {
    if (expectation[referenceToken]) {
      return false
    }

    const failures = []

    for (const key in expectation) {
      if (!isExpectation(api, expectation[key], warn)) {
        failures.push({ key, value: expectation[key] })
      }
    }

    if (failures.length === 0) {
      return true
    }

    if (warn && api.debugEnabled()) {
      api.privateFunctions.debug(
        `StructuredElements#isExpectation found invalid record schema:`,
        {
          subject: expectation,
          failures,
        },
      )
    }

    return false
  }

  if (
    typeof expectation === `string` ||
    expectation === null ||
    expectation === undefined
  ) {
    return true
  }

  if (warn && api.debugEnabled()) {
    api.privateFunctions.debug(
      `StructuredElements#isExpectation found invalid primitive expectation:`,
      {
        subject: expectation,
        typeofSubject: typeof expectation,
      },
    )
  }

  return false
}

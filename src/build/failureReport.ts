import { buildElementPath } from "@/build/elementPath"

import type { StructuredElements } from "@"

export const buildFailureReport = <
  Registry extends StructuredElements.BaseRegistry,
  Element,
>({
  api,
  element,
  expectation,
  failures,
  path,
}: {
  api: StructuredElements.API<Registry>
  element: unknown
  expectation: StructuredElements.Expectation<Registry, Element>
  failures: StructuredElements.Failure[]
  path: string
}): StructuredElements.FailureReport[] => {
  return failures.flatMap((failure) => {
    if (failure.failures) {
      return buildFailureReport({
        api,
        element,
        expectation,
        failures: failure.failures,
        path: buildElementPath({ key: failure.key, path }),
      })
    }

    if (typeof failure.reason === `string`) {
      return {
        expectation,
        failure,
        path,
        reason: failure.reason,
        value: failure.element,
      }
    }

    if (api.debugEnabled()) {
      api.privateFunctions.debug(
        `buildFailureReport: failure.failures is blank but reason is not a string`,
        {
          element,
          expectation,
          failure,
          path,
        },
      )
    }

    return {
      expectation,
      path,
      reason: JSON.stringify(failure.reason),
      value: failure.element,
    }
  })
}

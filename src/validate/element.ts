import { buildElementPath } from "@/build/elementPath"
import { buildFailureReport } from "@/build/failureReport"
import { ensureReferencedValidator } from "@/ensure/referencedValidator"
import { isArray } from "@/is/array"
import { isDate } from "@/is/date"
import { isRecordSchema } from "@/is/recordSchema"
import { isReferenceContainer } from "@/is/referenceContainer"
import { isStringKeyedRecord } from "@/is/stringKeyedRecord"

import type { StructuredElements } from "@"

// This function validates an element against an expectation.
export const validateElement = <
  Registry extends StructuredElements.BaseRegistry,
  Element,
>({
  api,
  element,
  expectation,
  key,
  subject,
  subjectName,
  elementName = buildElementPath({ key, path: subjectName }),
}: {
  api: StructuredElements.API<Registry>
  element: unknown
  elementName?: string
  expectation: StructuredElements.Expectation<Registry, Element>
  key: string | number
  subject: unknown
  subjectName: string
}): StructuredElements.Failure[] => {
  const failures: StructuredElements.Failure[] = []

  const expectations = isArray(expectation) ? expectation : [expectation]

  const elementValid = expectations.some((possibility) => {
    if (typeof possibility === `function`) {
      if (possibility(element) === true) {
        return true
      }

      failures.push({
        element,
        expectation: possibility,
        key,
        name: elementName,
        reason: `${key}: functional expectation did not return true.`,
        subject,
      })

      return false
    }

    if (typeof possibility === `string`) {
      const model = api.registeredModels().get(possibility)

      if (model) {
        const modelValidator = model.validators()[`item`]

        const modelFailures = modelValidator.getFailures(element, elementName)

        if (modelValidator.isValid(element, elementName)) {
          return true
        }

        failures.push({
          element,
          expectation,
          failures: modelFailures,
          key,
          name: elementName,
          reason: buildFailureReport({
            api,
            element,
            expectation,
            failures: modelFailures,
            path: key.toString(),
          }),
          subject,
        })

        return false
      }

      if (possibility === `date`) {
        if (isDate(element)) {
          return true
        }

        failures.push({
          element,
          expectation,
          key,
          name: elementName,
          reason: `${key}: expected a Date, got ${typeof element}`,
          subject,
        })

        return false
      }

      if (typeof element === possibility) {
        return true
      }

      failures.push({
        element,
        expectation,
        key,
        name: elementName,
        reason: `${key}: expected typeof ${possibility}, got ${typeof element}`,
        subject,
      })

      return false
    }

    if (possibility === null) {
      if (element === null) {
        return true
      }

      failures.push({
        element,
        expectation,
        key,
        name: elementName,
        reason: `${key} is not null`,
        subject,
      })

      return false
    }

    if (possibility === undefined) {
      if (element === undefined) {
        return true
      }

      failures.push({
        element,
        expectation,
        key,
        name: elementName,
        reason: `${key} is not undefined`,
        subject,
      })

      return false
    }

    if (isReferenceContainer<Registry, Element>(api, possibility)) {
      const referencedValidator = ensureReferencedValidator({
        api,
        container: possibility,
      })

      if (referencedValidator.isValid(element, elementName)) {
        return true
      }

      const elementFailures = referencedValidator.getFailures(
        element,
        elementName,
      )

      failures.push({
        element,
        expectation,
        failures: elementFailures,
        key,
        name: elementName,
        reason: buildFailureReport({
          api,
          element,
          expectation,
          failures: elementFailures,
          path: key.toString(),
        }),
        subject,
      })

      return false
    }

    if (isRecordSchema(api, possibility)) {
      const recordValidator: StructuredElements.Validator<Element> =
        api.validator(possibility, `item`)

      if (recordValidator.isValid(element, elementName)) {
        return true
      }

      const recordFailures = recordValidator.getFailures(element, elementName)

      failures.push({
        element,
        expectation,
        failures: recordFailures,
        key,
        name: elementName,
        reason: buildFailureReport({
          api,
          element,
          expectation,
          failures: recordFailures,
          path: key.toString(),
        }),
        subject,
      })

      return false
    }

    if (api.debugEnabled()) {
      api.privateFunctions.debug(
        `validateElement did not know how to validate subject:`,
        {
          expectations,
          elementName,
          name: subjectName,
          possibility,
          subject,
        },
        {
          recordSchema: isRecordSchema(api, possibility),
          stringKeyedRecord: isStringKeyedRecord(possibility),
        },
      )
    }

    return false
  })

  if (elementValid) {
    return []
  }

  return failures
}

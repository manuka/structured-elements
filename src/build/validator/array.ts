import { attemptSalvageArray } from "@/attemptSalvage/array"
import { buildValidationResult } from "@/build/validationResult"
import { isArray } from "@/is/array"
import { validateElement } from "@/validate/element"

import type { StructuredElements } from "@"

const structure = `array` as const

export const buildArrayValidator = <
  Registry extends StructuredElements.BaseRegistry,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Element,
>({
  api,
  expectation,
}: {
  api: StructuredElements.API<Registry>
  expectation: StructuredElements.Expectation<Registry, Element>
}): StructuredElements.Validator<Element, `array`> => {
  const validator: StructuredElements.Validator<Element, `array`> = {
    getFailures: (subject, name) => {
      return validator.validate(subject, name).failures
    },

    getSalvage: (subject, name, attemptSalvage) => {
      return validator.validate(subject, name, attemptSalvage).salvage
    },

    isValid: (subject, name): subject is Element[] => {
      return validator.validate(subject, name).valid
    },

    validate: (subject, name, attemptSalvage = attemptSalvageArray) => {
      expectation
      if (!isArray(subject)) {
        return buildValidationResult({
          failures: [
            {
              element: subject,
              expectation,
              key: `(subject)`,
              name,
              reason: `${name} expected to be an array, but isn't. It has typeof ${typeof subject}`,
              subject,
            },
          ],
          subject,
        })
      }

      const cached = api.privateFunctions.getCachedResult({
        expectation,
        structure,
        subject,
      })

      if (cached) {
        return cached
      }

      const failures: StructuredElements.Failure[] = []
      const validElements: Element[] = []

      subject.forEach((element, index) => {
        const elementFailures = validateElement({
          api,
          element,
          expectation,
          key: index.toString(),
          subject,
          subjectName: name,
        })

        if (elementFailures.length > 0) {
          failures.push(...elementFailures)
        } else {
          validElements.push(element as Element)
        }
      })

      const salvage = attemptSalvage({
        api,
        failures,
        name,
        subject,
        validElements,
      })

      const result = buildValidationResult({
        failures,
        salvage,
        subject,
      })

      api.privateFunctions.cacheResult({
        expectation,
        result,
        structure,
      })

      return result
    },
  }

  return validator
}

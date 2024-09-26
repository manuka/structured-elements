import { attemptSalvageCollection } from "@/attemptSalvage/collection"
import { buildValidationResult } from "@/build/validationResult"
import { referenceToken } from "@/constants"
import { isRecord } from "@/is/record"
import { isStringKeyedRecord } from "@/is/stringKeyedRecord"
import { validateElement } from "@/validate/element"

import type { StructuredElements } from "@"

const structure = `collection` as const

export const buildCollectionValidator = <
  Registry extends StructuredElements.BaseRegistry,
  Element,
>({
  api,
  expectation,
}: {
  api: StructuredElements.API<Registry>
  expectation: StructuredElements.Expectation<Registry, Element>
}): StructuredElements.Validator<Element, `collection`> => {
  const validator: StructuredElements.Validator<Element, `collection`> = {
    getFailures: (subject, name) => {
      return validator.validate(subject, name).failures
    },

    getSalvage: (subject, name, attemptSalvage = attemptSalvageCollection) => {
      return validator.validate(subject, name, attemptSalvage).salvage
    },

    isValid: (
      subject,
      name,
    ): subject is StructuredElements.Collection<Element> => {
      return validator.getFailures(subject, name).length === 0
    },

    validate: (subject, name, attemptSalvage = attemptSalvageCollection) => {
      if (!isStringKeyedRecord(subject)) {
        return buildValidationResult({
          failures: [
            {
              element: subject,
              expectation: [],
              key: `(subject)`,
              name,
              reason: [
                `${name} expected to be a string-keyed collection, but it is not.`,
                isRecord(subject)
                  ? `The following keys are not strings: ${JSON.stringify(
                      Object.keys(subject).filter((key) => {
                        return typeof key !== `string`
                      }),
                    )}.`
                  : `It has typeof: ${typeof subject}.`,
              ].join(` `),
              subject,
            },
          ],
          subject,
        })
      }

      const cachedResult = api.privateFunctions.getCachedResult({
        expectation,
        structure,
        subject,
      }) as
        | StructuredElements.ValidationResult<
            StructuredElements.Collection<Element>
          >
        | undefined

      if (cachedResult) {
        return cachedResult
      }

      const failures: StructuredElements.Failure[] = []
      const validElements = {} as StructuredElements.Collection<Element>

      for (const key in subject) {
        if (key === referenceToken) {
          failures.push({
            element: subject[key],
            expectation,
            key,
            name,
            reason: `${name} contains the reserved token used to signal that it is a validation reference: '${key}'. You cannot use this key in your application data.`,
            subject,
          })

          continue
        }

        const elementFailures = validateElement({
          api,
          element: subject[key],
          expectation,
          key,
          subject,
          subjectName: name,
        })

        if (elementFailures.length > 0) {
          failures.push(...elementFailures)
        } else {
          validElements[key] = subject[key] as Element
        }
      }

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

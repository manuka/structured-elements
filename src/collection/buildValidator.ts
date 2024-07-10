import type { Validation } from "@/lib/validation"
import { buildValidationResult } from "@/lib/validation/buildResult"
import { attemptCollectionSalvage } from "@/lib/validation/collection/attemptSalvage"
import { isRecord } from "@/lib/validation/isRecord"
import { isStringKeyedRecord } from "@/lib/validation/isStringKeyedRecord"
import { referenceToken } from "@/lib/validation/referenceToken"
import { validateElement } from "@/lib/validation/validateElement"

const structure = `collection` as const

export const buildCollectionValidator = <
  Registry extends Validation.BaseRegistry,
  Element
>({
  api,
  expectation,
}: {
  api: Validation.API<Registry>
  expectation: Validation.Expectation<Registry, Element>
}): Validation.Validator<Element, `collection`> => {
  const validator: Validation.Validator<Element, `collection`> = {
    getFailures: (subject, name) => {
      return validator.validate(subject, name).failures
    },

    getSalvage: (subject, name, attemptSalvage = attemptCollectionSalvage) => {
      return validator.validate(subject, name, attemptSalvage).salvage
    },

    isValid: (subject, name): subject is Validation.Collection<Element> => {
      return validator.getFailures(subject, name).length === 0
    },

    validate: (subject, name, attemptSalvage = attemptCollectionSalvage) => {
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
                      })
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
      }) as Validation.Result<Validation.Collection<Element>> | undefined

      if (cachedResult) {
        return cachedResult
      }

      const failures: Validation.Failure[] = []
      const validElements = {} as Validation.Collection<Element>

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

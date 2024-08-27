import { attemptSalvageItem } from "@/attemptSalvage/item"
import { buildValidationResult } from "@/build/validationResult"
import { isStringKeyedRecord } from "@/is/stringKeyedRecord"
import { validateElement } from "@/validate/element"

import type { StructuredElements } from "@"

const structure = `item` as const

export const buildRecordValidator = <
  Registry extends StructuredElements.BaseRegistry,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Subject extends Record<string, any>,
>({
  api,
  schema,
}: {
  api: StructuredElements.API<Registry>
  schema: StructuredElements.RecordSchema<Registry, Subject>
}): StructuredElements.Validator<Subject, `item`> => {
  const expectation = schema as StructuredElements.Expectation<
    Registry,
    Subject
  >

  const validator: StructuredElements.Validator<Subject, `item`> = {
    getFailures: (subject, name) => {
      return validator.validate(subject, name).failures
    },

    getSalvage: (subject, name) => {
      return validator.validate(subject, name).salvage
    },

    isValid: (subject, name): subject is Subject => {
      return validator.validate(subject, name).valid
    },

    validate: (
      subject,
      name,
      attemptSalvage = attemptSalvageItem,
    ): StructuredElements.ValidationResult<Subject> => {
      if (!isStringKeyedRecord(subject)) {
        return buildValidationResult({
          failures: [
            {
              element: subject,
              expectation,
              key: `(subject)`,
              name,
              reason: `${name} expected to be a string-keyed record, but it isn't. It has typeof '${typeof subject}'.`,
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
        return cached as StructuredElements.ValidationResult<Subject>
      }

      const failures: StructuredElements.Failure[] = []

      const validElements: Partial<Subject> = {}

      for (const key in schema) {
        const keyFailures = validateElement({
          api,
          element: subject[key],
          expectation: schema[key] as StructuredElements.Expectation<
            Registry,
            Subject[typeof key]
          >,
          key,
          subject,
          subjectName: name,
        })

        if (keyFailures.length === 0) {
          validElements[key] = subject[key] as Subject[typeof key]
        } else {
          failures.push(...keyFailures)
        }
      }

      const salvage = attemptSalvage({
        api,
        subject,
        name,
        failures,
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

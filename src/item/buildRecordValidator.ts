import type { Validation } from "@/lib/validation"
import { buildValidationResult } from "@/lib/validation/buildResult"
import { isStringKeyedRecord } from "@/lib/validation/isStringKeyedRecord"
import { attemptItemSalvage } from "@/lib/validation/item/attemptSalvage"
import { validateElement } from "@/lib/validation/validateElement"

const structure = `item` as const

export const buildRecordValidator = <
  Registry extends Validation.BaseRegistry,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Subject extends Record<string, any>,
>({
  api,
  schema,
}: {
  api: Validation.API<Registry>
  schema: Validation.RecordSchema<Registry, Subject>
}): Validation.Validator<Subject, `item`> => {
  const expectation = schema as Validation.Expectation<Registry, Subject>

  const validator: Validation.Validator<Subject, `item`> = {
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
      attemptSalvage = attemptItemSalvage,
    ): Validation.Result<Subject> => {
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
        return cached as Validation.Result<Subject>
      }

      const failures: Validation.Failure[] = []

      const validElements: Partial<Subject> = {}

      for (const key in schema) {
        const keyFailures = validateElement({
          api,
          element: subject[key],
          expectation: schema[key] as Validation.Expectation<
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

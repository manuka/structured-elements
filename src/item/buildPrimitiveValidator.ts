import type { Validation } from "@/lib/validation"
import { buildValidationResult } from "@/lib/validation/buildResult"
import { attemptItemSalvage } from "@/lib/validation/item/attemptSalvage"
import { validateElement } from "@/lib/validation/validateElement"

const structure = `item` as const

export const buildPrimitiveValidator = <
  Registry extends Validation.BaseRegistry,
  Subject
>({
  api,
  expectation,
}: {
  api: Validation.API<Registry>
  expectation: Validation.Expectation<Registry, Subject>
}): Validation.Validator<Subject, `item`> => {
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
      attemptSalvage = attemptItemSalvage
    ): Validation.Result<Subject> => {
      const cached = api.privateFunctions.getCachedResult({
        expectation,
        structure,
        subject,
      })

      if (cached) {
        return cached
      }

      const failures = validateElement({
        api,
        element: subject,
        elementName: name,
        expectation,
        key: `(subject)`,
        subject,
        subjectName: name,
      })

      const salvage = attemptSalvage<Registry, Subject>({
        api,
        subject,
        name,
        failures,
      })

      const result = buildValidationResult<Subject>({
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

import { attemptSalvageItem } from "@/attemptSalvage/item"
import { buildValidationResult } from "@/build/validationResult"
import { validateElement } from "@/validate/element"

import type { StructuredElements } from "@"

const structure = `item` as const

export const buildPrimitiveValidator = <
  Registry extends StructuredElements.BaseRegistry,
  Subject,
>({
  api,
  expectation,
}: {
  api: StructuredElements.API<Registry>
  expectation: StructuredElements.Expectation<Registry, Subject>
}): StructuredElements.Validator<Subject, `item`> => {
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

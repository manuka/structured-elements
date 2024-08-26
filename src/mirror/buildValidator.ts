import { isValidMirror } from "@/lib/mirror/isValid"
import type { Validation } from "@/lib/validation"
import { buildValidationResult } from "@/lib/validation/buildResult"
import { attemptMirrorSalvage } from "@/lib/validation/mirror/attemptSalvage"
import { ensureReferencedValidator } from "@/lib/validation/reference/ensureValidator"

const structure = `mirror` as const

export const buildMirrorValidator = <
  Registry extends Validation.BaseRegistry,
  Element,
>({
  api,
  expectation,
}: {
  api: Validation.API<Registry>
  expectation: Validation.Expectation<Registry, Element>
}): Validation.Validator<Element, `mirror`> => {
  const validator: Validation.Validator<Element, `mirror`> = {
    getFailures: (subject, name): Validation.Failure[] => {
      return validator.validate(subject, name).failures
    },

    getSalvage: (subject, name, attemptSalvage = attemptMirrorSalvage) => {
      return validator.validate(subject, name, attemptSalvage).salvage
    },

    isValid: (subject, name): subject is Validation.Mirror<Element> => {
      return validator.getFailures(subject, name).length === 0
    },

    validate: (subject, name, attemptSalvage = attemptMirrorSalvage) => {
      if (!isValidMirror(subject)) {
        return buildValidationResult({
          failures: [
            {
              element: subject,
              expectation,
              key: `subject`,
              name,
              reason: `${name} expected to be a Mirror, but isn't. A Mirror must have a readonly array and a readonly collection, each containing the same elements.`,
              subject,
            },
          ],
          subject,
        })
      }

      const keys = Object.keys(subject.collection)

      if (keys.length !== subject.array.length) {
        return buildValidationResult({
          failures: [
            {
              element: subject,
              expectation,
              key: `subject`,
              name,
              reason: `Mirror ${name} has mismatched length, with ${keys.length} collection entries and ${subject.array.length} array entries.`,
              subject,
            },
          ],
          subject,
        })
      }

      const target = expectation as Validation.ReferenceTarget<
        Registry,
        Element
      >

      const arrayValidator = ensureReferencedValidator({
        api,
        container: api.reference(`array`, target),
      })

      const collectionValidator = ensureReferencedValidator({
        api,
        container: api.reference(`collection`, target),
      })

      const arrayResult = arrayValidator.validate(
        subject.array,
        `${name}.array`,
      )

      const collectionResult = collectionValidator.validate(
        subject.collection,
        `${name}.collection`,
      )

      const failures: Validation.Failure[] = [
        ...arrayResult.failures,
        ...collectionResult.failures,
      ]

      const validElements = {
        array: arrayResult.salvage || [],
        collection: collectionResult.salvage || {},
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

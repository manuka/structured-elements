import { attemptSalvageMirror } from "@/attemptSalvage/mirror"
import { buildValidationResult } from "@/build/validationResult"
import { ensureReferencedValidator } from "@/ensure/referencedValidator"
import { isMirror } from "@/is/mirror"

import type { StructuredElements } from "@"

const structure = `mirror` as const

export const buildMirrorValidator = <
  Registry extends StructuredElements.BaseRegistry,
  Element,
>({
  api,
  expectation,
}: {
  api: StructuredElements.API<Registry>
  expectation: StructuredElements.Expectation<Registry, Element>
}): StructuredElements.Validator<Element, `mirror`> => {
  const validator: StructuredElements.Validator<Element, `mirror`> = {
    getFailures: (subject, name): StructuredElements.Failure[] => {
      return validator.validate(subject, name).failures
    },

    getSalvage: (subject, name, attemptSalvage = attemptSalvageMirror) => {
      return validator.validate(subject, name, attemptSalvage).salvage
    },

    isValid: (subject, name): subject is StructuredElements.Mirror<Element> => {
      return validator.getFailures(subject, name).length === 0
    },

    validate: (subject, name, attemptSalvage = attemptSalvageMirror) => {
      if (!isMirror(subject)) {
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

      const target = expectation as StructuredElements.ReferenceTarget<
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

      const failures: StructuredElements.Failure[] = [
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

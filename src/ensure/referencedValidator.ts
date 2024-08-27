import { buildReferenceValidators } from "@/build/referenceValidators"
import { referenceToken } from "@/constants"
import { isString } from "@/is/string"

import type { StructuredElements } from "@"

const isModelReference = <Registry extends StructuredElements.BaseRegistry>(
  subject: unknown,
  api: StructuredElements.API<Registry>,
): subject is keyof Registry & string => {
  return isString(subject) && api.registeredModels().has(subject)
}

export const ensureReferencedValidator = <
  Registry extends StructuredElements.BaseRegistry,
  Element,
  Structure extends StructuredElements.StructureOption,
>({
  api,
  container,
}: {
  api: StructuredElements.API<Registry>
  container: StructuredElements.ReferenceContainer<Registry, Element, Structure>
}): StructuredElements.Validator<Element, Structure> => {
  const { structure, target } = container[referenceToken]

  if (isModelReference(target, api)) {
    const model = api.registeredModels().get(target)

    if (!model) {
      api.privateFunctions.debug(
        `ensureReferencedValidator failed because the model ${target} was not found in the registry.`,
        { api, container },
      )

      throw new Error(
        `ensureReferencedValidator failed because the model ${target} was not found in the registry. See console for details.`,
      )
    }

    const validators =
      model.validators() as StructuredElements.ReferenceValidators<Element>

    return validators[structure]
  }

  const expectation = target as StructuredElements.Expectation<
    Registry,
    Element
  >

  const cache = api.internalCache.validators.get(expectation) as
    | StructuredElements.ReferenceValidators<Element>
    | undefined

  const cachedValidator = cache && cache[structure]

  if (cachedValidator) {
    return cachedValidator
  }

  const validators = buildReferenceValidators({
    api,
    expectation,
  })

  api.internalCache.validators.set(
    container,
    // The map we store the validators in doesn't let us specify a generic
    // type for the Subject, so we have to cast it here.
    validators as StructuredElements.ReferenceValidators<StructuredElements.CacheableSubject>,
  )

  return validators[structure]
}

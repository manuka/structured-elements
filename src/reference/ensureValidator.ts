import type { Validation } from "@/lib/validation"
import { buildValidators } from "@/lib/validation/buildValidators"
import { isString } from "@/lib/validation/isString"
import { referenceToken } from "@/lib/validation/referenceToken"

const isModelReference = <Registry extends Validation.BaseRegistry>(
  subject: unknown,
  api: Validation.API<Registry>,
): subject is keyof Registry & string => {
  return isString(subject) && api.registeredModels().has(subject)
}

export const ensureReferencedValidator = <
  Registry extends Validation.BaseRegistry,
  Element,
  Structure extends Validation.StructureOption,
>({
  api,
  container,
}: {
  api: Validation.API<Registry>
  container: Validation.ReferenceContainer<Registry, Element, Structure>
}): Validation.Validator<Element, Structure> => {
  const { structure, target } = container[referenceToken]

  if (isModelReference(target, api)) {
    const model = api.registeredModels().get(target)

    if (!model) {
      api.privateFunctions.debug(
        `getReferencedValidator failed because the model ${target} was not found in the registry.`,
        { api, container },
      )

      throw new Error(
        `getReferencedValidator failed because the model ${target} was not found in the registry. See console for details.`,
      )
    }

    const validators = model.validators() as Validation.Validators<Element>

    return validators[structure]
  }

  const expectation = target as Validation.Expectation<Registry, Element>

  const cache = api.internalCache.validators.get(expectation) as
    | Validation.Validators<Element>
    | undefined

  const cachedValidator = cache && cache[structure]

  if (cachedValidator) {
    return cachedValidator
  }

  const validators = buildValidators({
    api,
    expectation,
  })

  api.internalCache.validators.set(
    container,
    // The map we store the validators in doesn't let us specify a generic
    // type for the Subject, so we have to cast it here.
    validators as Validation.Validators<Validation.CacheableSubject>,
  )

  return validators[structure]
}

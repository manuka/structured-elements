/* eslint-disable @typescript-eslint/no-explicit-any */

export { Mirror } from "@/mirror"

import { attemptSalvageArray } from "@/attemptSalvage/array"
import { attemptSalvageCollection } from "@/attemptSalvage/collection"
import { attemptSalvageItem } from "@/attemptSalvage/item"
import { attemptSalvageItemViaBlanking } from "@/attemptSalvage/itemViaBlanking"
import { attemptSalvageMirror } from "@/attemptSalvage/mirror"
import { buildReferenceValidators } from "@/build/referenceValidators"
import { buildStructuredResultCache } from "@/build/structuredResultCache"
import { referenceToken } from "@/constants"
import { ensureReferencedValidator } from "@/ensure/referencedValidator"
import { isArray } from "@/is/array"

// This library allows an application to easily validate data by
// defining a standard set of expectations for each known Type.
//
// The library is designed to be used with a Registry object that
// contains all the models that you want to validate. You supply this
// registry when you call the setup function that returns your api.
//
// Each model has an expectation that defines the rules for validating
// the model's data. You can define expectations as inline schemas,
// references to other models, or custom validation functions.
//
// The library caches the results of validating subjects against
// expectations, so that you don't have to validate the same subject
// multiple times. This is useful for performance and debugging.
//
// The library also provides a debug mode that logs information about
// the validation process when enabled.
//
// The library is designed to be used with TypeScript, so that you can
// define your models and expectations using the type system. This
// makes it easier to catch errors and refactor your code.
//
// To an extent, the library can detect when a model does not match its
// Type. This feature isn't perfect, but it can help you catch some
// mistakes. Unfortunately, the type errors in this situation aren't
// always as helpful as we would like them to be.
//
// You can validate a subject against an expectation by calling the
// validator function on your api object. This function returns a
// validator object that you can use to check if a subject is valid,
// get a list of validation failures, or attempt to salvage a subject
// that has failed validation.
//
// You can tell the library that a given expectation applies to data in
// a specific structure by using the reference function on your api
// object. This is useful for validating arrays, collections, and
// mirrors of data.
//
// That same reference function can be used to create a reference to
// another model, so that you specify when a model contains one or more
// instances of another model. This is useful for validating nested
// data structures.

// Example usage:
//
// (lib/models.ts)
//
// import { StructuredElements } from 'structured-elements;
// import { type Person, PersonModel } from '@/lib/person';
// import { type Thing, ThingModel } from '@/lib/thing';
//
// export type Registry = {
//   Person: Person;
//   Thing: Thing;
// }
//
// export type Model<ModelId extends keyof Registry> = StructuredElements.Model<
//   Registry,
//   ModelId
// >;
//
// export const Modelling = StructuredElements.setup<Registry>({
//   debugEnabled: () => process.env.NODE_ENV === 'development',
//   models: {
//     Person: PersonModel,
//     Thing: ThingModel,
//   },
// });
//
// (lib/person.ts)
//
// import { Modelling, type Model } from '@/lib/models';
//
// export type Person = {
//   inventory: Thing[];
//   name: string;
//   roleId?: number;
// }
//
// export const PersonModel: Model<'Person'> = {
//   inventory: Modelling.reference('array', 'Thing'),
//   name: 'string',
//   roleId: ['number', undefined],
// };
//
// (lib/thing.ts)
//
// import { Modelling, type Model } from '@/lib/models';
//
// export type Thing = {
//   id: string;
//   name: string;
//   parts: Record<string, Thing>;
//   type: 'widget' | 'gadget';
//   weight: number | null;
// }
//
// export const ThingModel: Model<'Thing'> = {
//   id: 'string',
//   name: 'string',
//   parts: Modelling.reference('collection', 'Thing'),
//   type: Modelling.equality('item', ['widget', 'gadget']),
//   weight: ['number', null],
// },
//
// (lib/apiConsumer.ts)
//
// import { Modelling } from '@/lib/models';
//
// export const fetchPeople = async (ids: string) => {
//   const response = await fetch(`/api/people?ids=${ids}`);
//   const people = await response.json();
//
//   const validator = Modelling.validator('array', 'Person');
//
//   if (validator.isValid(people) {
//     return people;
//   }
//
//   return validator.getSalvage(person, 'person');
// }
export namespace StructuredElements {
  // The Registry is a typescript record of all the models that have been defined.
  // We use it to look up model types by their ID.
  // To use this library, you need to define a Registry type that contains all the models that you want to validate.
  // The recommended approach is to match your modelId registry keys to the names of the types in your application.
  // For example, if you want to be able to validate a type called Item, you would add a registry entry with the modelId 'Item' and map it to the Item type.
  export type BaseRegistry = Record<string, CacheableSubject>

  export type ModelRegistry<Registry extends BaseRegistry> = Map<
    keyof Registry,
    RegistryEntry<Registry, keyof Registry>
  >

  // The API object contains all the functions that you need to interact with the validation library.
  export type API<Registry extends BaseRegistry> = {
    debugEnabled: () => boolean

    equality: APIMethods.BuildEqualityCheck<Registry>

    registeredModels: APIMethods.GetModelRegistry<Registry>

    reference: APIMethods.BuildReference<Registry>

    results: ExpectationResultCache<Registry, CacheableSubject>

    // Retrieve the validator for a structure and expectation.
    // You can pass a modelId as the expectation.
    validator: APIMethods.GetValidator<Registry>

    attemptSalvage: {
      array: Functions.AttemptSalvage<`array`>
      collection: Functions.AttemptSalvage<`collection`>
      item: Functions.AttemptSalvage<`item`>
      itemViaBlanking: Functions.AttemptSalvage<`item`>
      mirror: Functions.AttemptSalvage<`mirror`>
    }

    // These functions are used internally by the library.
    // Interacting with them directly is not supported.
    privateFunctions: {
      cacheResult: APIMethods.CacheResult<Registry>
      debug: typeof console.log
      getCachedResult: APIMethods.GetCachedResult<Registry>
      buildRegistryEntry: APIMethods.BuildRegistryEntry<Registry>
    }

    // Interacting with this cache directly is not supported.
    internalCache: {
      buildEqualityCheck?: APIMethods.BuildEqualityCheck<Registry>
      cacheResult?: APIMethods.CacheResult<Registry>
      getCachedResult?: APIMethods.GetCachedResult<Registry>
      getValidator?: APIMethods.GetValidator<Registry>
      modelRegistry?: ModelRegistry<Registry>
      prepareModelRegistry: Functions.PrepareModelRegistry<Registry>
      reference?: APIMethods.BuildReference<Registry>
      registerModel?: APIMethods.BuildRegistryEntry<Registry>
      validators: Map<Expectation<Registry, any>, ReferenceValidators<any>>
    }
  }

  // Call this function to set up the validation library.
  // It returns an object that contains all the functions you need to interact with the library.
  // You can use this object to define new models, arrays, collections, and mirrors.
  // Make sure that you put the object in its own file and export it so that you can use it throughout your application.
  // The Registry type that you pass in should contain all the models that you want to validate.
  // The recommended approach is to match your modelId registry keys to the names of the types in your application.
  // Do not create more than one instance of the API object unless you have a very good reason to.
  export const setup = <Registry extends BaseRegistry>({
    debugEnabled,
    logDebugMessage = console.log,
    models,
  }: {
    debugEnabled: () => boolean
    logDebugMessage?: typeof console.log
    models: Functions.PrepareModelRegistry<Registry>
  }): API<Registry> => {
    const api: API<Registry> = {
      // Supply this function when you initialize the API object.
      // If it returns true, the library will log debug information.
      debugEnabled,

      equality: (structure, target) => {
        if (api.internalCache.buildEqualityCheck) {
          return api.internalCache.buildEqualityCheck(structure, target)
        }

        const buildEqualityCheck =
          APIMethods.curryBuildEqualityCheck<Registry>()
        api.internalCache.buildEqualityCheck = buildEqualityCheck

        return buildEqualityCheck(structure, target)
      },

      // This cache stores all the models that have been defined.
      // The library uses it to look up models by their ID.
      // It also stores the results of validating subjects, so that we don't have to validate the same subject multiple times.
      // Interacting with the cache directly is not supported.
      registeredModels: () => {
        if (api.internalCache.modelRegistry) {
          return api.internalCache.modelRegistry
        }

        const registryBuilders = api.internalCache.prepareModelRegistry()

        const newModelRegistry: ModelRegistry<Registry> = new Map<
          keyof Registry,
          RegistryEntry<Registry, keyof Registry>
        >()

        for (const modelId in registryBuilders) {
          const entry = api.privateFunctions.buildRegistryEntry({
            modelId,
            expect: registryBuilders[modelId],
          })
          newModelRegistry.set(modelId, entry)
        }

        api.internalCache.modelRegistry = newModelRegistry

        return api.internalCache.modelRegistry
      },

      reference: (structure, target) => {
        if (api.internalCache.reference) {
          return api.internalCache.reference(structure, target)
        }

        const reference = APIMethods.curryBuildReference<Registry>()
        api.internalCache.reference = reference

        return reference(structure, target)
      },

      results: new Map(),

      validator: (expectation, structure) => {
        if (api.internalCache.getValidator) {
          return api.internalCache.getValidator(
            expectation,
            structure || (`item` as unknown as typeof structure),
          )
        }

        const getValidator = APIMethods.curryGetValidator<Registry>(api)
        api.internalCache.getValidator = getValidator

        return getValidator(expectation, structure)
      },

      // This object contains functions for attempting to salvage data in
      // various structures. They are mostly used internally by the library,
      // but exposed here because you might need to pass a specific
      // attemptSalvage operation into a validator.
      attemptSalvage: {
        // Salvage an array by filtering out invalid elements.
        array: attemptSalvageArray,

        // Salvage a collection by filtering out invalid entries.
        collection: attemptSalvageCollection,

        // By default, we do not salvage invalid items. This returns undefined.
        item: attemptSalvageItem,

        // Attempt to salvage an item by discarding optional invalid fields.
        // This checks each invalid field against its expectation.
        //
        // If undefined is permitted, the field is omitted from the item.
        //
        // Otherwise, if null is permitted, the field's value is set to null.
        //
        // If the item has one or more invalid fields that cannot be blank,
        // the entire item is considered invalid and this returns undefined.
        itemViaBlanking: attemptSalvageItemViaBlanking,

        // Salvage a mirror by building a new one using only the valid elements
        // from its collection. This process ignores the entire array, potentially
        // discarding some valid array elements that are not in the collection,
        // because we do not know what those elements would have used as keys.
        mirror: attemptSalvageMirror,
      },

      // This object contains functions that are used internally by the library.
      privateFunctions: {
        // Validators call this function to cache the result of validating a subject against a given expectation or expectations.
        cacheResult: ({ expectation, result, structure }) => {
          if (api.internalCache.cacheResult) {
            return api.internalCache.cacheResult({
              expectation,
              result,
              structure,
            })
          }

          const cacheResult = APIMethods.curryCacheResult(api)
          api.internalCache.cacheResult = cacheResult

          return cacheResult({ expectation, result, structure })
        },

        debug: logDebugMessage,

        // Validators call this function to check if a subject has already been validated against a given expectation.
        // If it has, they usually return the cached result.
        getCachedResult: ({ expectation, structure, subject }) => {
          if (api.internalCache.getCachedResult) {
            return api.internalCache.getCachedResult({
              expectation,
              structure,
              subject,
            })
          }

          const getCachedResult = APIMethods.curryGetCachedResult(api)
          api.internalCache.getCachedResult = getCachedResult

          return getCachedResult({ expectation, structure, subject })
        },

        // This function is used to create each of the models in the registry.
        buildRegistryEntry: ({ modelId, expect: expectation }) => {
          if (api.internalCache.registerModel) {
            return api.internalCache.registerModel({
              modelId,
              expect: expectation,
            })
          }

          const registerModel = APIMethods.curryBuildRegistryEntry(api)
          api.internalCache.registerModel = registerModel

          return registerModel({ modelId, expect: expectation })
        },
      },

      // Interacting with this cache directly is not supported.
      internalCache: {
        buildEqualityCheck: undefined,
        cacheResult: undefined,
        getCachedResult: undefined,
        getValidator: undefined,
        modelRegistry: undefined,
        prepareModelRegistry: models,
        reference: undefined,
        registerModel: undefined,
        validators: new Map(),
      },
    }

    return api
  }

  export type RegistryEntry<
    Registry extends BaseRegistry,
    ModelId extends keyof Registry,
  > = {
    modelId: ModelId
    expect: () => Expectation<Registry, Registry[ModelId]>
    validators: () => ReferenceValidators<Registry[ModelId]>
  }

  export type ReferenceContainer<
    Registry extends BaseRegistry,
    Subject,
    Structure extends StructureOption,
  > = {
    [referenceToken]: {
      structure: Structure
      target: ReferenceTarget<Registry, Subject>
    }
  }

  export type ReferenceTarget<
    Registry extends BaseRegistry,
    Subject,
  > = Subject extends Registry[keyof Registry]
    ? keyof Registry
    : Expectation<Registry, Subject>

  export type ReferenceToken = `_StructuredElementReference`

  // The result of validating a subject against an expectation
  // We cache this per expectation and per subject
  export type ValidationResult<Subject> = {
    failures: Failure[]
    salvage: Subject | undefined
  } & (
    | {
        subject: Subject
        valid: true
      }
    | {
        subject: unknown
        valid: false
      }
  )

  // This namespace is used internally by the library to define the functions that are exposed to the application via its api object.
  export namespace APIMethods {
    export type CacheResult<Registry extends BaseRegistry> = <
      Structure extends StructureOption,
      Element,
    >(args: {
      expectation: Expectation<Registry, Element>
      result: ValidationResult<StructuredElement<Structure, Element>>
      structure: Structure
    }) => ValidationResult<StructuredElement<Structure, Element>>

    export const curryCacheResult = <Registry extends BaseRegistry>(
      api: API<Registry>,
    ): CacheResult<Registry> => {
      return <Structure extends StructureOption, Element>({
        expectation,
        result,
        structure,
      }: {
        expectation: Expectation<Registry, Element>
        result: ValidationResult<StructuredElement<Structure, Element>>
        structure: Structure
      }) => {
        if (isCacheable(result.subject)) {
          const subject = result.subject

          if (!api.results.has(expectation)) {
            const structuredResultCache = buildStructuredResultCache<Element>()

            ;(api.results as ExpectationResultCache<Registry, Element>).set(
              expectation,
              structuredResultCache,
            )
          }

          ;(api.results as ExpectationResultCache<Registry, Element>)
            .get(expectation)
            ?.get(structure)
            ?.set(subject, result)
        }

        return result
      }
    }

    export type GetCachedResult<Registry extends BaseRegistry> = <
      Structure extends StructureOption,
      Element,
    >({
      expectation,
      structure,
      subject,
    }: {
      expectation: Expectation<Registry, Element>
      structure: Structure
      subject: StructuredElement<Structure, Element> | unknown
    }) => ValidationResult<StructuredElement<Structure, Element>> | undefined

    export const curryGetCachedResult = <Registry extends BaseRegistry>(
      api: API<Registry>,
    ) => {
      return <Structure extends StructureOption, Element>({
        expectation,
        structure,
        subject,
      }: {
        expectation: Expectation<Registry, Element>
        structure: Structure
        subject: StructuredElement<Structure, Element> | unknown
      }):
        | ValidationResult<StructuredElement<Structure, Element>>
        | undefined => {
        if (isCacheable(subject)) {
          const cachedResult = (
            api.results as ExpectationResultCache<Registry, Element>
          )
            .get(expectation)
            ?.get(structure)
            ?.get(subject)

          return cachedResult as
            | ValidationResult<StructuredElement<Structure, Element>>
            | undefined
        }
      }
    }

    export type GetValidator<Registry extends BaseRegistry> = <
      Element,
      ExpectationArg extends Expectation<Registry, Element> | keyof Registry,
      Structure extends StructureOption = `item`,
    >(
      expectation: ExpectationArg,
      structure?: Structure,
    ) => Validator<
      ExpectationArg extends keyof Registry
        ? Registry[ExpectationArg]
        : Element,
      Structure
    >

    export const curryGetValidator = <Registry extends BaseRegistry>(
      api: API<Registry>,
    ): GetValidator<Registry> => {
      const getValidatorFn = <
        Element,
        ExpectationArg extends Expectation<Registry, Element> | keyof Registry,
        Structure extends StructureOption = `item`,
      >(
        expectation: ExpectationArg,
        structure?: Structure,
      ) => {
        return ensureReferencedValidator<
          Registry,
          StructuredElement<
            Structure,
            ExpectationArg extends keyof Registry
              ? Registry[ExpectationArg]
              : Element
          >,
          Structure
        >({
          api,
          container: api.reference(
            structure || (`item` as Structure),
            expectation as unknown as ReferenceTarget<
              Registry,
              StructuredElement<
                Structure,
                ExpectationArg extends keyof Registry
                  ? Registry[ExpectationArg]
                  : Element
              >
            >,
          ),
        })
      }

      return getValidatorFn as GetValidator<Registry>
    }

    export type BuildEqualityCheck<Registry extends BaseRegistry> = <
      Subject,
      Structure extends StructureOption,
    >(
      structure: Structure,
      target: Subject | Subject[],
    ) => ReferenceContainer<Registry, Subject, Structure>

    export const curryBuildEqualityCheck = <
      Registry extends BaseRegistry,
    >(): APIMethods.BuildEqualityCheck<Registry> => {
      return <Subject, Structure extends StructureOption>(
        structure: Structure,
        expectation: Subject | Subject[],
      ): ReferenceContainer<Registry, Subject, Structure> => {
        const equalityFunction: FunctionalExpectation<Subject> = (
          subject,
        ): subject is Subject => {
          const allowedValues = isArray(expectation)
            ? expectation
            : [expectation]

          return allowedValues.some((allowedValue) => {
            return subject === allowedValue
          })
        }

        return {
          [referenceToken]: {
            structure,
            target: equalityFunction as ReferenceTarget<Registry, Subject>,
          },
        }
      }
    }

    export type BuildReference<Registry extends BaseRegistry> = <
      Subject,
      Structure extends StructureOption,
    >(
      structure: Structure,
      target: Subject extends Registry[keyof Registry]
        ? keyof Registry
        : Expectation<Registry, Subject>,
    ) => ReferenceContainer<Registry, Subject, Structure>

    export const curryBuildReference = <
      Registry extends BaseRegistry,
    >(): APIMethods.BuildReference<Registry> => {
      return <Subject, Structure extends StructureOption>(
        structure: Structure,
        target: Subject extends Registry[keyof Registry]
          ? keyof Registry
          : Expectation<Registry, Subject>,
      ): ReferenceContainer<Registry, Subject, Structure> => {
        return {
          [referenceToken]: {
            structure,
            target,
          },
        }
      }
    }

    export type BuildRegistryEntry<Registry extends BaseRegistry> = <
      ModelId extends keyof Registry,
    >(args: {
      modelId: ModelId
      expect: Functions.BuildModelExpectation<Registry, ModelId>
    }) => RegistryEntry<Registry, ModelId>

    export const curryBuildRegistryEntry = <Registry extends BaseRegistry>(
      api: API<Registry>,
    ): APIMethods.BuildRegistryEntry<Registry> => {
      return <ModelId extends keyof Registry>({
        modelId,
        expect,
      }: {
        modelId: ModelId
        expect: Functions.BuildModelExpectation<Registry, ModelId>
      }): RegistryEntry<Registry, ModelId> => {
        const registryEntry: RegistryEntry<Registry, ModelId> = {
          modelId,

          expect,

          validators: () => {
            const expectation = registryEntry.expect()
            const cached = api.internalCache.validators.get(expectation) as
              | ReferenceValidators<Registry[ModelId]>
              | undefined

            if (cached) {
              return cached
            }

            const validators = buildReferenceValidators({
              api,
              expectation,
            })

            api.internalCache.validators.set(
              expectation,
              validators as ReferenceValidators<any>,
            )

            return validators
          },
        }

        return registryEntry
      }
    }

    export type GetModelRegistry<Registry extends BaseRegistry> = () => Map<
      keyof Registry,
      RegistryEntry<Registry, keyof Registry>
    >
  }

  // We cache both the validator and its results for each expectation.
  // This prevents us from settings up a lot of redundant validators,
  // and prevents us from validating the same subject multiple times.
  //
  // The caching relies on object identity in memory, so it assumes that
  // a given subject is immutable. If you want to validate something
  // again after changing it, you need to create a new version of it.
  //
  // Validators themselves only depend on the expectation that they are
  // built from, so they can be shared across the application.
  export type CacheableSubject = object

  export type ExpectationResultCache<
    Registry extends BaseRegistry,
    Element,
  > = Map<Expectation<Registry, Element>, StructuredResultCache<Element>>

  export type StructuredResultCache<Element> = Map<
    StructureOption,
    SubjectResultCache<StructureOption, Element>
  >

  export type SubjectResultCache<
    Structure extends StructureOption,
    Element,
  > = WeakMap<
    CacheableSubject,
    ValidationResult<StructuredElement<Structure, Element>>
  >

  // We use the WeakMap structure because it automatically cleans up
  // after itself when the subject is garbage collected. It stores the
  // results against the object's memory reference.
  //
  // We can't cache the results of validating primitive values, as they
  // don't have individual memory references and can be shared across
  // the application. WeakMap will throw an error if you try to use a
  // primitive value as a key.
  export const isCacheable = <Subject extends CacheableSubject>(
    subject: unknown,
  ): subject is Subject => {
    return typeof subject === `object` && subject !== null
  }

  export type StructureOption = `array` | `collection` | `item` | `mirror`

  export type StructuredElement<
    Structure extends StructureOption,
    Element,
  > = Structure extends `array`
    ? Element[]
    : Structure extends `collection`
      ? Collection<Element>
      : Structure extends `mirror`
        ? Mirror<Element>
        : Structure extends `item`
          ? Element
          : never

  // A Collection is an object where the keys are strings and not known
  // in advance, usually because they are IDs or other dynamic data.
  export type Collection<Element> = Record<string, Element> & {
    [referenceToken]?: never
  }

  // An Item is an object structure where the keys are known in advance,
  // usually because it represents a single record in the system.
  export type Item = Record<string, any> & {
    [referenceToken]?: never
  }

  // A Mirror is an object with two keys: 'array' and 'collection'.
  // The 'array' key has a readonly array of Elements.
  // The 'collection' key has a readonly Collection<Element>.
  //
  // Each Element is an Item of the same type.
  export type Mirror<Element> = {
    array: Readonly<Element[]>
    collection: Readonly<Collection<Element>>
    [referenceToken]?: never
  }

  // An Expectation is a single validation rule for the subject.
  // If the expectation is:
  // - An object with a special reserved key, we treat it as a Reference.
  // - An array, we treat it as a list of expectations.
  // - Any other object, we treat it as an inline record schema.
  // - A function, we treat it as a custom validation rule.
  // - A string, we treat it as a modelId or a typeof check.
  // - null, we treat the subject as nullable.
  // - undefined, we treat the subject as optional.
  export type Expectation<Registry extends BaseRegistry, Subject> =
    | keyof Registry
    | ExpectationArray<Registry, Subject>
    | ReferenceContainer<Registry, Subject, StructureOption>
    | RecordSchema<Registry, Subject>
    | PrimitiveExpectation<Subject>
    | FunctionalExpectation<Subject>

  export type ExpectationArray<Registry extends BaseRegistry, Subject> = (
    | Expectation<Registry, Subject>
    | null
    | undefined
  )[]

  export type ModelExpectation<
    Registry extends BaseRegistry,
    ModelId extends keyof Registry,
  > =
    | RecordSchema<Registry, Registry[ModelId]>
    | FunctionalExpectation<Registry[ModelId]>
    | ModelArray<Registry, ModelId>

  export type ModelArray<
    Registry extends BaseRegistry,
    ModelId extends keyof Registry,
  > = ModelExpectation<Registry, ModelId>[]

  export type FunctionalExpectation<Subject> = (
    subject: unknown,
  ) => subject is Subject

  export type PrimitiveExpectation<Subject> = Subject extends string
    ? `string`
    : Subject extends number
      ? `number`
      : Subject extends boolean
        ? `boolean`
        : Subject extends Date
          ? `date`
          : never

  export type Failure = {
    element: unknown
    expectation: Expectation<any, any>
    failures?: Failure[]
    key: string | number
    name: string
    reason: string | FailureReport[]
    subject: unknown
  }

  export type FailureReport = {
    expectation: Expectation<any, any>
    path: string
    reason: string
    value: unknown
  }

  interface SubjectKeys<Subject extends object> {
    [key: string | symbol | number]: Subject[keyof Subject]
  }

  export type RecordSchema<
    Registry extends BaseRegistry,
    Subject,
  > = Subject extends object
    ? Required<{
        [Key in keyof Subject]: Expectation<Registry, Subject[keyof Subject]>
      }>
    : never

  // This represents the string result of calling typeof on a value.
  export type typeofString = string

  // Every validator has the same external interface.
  export type Validator<Element, Structure extends StructureOption = `item`> = {
    getFailures: (subject: unknown, name: string) => Failure[]
    // If subject is not irrecoverably invalid, getSalvage returns a
    // filtered version that contains only its valid elements.
    // We cache the first result of attemptSalvage, which we perform
    // during the initial validate call.
    // Passing a new attemptSalvage function in subsequent calls will
    // not change the result.
    getSalvage: (
      subject: unknown,
      name: string,
      attemptSalvage?: Functions.AttemptSalvage<Structure>,
    ) => StructuredElement<Structure, Element> | undefined
    isValid: (
      subject: unknown,
      name: string,
    ) => subject is StructuredElement<Structure, Element>
    validate: (
      subject: unknown,
      name: string,
      // Supply this function if you want to manually salvage a subject that has failed validation.
      // By default, a salvaged subject contains only its valid elements.
      // Items and primitives are not salvageable by default.
      attemptSalvage?: Functions.AttemptSalvage<Structure>,
    ) => ValidationResult<StructuredElement<Structure, Element>>
  }

  export type ReferenceValidators<Element> = Record<
    StructureOption,
    Validator<Element, StructureOption>
  >

  export namespace Functions {
    export type AttemptSalvage<Structure extends StructureOption> = <
      Registry extends BaseRegistry,
      Element,
    >(args: {
      api: API<Registry>
      failures: Failure[]
      name: string
      subject: unknown
      validElements?: Structure extends `item`
        ? Partial<Element>
        : StructuredElement<Structure, Element>
    }) => StructuredElement<Structure, Element> | undefined

    export type PrepareModelRegistry<Registry extends BaseRegistry> =
      () => Record<
        keyof Registry,
        BuildModelExpectation<Registry, keyof Registry>
      >

    export type BuildModelExpectation<
      Registry extends BaseRegistry,
      ModelId extends keyof Registry,
    > = () => ModelExpectation<Registry, ModelId>

    export type Expect<
      Registry extends BaseRegistry,
      ModelId extends keyof Registry,
    > = (modelId: ModelId) => Expectation<Registry, Registry[ModelId]>

    export type IsValid<Subject> = (subject: unknown) => subject is Subject
  }
}

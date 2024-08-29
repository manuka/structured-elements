# Structured Elements

This is a TypeScript package for modelling and validating data.

## Installation

Via npm:

```
npm install structured-elements@latest --save
```

## Setup

Once installed, you'll need to set up a local API in your application. This is a file that you'll import throughout your application, so put it somewhere easy to reference like `lib/models.ts`.

An example API file:

```typescript
/*
  Application-specific API file for Structured Elements

  In this example, our application cares about two types: Person and Thing.

  Yours will probably have a lot more of them.
*/

/*
  We recommend that you keep your types and their models in other files throughout your
  application. You'll need to import them here so that you can add them to the registry.
*/
import { type Person, PersonModel } from "@/lib/person"
import { type Thing, ThingModel } from "@/lib/thing"

/*
  The Registry type lists all of the types that you want the library to know about.
  This allows Structured Elements to reason about your data using TypeScript.

    Key: A unique ModelId string that you'll use to reference the model.
    Value: The TypeScript type that the model corresponds to.

  List every type that you want to be able to validate data against.
  Person and Thing are just examples.
*/
export type Registry = {
  Person: Person
  Thing: Thing
}

/*
  This allows TypeScript to spot when your models don't match your types.
  You can use it as shown here and don't need to maintain it.
*/
export type Model<ModelId extends keyof Registry> =
  StructuredElements.Functions.BuildModelExpectation<Registry, ModelId>

/*
  This is the API object that allows your application to use Structured Elements.
  You can call it whatever you like. Modelling is just an example.

  The debugEnabled function lets you tell the package whether or not to log to the console.

  The models function returns a collection of all of your models as runtime data.
  This allows Structured Elements to validate your data against them.

    Key: A unique ModelId that matches the one in your Registry type.
    Value: The Model definition that will be used to validate your runtime data.

  You must list a model for every type in your application's Registry.
  Person and Thing are just examples.
*/
export const Modelling = StructuredElements.setup<Registry>({
  debugEnabled: () => {
    return process.env.NODE_ENV === `development`
  },
  models: () => {
    return {
      Person: PersonModel,
      Thing: ThingModel,
    }
  },
})
```

## Models

Models are data structures that allow Structured Elements to understand your types at runtime, which enables validation.

You don't need a model for every single type in your application, only the ones that you want to be able to validate.

You also don't need to define models for collection types; those are handled by Structures.

The standard approach is to put your model definitions in the same place as your TypeScript types.

Here are some examples using the Person and Thing types:

```typescript
// lib/person.ts

import { Modelling, type Model } from "@/lib/models"
import type { Thing } from "@lib/thing"

export type Person = {
  id: string
  inventory: Thing[]
  name: string
  roleId?: number
}

export const PersonModel: Model<"Person"> = {
  id: "string",
  inventory: Modelling.reference("array", "Thing"),
  name: "string",
  roleId: ["number", undefined],
}
```

Often our types have fields that can be one of a number of possible values. We represent this in our models using an inline array. The validation will succeed as long as the field matches at least one of the values in the array.

When our TypeScript types reference other non-primitive types, we can do the same in our models using the `reference` method on our API object. Note how the Person in our example contains an array of Thing objects.

```typescript
// lib/thing.ts

import { Modelling, type Model } from "@/lib/models"

export type Thing = {
  id: string
  name: string
  parts: Record<string, Thing>
  type: "gadget" | "widget"
  weight: number | null
}

export const ThingModel: Model<"Thing"> = {
  id: "string",
  name: "string",
  parts: Modelling.reference("collection", "Thing"),
  type: Modelling.equality("item", ["gadget" | "widget"]),
  weight: ["number", null],
}
```

Sometimes we want our data to match one or more specific values. To achieve this, we use the `equality` method on our API object. In the above example, our Thing has a `type` field that can be one of two specific string values: `"gadget"` or `"widget"`.

## Structures

Our applications need to handle data in a lot of different formats, such as individual records, arrays, or other kinds of collections. We represent this in our models using structures and references.

Structured Elements supports the following data structures by default:

### Item

Key: `'item'`
Type: `Element`

A single object where the keys are known in advance, usually because it represents a single record in the system.

### Array

Key: `'array'`
Type: `Element[]`

A sequential list of elements, each of the same type.

### Collection

Key: `'collection'`
Type: `Record<string, Element>`

An object where the keys are strings and not known in advance, usually because they are IDs or other dynamic data.

Each value in the collection is an element of the same type.

### Mirror

Key: `'mirror'`
Type: `Mirror<Element>`

An object with two keys: 'array' and 'collection'.

The 'array' key has a readonly array of elements.
The 'collection' key has a readonly collection of elements.

Each element in the mirror is of the same type. The array and collection contain the same elements, in the same order.

Mirrors are a useful way to express readonly data because we can interact with it as either an array or an object as needed.

Structured Elements exports the Mirror type directly so that you can use it throughout your application.

We can build a Mirror using the `Mirror.build` function. It accepts two arguments: `data` and `options`.

The `data` argument is the data that you want to store in the mirror. You can pass in either an array or a collection.

If you pass the data in as an array, you will need to pass an `extractKey` function as part of the options unless every item in the array has a string `id` field.

You can use the `options` argument to tweak the following aspects of the Mirror creation process:

#### Base

Key: `'base'`
Type: `Mirror<Element>`

By supplying this argument, you can build a mirror that has every element in the base mirror in addition to what you pass in as the `data`. This can be useful when you need to create a new version of a mirror with added or updated data, since each mirror is read only by nature.

If the base mirror and new data contain any of the same keys, the new mirror will source those elements from the data. It will not attempt to merge the individual elements in any way.

#### Extract Key

Key: `'extractKey'`
Type: `(record: Element) => Key`

When you build a new mirror from data in an array, the process needs to know what the collection will use as keys. By default, the key of each collection element will be the `id` of the element.

If your data's individual elements do not have an `id` field of type `string`, this option becomes mandatory.

#### Sort

Key: `'sort'`
Type: `(a: Element, b: Element) => number`

By default, the `array` and `collection` in a new mirror will be in the same order as the data you build it from.

This default sort order is not guaranteed if you also supply a base mirror to the `base` option. In that case, the new mirror will most likely contain all of the elements from the base mirror and then any new ones afterward.

When you need the data to be ordered in a specific way, you can pass a sort function. This behaves just like a compare function that you would pass when you call `.sort` on the data as an array, since it uses that same function under the hood.

Please note that this option slows the performance of the build process by a modest amount, although this is only noticeable with significantly large data sets.

## Expectations

In order to validate our data, Structured Elements needs to know how what we expect that data to be. We achieve this by building models full of expectations.

An expectation can be one of the following things:

### ModelId

A ModelId from the registry, represented as a string. For example, `'Person'` or `'Thing'`.

### ReferenceContainer

A special object that we create using the `references` method on our API. See the References section for more details.

### RecordSchema

An inline object that is effectively a single-use model definition that we don't have to add to the registry. These have the same format as our model definitions, except that we don't wrap them in a function.

These are commonly used to specify nested fields as part of an overall model definition. For example:

```typescript
import { type Model } from '@lib/models`

export type Fridge = {
  colours: {
    chassis: string
    doors: {
      bottom: string
      middle?: string
      top: string
    }
  }
  dimensions: {
    depth: number
    height: number
    width: number
  }
  id: string
  name: string
  price: number
}

export const FridgeModel: Model<'Fridge'> = () => {
  return {
    colours: {
      chassis: 'string',
      doors: {
        bottom: 'string',
        middle: ['string', undefined],
        top: 'string',
      },
    },
    dimensions: {
      depth: 'number',
      height: 'number',
      width: 'number',
    },
    id: 'string'
    name: 'string'
    price: 'number'
  }
}
```

### Primitive

A primitive type expectation, represented as a string. The supported values are `'string'`, `'number'`, `'boolean'`, and `'date'`.

If we specify a `'date'`, it will be validated by checking that it's an instance of `Date` and has a valid numeric value for `getTime()`.

Other primitive values are validated by calling `typeof` on the subject.

### Function

Sometimes our data follows specific rules that are difficult to represent as a group of typed fields. We can enforce this in our models by supplying a functional expectation:

```typescript
export type FunctionalExpectation<Subject> = (
  subject: unknown,
) => subject is Subject
```

For example, we might have a string field with specific requirements or a numeric field that is always a multiple of ten:

```typescript
// lib/label.ts

type Label = string

export const isValidLabel = (subject: unknown): subject is Label => {
  if (typeof subject !== "string") {
    return false
  }

  if (subject.length < 8 || subject.length > 32) {
    return false
  }

  if (subject === subject.toLowerCase() || subject === subject.toUpperCase()) {
    return false
  }

  return true
}
```

```typescript
import { isValidLabel, type Label } from "@lib/label"

type MultipleOfTen = number

export type ContrivedExample = {
  label: Label
  measurement: MultipleOfTen
}

export const ContrivedExampleModel: Model<"ContrivedExample"> = () => {
  return {
    label: isValidLabel,
    measurement: (subject): subject is MultipleOfTen => {
      if (typeof subject !== number) {
        return false
      }

      return subject % 10 === 0
    },
  }
}
```

### Equality

There are times when we want our data to match either a specific value, or one of a few specific values. We can do this using the `equality` function from our API object:

```typescript
import { Modelling, type Model } from '@lib/models`

export type Thing = {
  // other fields hidden for this example
  type: "gadget" | "widget"
}

export const ThingModel: Model<'Thing'> = () => {
  return {
    // other fields hidden for this example
    type: Modelling.equality("item", ["gadget" | "widget"]),
  }
}
```

This `equality` function takes the same two sequential arguments as the `reference` function: `structure` and `expectation`.

The `structure` argument must be one of the supportd structure options: `'item'`, `'array'`, `'collection'`, or `'mirror'`.

The `expectation` argument can be an allowed value or an array of allowed values. It will pass validation as long as the subject is equal to at least one of the allowed values, when compared using the `===` operator.

### Blank

Sometimes we want to specify undefined or null, usually in an array as one of the possibilities in an array of expectations.

We achieve this by using either `undefined` or `null` as expectations. Note that we specify them directly as values, not as strings.

### Expectation Array

Sometimes our data is allowed to take one of a number of possible forms. The most common example of this is when a field is optional, which means it can either be a specific type or a blank.

We represent this by supplying an inline array of expectations. The data will be considered valid as long it meets at least one of the expectations in the array.

Here's an example Plant model that uses arrays to specify some of its values:

```typescript
import { Modelling, type Model } from '@lib/models'
import { type HydroponicFluid } from '@lib/hydroponicFluid`
import { type Soil } from '@lib/soil`

export type Plant = {
  flowerColours?: Record<string, string>
  height: number
  preferredEnvironment: HydroponicFluid | Soil | null
}

export const PlantModel: Model<'Plant'> = () => {
  return {
    // We can represent the Record<string, string> type as a collection of strings.
    // Since this field is optional, we also need to expect that it could be undefined.
    // Note that we supply undefined as a value, not a string.
    flowerColours: [Modelling.reference('collection', 'string'), undefined],
    // Height can only be a number, so we don't need to use an array for this field.
    height: 'number',
    // This field has three possible types, so we supply an array of expectations.
    // While the field isn't optional, it's allowed to be null.
    // Note that we supply null as a value, not a string.
    preferredEnvironment: ['HydroponicFluid', 'Soil', null],
  }
}
```

## References

Data is often nested or inter-related in some way. TypeScript supports this by allowing us to use our types inside other type definitions, such as by having a Person contain an inventory of Thing records.

We represent this concept in our models using references. Under the hood, these are special `ReferenceContainer` objects recognised by Structured Elements using a reserved `_StructuredElementsReference` key and some metadata.

You can add a reference to a model definition by calling the `reference` function on your API object. The function takes two sequential arguments: `structure` and `target`.

The `structure` argument must be one of the available structure options: `'item'`, `'array'`, `'collection'`, or `'mirror'`.

The `target` argument can be either a ModelId from the registry or an inline expectation.

## Usage example: fetch and validate a list of people

In this example, our goal is to fetch a list of Person records from an API so that we can use it throughout the application.

Some of our code wants to interact with individual Person items, accessing them by key. Our user interface wants to be able to render them as a list. To enable both of those requirements in a performance-friendly manner, we'll store the data in a Mirror.

First, we'll need to define the Person type in our application and add it to the registry. Let's assume we've done that already using the code in the Models section of this readme.

Next, we'll need some code that makes a network call to our imaginary API and returns a response:

```typescript
// lib/person/api/fetch.ts
import type { Person } from '@lib/person'

export type PersonAPIFetchOptions = {
  // This is a stand-in for whatever options we might want to pass to the API call.
}

export type PersonFetchResponse = {
  data: Person[]
  metadata: {
    // whatever other stuff you get from your API responses
    error?: Error
  }
}

export const fetchPeopleFromAPI = async (
  options: PersonAPIFetchOptions
): Promise<PersonFetchResponse> => {
  try {
    const response = await fetch('/my_server_api/person', options)
    return response
  } catch(error) {
    // You could do all sorts of things here but let's just return an empty response.
    return {
      data: []
      metadata: {
        error
      }
    }
  }
}
```

Now we'll define another function that we can call to get a validated mirror of people:

```typescript
// lib/person/fetchMirror.ts

import { Mirror } from 'structured-elements'
import { Modelling } from '@lib/models`
import { fetchPeopleFromAPI, type PersonAPIFetchOptions } from '@lib/person/api/fetch`

export const fetchPeopleMirror = async (options: PersonAPIFetchOptions): Mirror<Person> => {
  const response = await fetchPeopleFromAPI(options)

  const people = Mirror.build(people)

  const validator = Modelling.validator('Person', 'mirror')

  const validationResult = validator.validate(response.data, 'PeopleFetchResponse')

  // If all of the Person items are valid, we can just return the subject.
  if (validationResult.valid) {
    return validationResult.subject
  }

  // By default, a Mirror validator attempts to salvage the subject Mirror
  // by discarding any invalid items from both the array and the collection.
  // This means that we can still display and work with the valid results
  // and trust that we won't have invalid data that might break our application.
  if (validationResult.salvage) {
    return validationRsult.salvage
  }

  // In theory we won't reach this part of the code, since the Mirror validator
  // is robust at salvaging broken data. That isn't true of every Validator,
  // so TypeScript will insist that we handle the potentially undefined result.
  return Mirror.build()
}
```

The end result of calling the `fetchPeopleMirror` function is always the same: a Mirror of valid Person records.

Because we're validating the incoming data here at the API boundary, the rest of our application can confidently rely on it. As long as we continue to use TypeScript effectively, this can prevent a great deal of potential errors.

What's more, since the validation process digs through the entire model structure, we can trust that each Person's inventory contains only valid Thing records.

## Caching and Performance

Most applications need to be fast, and validating data can be costly. Fortunately, Structured Elements has been designed from the ground up to do its job as quickly as possible.

Wherever possible, the system uses caching to avoid performing the same task more than once. This isn't just limited to validation, and includes the following features:

### Model Caching

During setup, we build the full registry of the application's models and cache it inside the API object. This prevents us from initialising any given model more than once.

### API Function Caching

Also during setup, we curry each API function with the registry and cache that curried function on the API object. This allows us to build the registry only once, and prevents you from having to pass it around.

### Validator Caching

The first time the application requests a validator for any given expectation, we build and cache the validators for each of that expectation's possible structures.

Subsequent validator calls for that expectation return the cached validator instead of creating a new one.

### Validation Result Caching

The API object maintains a WeakMap of validation results. The first time we validate a subject against any given expectation, the validator caches the result of the validation in that WeakMap. Subsequent calls to validate that same subject and expectation will return the cached result instead of repeating the validation process.

This even applies to nested fields across different validators. As long as the underlying subject and expectation are the same, the validator will return the cached result instead of repeating the process.

Validation results are cached using the subject's in-memory object identity. Instantiating two subjects with the same data will result in two different validation operations, while a given instantiation will only be validated once against any given expectation.

One of the features of an object-keyed WeakMap is that it automatically discards entries when they are garbage collected. This prevents us from keeping cached validation results beyond their useful lifetime.

### Dynamic Referencing

References between models are evaluated dynamically, which is why every model is defined as a function. This means that any model can depend on any other model in any order, although unbroken circular references can still cause issues.

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
  We recommend that you keep your types and their models in other files throughout your application.
  You'll need to import them here so that you can add them to the registry.
*/
import { type Person, PersonModel } from "@/lib/person"
import { type Thing, ThingModel } from "@/lib/thing"

/*
  The Registry type lists all of the types that you want the library to know about.
  This allows Structured Elements to reason about your data using TypeScript.

    Key: A unique ModelId string that you'll pass into various calls to reference the model.
    Value: The TypeScript type that the model corresponds to.

  List every type that you want to be able to validate data against. Person and Thing are just examples.
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

  The debugEnabled function lets you tell the package whether or not to output debug information.

  The models function returns a collection of all of your models as runtime data.
  This allows Structured Elements to validate your data against them.

    Key: A unique ModelId that matches the one in your Registry type.
    Value: The Model definition that will be used to validate your runtime data.

  You must list a model for every type in your application's Registry. Person and Thing are just examples.
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
  inventory: Thing[]
  name: string
  roleId?: number
}

export const PersonModel: Model<"Person"> = {
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

## Structures & References

Our applications need to handle data in a lot of different formats, such as individual records, arrays, or other kinds of collections. We represent this in our models using structures and references.

Structured Elements supports the following data structures by default:

### Item

A single object where the keys are known in advance, usually because it represents a single record in the system.

### Array

A sequential list of values, each of the same type.

### Collection

An object where the keys are strings and not known in advance, usually because they are IDs or other dynamic data.

### Mirror

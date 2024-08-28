import { type Person, PersonModel } from "./models/person"
import { type Thing, ThingModel } from "./models/thing"
import { StructuredElements } from "../src"

export namespace Test {
  export type Registry = {
    Person: Person
    Thing: Thing
  }

  export type RecordWithId = Record<string, unknown> & { id: string }

  export type Model<ModelId extends keyof Registry> =
    StructuredElements.Functions.BuildModelExpectation<Registry, ModelId>

  export const Modelling = StructuredElements.setup<Registry>({
    debugEnabled: () => {
      return true
    },
    models: () => {
      return {
        Person: PersonModel,
        Thing: ThingModel,
      }
    },
  })
}

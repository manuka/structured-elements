import { Test } from ".."
import type { Thing } from "../models/thing"

export type Person = {
  inventory: Thing[]
  name: string
  roleId?: number
}

export const PersonModel: Test.Model<"Person"> = () => {
  return {
    inventory: Test.Modelling.reference(`array`, `Thing`),
    name: `string`,
    roleId: [`number`, undefined],
  }
}

export const validPerson: Person = {
  inventory: [],
  name: `Valid Person`,
}

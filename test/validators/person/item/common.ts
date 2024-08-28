import type { StructuredElements } from "@"
import { Test } from "&"
import type { Person } from "&/models/person"
import { curryTestByInputType } from "&/scenarios/inputType"
import { curryTestByInventory } from "&/scenarios/person/inventory"
import type { NestedTest } from "test-nested-scenarios"

type TestArgs = {
  inventory: unknown
  name: unknown
  roleId?: unknown
}

type Expectation = ({
  subject,
  validator,
}: {
  subject: unknown
  validator: StructuredElements.Validator<Person, "item">
}) => void

export const curryValidatorPersonItemRunTest = ({
  expectation,
}: {
  expectation: Expectation
}): NestedTest.RunTestFunction<TestArgs> => {
  return (testArgs) => {
    const validator = Test.Modelling.validator(`Person`, `item`)

    expectation({ subject: testArgs, validator })
  }
}

export const validatorPersonItemScenarios: NestedTest.Scenario<TestArgs>[] = [
  curryTestByInventory(),
  curryTestByInputType({ arg: `name` }),
  curryTestByInputType({ arg: `roleId` }),
]

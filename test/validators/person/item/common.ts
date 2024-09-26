import type { StructuredElements } from "@"
import { Test } from "&"
import type { Person } from "&/models/person"
import { curryTestByInputType } from "&/scenarios/inputType"
import { curryTestByInventory } from "&/scenarios/person/inventory"
import type { NestedTest } from "test-nested-scenarios"

type TestArgs = {
  id: unknown
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

const curryRunTest = ({
  expectation,
}: {
  expectation: Expectation
}): NestedTest.RunTestFunction<TestArgs> => {
  return (testArgs) => {
    const validator = Test.Modelling.validator(`Person`, `item`)

    expectation({ subject: testArgs, validator })
  }
}

const expectedTestArgs = [`id`, `inventory`, `name`]

const optionalTestArgs = [`roleId`]

const scenarios: NestedTest.Scenario<TestArgs>[] = [
  curryTestByInventory(),
  curryTestByInputType({
    arg: `id`,
    defaultInputs: { string: `string`, undefined: undefined },
  }),
  curryTestByInputType({ arg: `name` }),
  curryTestByInputType({ arg: `roleId` }),
]

export const setupValidatorPersonItemTest = ({
  expectation,
}: {
  expectation: Expectation
}) => {
  return {
    runTest: curryRunTest({ expectation }),
    expectedTestArgs,
    optionalTestArgs,
    scenarios,
  }
}

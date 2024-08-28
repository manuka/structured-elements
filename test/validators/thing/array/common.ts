import type { StructuredElements } from "@"
import { Test } from "&"
import { buildTestArray } from "&/models/array"
import { type Thing, invalidThing, validThing } from "&/models/thing"
import { curryValidityTest } from "&/scenarios/validity"
import type { NestedTest } from "test-nested-scenarios"

type TestArgs = {
  thing0: unknown
  thing1: unknown
  thing2: unknown
}

type Expectation = ({
  subject,
  validator,
}: {
  subject: unknown
  validator: StructuredElements.Validator<Thing, "array">
}) => void

const curryRunTest = ({
  expectation,
}: {
  expectation: Expectation
}): NestedTest.RunTestFunction<TestArgs> => {
  return (testArgs) => {
    const { thing0, thing1, thing2 } = testArgs

    const subject = [thing0, thing1, thing2]

    const validator = Test.Modelling.validator(`Thing`, `array`)

    expectation({ subject, validator })
  }
}

const expectedTestArgs = [`thing0`, `thing1`, `thing2`]

const invalidInputs = buildTestArray({ base: invalidThing, length: 3 })
const validInputs = buildTestArray({ base: validThing, length: 3 })

const scenarios: NestedTest.Scenario<TestArgs>[] = [0, 1, 2].map((index) => {
  return curryValidityTest({
    arg: `thing${index}` as keyof TestArgs,
    invalid: invalidInputs[index],
    valid: validInputs[index],
  })
})

export const setupValidatorThingArrayTest = ({
  expectation,
}: {
  expectation: Expectation
}) => {
  return {
    runTest: curryRunTest({ expectation }),
    expectedTestArgs: expectedTestArgs,
    scenarios,
  }
}

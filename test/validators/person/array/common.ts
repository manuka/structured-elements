import type { StructuredElements } from "@"
import { Test } from "&"
import { buildTestArray } from "&/models/array"
import { type Person, invalidPerson, validPerson } from "&/models/person"
import { curryValidityTest } from "&/scenarios/validity"
import type { NestedTest } from "test-nested-scenarios"

type TestArgs = {
  person0: unknown
  person1: unknown
  person2: unknown
}

type Expectation = ({
  subject,
  validator,
}: {
  subject: unknown
  validator: StructuredElements.Validator<Person, "array">
}) => void

const curryRunTest = ({
  expectation,
}: {
  expectation: Expectation
}): NestedTest.RunTestFunction<TestArgs> => {
  return (testArgs) => {
    const { person0, person1, person2 } = testArgs

    const subject = [person0, person1, person2]

    const validator = Test.Modelling.validator(`Person`, `array`)

    expectation({ subject, validator })
  }
}

const expectedTestArgs = [`person0`, `person1`, `person2`]

const invalidInputs = buildTestArray({ base: invalidPerson, length: 3 })
const validInputs = buildTestArray({ base: validPerson, length: 3 })

const scenarios: NestedTest.Scenario<TestArgs>[] = [0, 1, 2].map((index) => {
  return curryValidityTest({
    arg: `person${index}` as keyof TestArgs,
    invalid: invalidInputs[index],
    valid: validInputs[index],
  })
})

export const setupValidatorPersonArrayTest = ({
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

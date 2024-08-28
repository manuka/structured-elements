import type { StructuredElements } from "@"
import { Test } from "&"
import { buildTestArray } from "&/models/array"
import { type Person, invalidPerson, validPerson } from "&/models/person"
import { curryValidityTest } from "&/scenarios/validity"
import type { NestedTest } from "test-nested-scenarios"

type TestArgs = {
  person0: Test.RecordWithId | undefined
  person1: Test.RecordWithId | undefined
  person2: Test.RecordWithId | undefined
}

type Expectation = ({
  subject,
  validator,
}: {
  subject: unknown
  validator: StructuredElements.Validator<Person, "collection">
}) => void

const curryRunTest = ({
  expectation,
}: {
  expectation: Expectation
}): NestedTest.RunTestFunction<TestArgs> => {
  return (testArgs) => {
    const { person0, person1, person2 } = testArgs

    const subject = [person0, person1, person2].reduce<
      Record<string, Test.RecordWithId | undefined>
    >((collection, person, index) => {
      if (person) {
        collection[person.id] = person
      } else {
        collection[`person${index}`] = person
      }
      return collection
    }, {})

    const validator = Test.Modelling.validator(`Person`, `collection`)

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

export const setupValidatorPersonCollectionTest = ({
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

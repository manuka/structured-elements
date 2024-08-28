import { type StructuredElements, Mirror } from "@"
import { Test } from "&"
import { buildTestArray } from "&/models/array"
import { type Person, invalidPerson, validPerson } from "&/models/person"
import type { RecordWithId } from "&/models/recordWithId"
import { curryValidityTest } from "&/scenarios/validity"
import type { NestedTest } from "test-nested-scenarios"

type TestArgs = {
  person0: RecordWithId | undefined
  person1: RecordWithId | undefined
  person2: RecordWithId | undefined
}

type Expectation = ({
  subject,
  validator,
}: {
  subject: unknown
  validator: StructuredElements.Validator<Person, "mirror">
}) => void

const curryRunTest = ({
  expectation,
}: {
  expectation: Expectation
}): NestedTest.RunTestFunction<TestArgs> => {
  return (testArgs) => {
    const { person0, person1, person2 } = testArgs

    const collection = [person0, person1, person2].reduce<
      Record<string, RecordWithId | undefined>
    >((collection, person, index) => {
      if (person) {
        collection[person.id] = person
      } else {
        collection[`person${index}`] = person
      }
      return collection
    }, {})

    const subject = Mirror.build(collection)

    const validator = Test.Modelling.validator(`Person`, `mirror`)

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

export const setupValidatorPersonMirrorTest = ({
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

import type { StructuredElements } from "@"
import { Test } from "&"
import type { Person } from "&/models/person"
import type { NestedTest } from "test-nested-scenarios"

type TestArgs = {
  inventory: unknown
  name: unknown
  roleId?: unknown
}

type Expect = ({
  person,
  validator,
}: {
  person: unknown
  validator: StructuredElements.Validator<Person, "item">
}) => void

export const curryValidatorPersonItemRunTest = ({
  expect,
}: {
  expect: Expect
}) => {
  const runTest: NestedTest.RunTestFunction<TestArgs> = (testArgs) => {
    const { inventory, name, roleId } = testArgs

    const person = {
      inventory,
      name,
      roleId,
    }

    const validator = Test.Modelling.validator(`Person`, `item`)

    expect({ person, validator })
  }

  return runTest
}

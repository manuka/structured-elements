import { Test } from "../.."
import { validThing } from "../../models/thing"
import { testByInputType } from "../../scenarios/inputType"

import type { NestedTest } from "test-nested-scenarios"
import { testNestedScenarios } from "test-nested-scenarios"

type TestArgs = {
  inventory: unknown
  name: unknown
  roleId?: unknown
}

describe(`Validator: Person, item;\n  `, () => {
  const runTest: NestedTest.RunTestFunction<TestArgs> = (testArgs) => {
    const { inventory, name, roleId } = testArgs

    const person = {
      inventory,
      name,
      roleId,
    }

    const validator = Test.Modelling.validator(`Person`, `item`)

    it(`validate`, () => {
      expect(validator.validate(person, `Person`)).toMatchSnapshot()
    })

    it(`isValid`, () => {
      expect(validator.isValid(person, `Person`)).toMatchSnapshot()
    })

    it(`getFailures`, () => {
      expect(validator.getFailures(person, `Person`)).toMatchSnapshot()
    })

    it(`getSalvage`, () => {
      expect(validator.getSalvage(person, `Person`)).toMatchSnapshot()
    })
  }

  const testByInventory: NestedTest.Scenario<TestArgs> = (addTest) => {
    describe(`inventory:`, () => {
      const invalidThing = {
        ...validThing,
        name: `Invalid Person`,
        roleId: `Not a number`,
      }

      testByInputType({
        addTest,
        arg: `inventory`,
        extraInputs: {
          "[]": [],
          "[(Valid Thing)]": [validThing],
          "[(Invalid Thing)]": [invalidThing],
          "[(Valid Thing), (Invalid Thing)]": [validThing, invalidThing],
        },
      })
    })
  }

  const testByName: NestedTest.Scenario<TestArgs> = (addTest) => {
    describe(`name:`, () => {
      testByInputType({
        addTest,
        arg: `name`,
      })
    })
  }

  const testByRoleId: NestedTest.Scenario<TestArgs> = (addTest) => {
    describe(`roleId:`, () => {
      testByInputType({
        addTest,
        arg: `roleId`,
      })
    })
  }

  testNestedScenarios({
    expectedTestArgs: [`inventory`, `name`],
    optionalTestArgs: [`roleId`],
    runTest,
    scenarios: [testByInventory, testByName, testByRoleId],
  })
})

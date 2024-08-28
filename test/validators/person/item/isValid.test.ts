import { curryTestByInputType } from "&/scenarios/inputType"
import { curryTestByInventory } from "&/scenarios/person/inventory"
import { curryValidatorPersonItemRunTest } from "&/validators/person/item/runTest"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'item').isValid(\n  {`, () => {
  testNestedScenarios({
    expectedTestArgs: [`inventory`, `name`],
    optionalTestArgs: [`roleId`],
    runTest: curryValidatorPersonItemRunTest({
      expect: ({ person, validator }) => {
        it(`},\n  'Person'\n)`, () => {
          expect(validator.isValid(person, `Person`)).toMatchSnapshot()
        })
      },
    }),
    scenarios: [
      curryTestByInventory(),
      curryTestByInputType({ arg: `name` }),
      curryTestByInputType({ arg: `roleId` }),
    ],
  })
})

import { curryTestByInputType } from "&/scenarios/inputType"
import { curryTestByInventory } from "&/scenarios/person/inventory"
import { curryValidatorPersonItemRunTest } from "&/validators/person/item/runTest"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'item').validate(\n  {`, () => {
  testNestedScenarios({
    expectedTestArgs: [`inventory`, `name`],
    optionalTestArgs: [`roleId`],
    runTest: curryValidatorPersonItemRunTest({
      expect: ({ person, validator }) => {
        it(`},\n  'Person'\n)`, () => {
          expect(validator.validate(person, `Person`)).toMatchSnapshot()
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

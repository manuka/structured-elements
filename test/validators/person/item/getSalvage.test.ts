import {
  curryValidatorPersonItemRunTest,
  validatorPersonItemScenarios,
} from "&/validators/person/item/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'item').getSalvage(\n  {`, () => {
  testNestedScenarios({
    expectedTestArgs: [`inventory`, `name`],
    optionalTestArgs: [`roleId`],
    runTest: curryValidatorPersonItemRunTest({
      expectation: ({ subject, validator }) => {
        it(`},\n  'Person'\n)`, () => {
          expect(validator.getSalvage(subject, `Person`)).toMatchSnapshot()
        })
      },
    }),
    scenarios: validatorPersonItemScenarios,
  })
})

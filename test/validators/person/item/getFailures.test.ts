import { validatorPersonItemScenarios } from "&/validators/person/item/common"
import { curryValidatorPersonItemRunTest } from "&/validators/person/item/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'item').getFailures(\n  {`, () => {
  testNestedScenarios({
    expectedTestArgs: [`inventory`, `name`],
    optionalTestArgs: [`roleId`],
    runTest: curryValidatorPersonItemRunTest({
      expectation: ({ subject, validator }) => {
        it(`},\n  'Person'\n)`, () => {
          expect(validator.getFailures(subject, `Person`)).toMatchSnapshot()
        })
      },
    }),
    scenarios: validatorPersonItemScenarios,
  })
})

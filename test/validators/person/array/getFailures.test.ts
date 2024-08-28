import { setupValidatorPersonArrayTest } from "&/validators/person/array/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'array').getFailures(\n  {`, () => {
  const setup = setupValidatorPersonArrayTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Person'\n)`, () => {
        expect(validator.getFailures(subject, `Person`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

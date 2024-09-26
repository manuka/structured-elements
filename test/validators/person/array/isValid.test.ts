import { setupValidatorPersonArrayTest } from "&/validators/person/array/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'array').isValid(\n  {`, () => {
  const setup = setupValidatorPersonArrayTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Person'\n)`, () => {
        expect(validator.isValid(subject, `Person`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

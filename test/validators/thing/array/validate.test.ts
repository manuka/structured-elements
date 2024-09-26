import { setupValidatorThingArrayTest } from "&/validators/thing/array/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Thing', 'array').validate(\n  {`, () => {
  const setup = setupValidatorThingArrayTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Thing'\n)`, () => {
        expect(validator.validate(subject, `Thing`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

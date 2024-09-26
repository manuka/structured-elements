import { setupValidatorThingArrayTest } from "&/validators/thing/array/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Thing', 'array').getSalvage(\n  {`, () => {
  const setup = setupValidatorThingArrayTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Thing'\n)`, () => {
        expect(validator.getSalvage(subject, `Thing`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

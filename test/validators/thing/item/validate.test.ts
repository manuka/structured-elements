import { setupValidatorThingItemTest } from "&/validators/thing/item/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Thing', 'item').validate(\n  {`, () => {
  const setup = setupValidatorThingItemTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Thing'\n)`, () => {
        expect(validator.validate(subject, `Thing`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

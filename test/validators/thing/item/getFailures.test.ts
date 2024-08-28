import { setupValidatorThingItemTest } from "&/validators/thing/item/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Thing', 'item').getFailures(\n  {`, () => {
  const setup = setupValidatorThingItemTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Thing'\n)`, () => {
        expect(validator.getFailures(subject, `Thing`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

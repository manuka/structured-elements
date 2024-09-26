import { setupValidatorThingCollectionTest } from "&/validators/thing/collection/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Thing', 'collection').isValid(\n  {`, () => {
  const setup = setupValidatorThingCollectionTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Thing'\n)`, () => {
        expect(validator.isValid(subject, `Thing`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

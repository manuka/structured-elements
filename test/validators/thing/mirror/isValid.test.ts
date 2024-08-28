import { setupValidatorThingMirrorTest } from "&/validators/thing/mirror/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Thing', 'mirror').isValid(\n  {`, () => {
  const setup = setupValidatorThingMirrorTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Thing'\n)`, () => {
        expect(validator.isValid(subject, `Thing`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

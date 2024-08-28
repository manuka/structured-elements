import { setupValidatorThingMirrorTest } from "&/validators/thing/mirror/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Thing', 'mirror').validate(\n  {`, () => {
  const setup = setupValidatorThingMirrorTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Thing'\n)`, () => {
        expect(validator.validate(subject, `Thing`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

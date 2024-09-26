import { setupValidatorThingMirrorTest } from "&/validators/thing/mirror/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Thing', 'mirror').getSalvage(\n  {`, () => {
  const setup = setupValidatorThingMirrorTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Thing'\n)`, () => {
        expect(validator.getSalvage(subject, `Thing`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

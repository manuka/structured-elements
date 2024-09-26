import { setupValidatorPersonMirrorTest } from "&/validators/person/mirror/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'mirror').getFailures(\n  {`, () => {
  const setup = setupValidatorPersonMirrorTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Person'\n)`, () => {
        expect(validator.getFailures(subject, `Person`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

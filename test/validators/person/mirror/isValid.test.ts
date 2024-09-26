import { setupValidatorPersonMirrorTest } from "&/validators/person/mirror/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'mirror').isValid(\n  {`, () => {
  const setup = setupValidatorPersonMirrorTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Person'\n)`, () => {
        expect(validator.isValid(subject, `Person`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

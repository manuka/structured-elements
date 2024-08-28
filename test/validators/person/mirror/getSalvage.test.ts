import { setupValidatorPersonMirrorTest } from "&/validators/person/mirror/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'mirror').getSalvage(\n  {`, () => {
  const setup = setupValidatorPersonMirrorTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Person'\n)`, () => {
        expect(validator.getSalvage(subject, `Person`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

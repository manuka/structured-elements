import { setupValidatorPersonArrayTest } from "&/validators/person/collection/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'collection').getSalvage(\n  {`, () => {
  const setup = setupValidatorPersonArrayTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Person'\n)`, () => {
        expect(validator.getSalvage(subject, `Person`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

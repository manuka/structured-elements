import { setupValidatorPersonCollectionTest } from "&/validators/person/collection/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'collection').isValid(\n  {`, () => {
  const setup = setupValidatorPersonCollectionTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Person'\n)`, () => {
        expect(validator.isValid(subject, `Person`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

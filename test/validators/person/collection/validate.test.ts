import { setupValidatorPersonCollectionTest } from "&/validators/person/collection/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'collection').validate(\n  {`, () => {
  const setup = setupValidatorPersonCollectionTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Person'\n)`, () => {
        expect(validator.validate(subject, `Person`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

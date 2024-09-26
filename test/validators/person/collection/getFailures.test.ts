import { setupValidatorPersonCollectionTest } from "&/validators/person/collection/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'collection').getFailures(\n  {`, () => {
  const setup = setupValidatorPersonCollectionTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Person'\n)`, () => {
        expect(validator.getFailures(subject, `Person`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

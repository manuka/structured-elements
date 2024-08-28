import { setupValidatorPersonItemTest } from "&/validators/person/item/common"
import { testNestedScenarios } from "test-nested-scenarios"

describe(`validator('Person', 'item').isValid(\n  {`, () => {
  const setup = setupValidatorPersonItemTest({
    expectation: ({ subject, validator }) => {
      it(`},\n  'Person'\n)`, () => {
        expect(validator.isValid(subject, `Person`)).toMatchSnapshot()
      })
    },
  })
  testNestedScenarios(setup)
})

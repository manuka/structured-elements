import type { ScenarioInputs } from "&/scenarios/assemble"
import { assembleScenario } from "&/scenarios/assemble"
import type { NestedTest } from "test-nested-scenarios"

export const curryBinaryValidityTest = <
  TestArgs,
  SubjectArg extends keyof TestArgs,
>({
  arg,
  extraInputs,
  invalid,
  valid,
}: {
  arg: SubjectArg
  extraInputs?: ScenarioInputs
  invalid: TestArgs[SubjectArg]
  valid: TestArgs[SubjectArg]
}) => {
  const inputs = {
    "(Invalid)": invalid,
    "(Valid)": valid,
    ...extraInputs,
  }

  return (addTest: NestedTest.AddTestFunction<TestArgs>) => {
    describe(`${String(arg)}:`, () => {
      assembleScenario({
        addTest,
        arg,
        inputs,
      })
    })
  }
}

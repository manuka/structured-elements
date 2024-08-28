import type { NestedTest } from "test-nested-scenarios"

const baseInputs = {
  array: [],
  date: new Date(0),
  null: null,
  number: 1,
  object: {},
  string: `string`,
  undefined: undefined,
}

export const curryTestByInputType = <
  TestArgs,
  SubjectArg extends keyof TestArgs,
>({
  arg,
  defaultInputs = baseInputs,
  extraInputs,
}: {
  arg: SubjectArg
  defaultInputs?: Record<string, unknown>
  extraInputs?: Record<string, unknown>
}) => {
  return (addTest: NestedTest.AddTestFunction<TestArgs>) => {
    describe(`${String(arg)}:`, () => {
      testByInputType({
        addTest,
        arg,
        defaultInputs,
        extraInputs,
      })
    })
  }
}

export const testByInputType = <TestArgs, SubjectArg extends keyof TestArgs>({
  addTest,
  arg,
  defaultInputs = baseInputs,
  extraInputs,
}: {
  addTest: NestedTest.AddTestFunction<TestArgs>
  arg: SubjectArg
  defaultInputs?: Record<string, unknown>
  extraInputs?: Record<string, unknown>
}) => {
  const inputs = {
    ...defaultInputs,
    ...extraInputs,
  }

  for (const description in inputs) {
    describe(`${description},`, () => {
      addTest({
        [arg]: inputs[description],
      } as unknown as Partial<TestArgs>)
    })
  }
}

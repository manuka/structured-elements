import { Test } from ".."

export type Thing = {
  id: string
  name: string
  parts: Record<string, Thing>
  type: "widget" | "gadget"
  weight: number | null
}

export const ThingModel: Test.Model<"Thing"> = () => {
  return {
    id: `string`,
    name: `string`,
    parts: Test.Modelling.reference(`collection`, `Thing`),
    type: Test.Modelling.equality(`item`, [`gadget`, `widget`]),
    weight: [`number`, null],
  }
}

export const validThing: Thing = {
  id: `1`,
  name: `Valid Thing`,
  parts: {},
  type: `gadget`,
  weight: 1,
}

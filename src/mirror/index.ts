import { buildMirror } from "@/mirror/build"
import { buildMirrorFromRecord } from "@/mirror/buildFromRecord"

/* This data structure is for storing multiple formats of the same data
   together, which allows us to work with it in the most useful format
   for a given operation.

   When changes occur, it's generally better to build a new version of
   the Mirror rather than try to edit the existing one.

   To help prevent this, we freeze each Mirror when we build it.
*/
export type Mirror<Element> = {
  array: Readonly<Element[]>
  collection: Readonly<Record<Mirror.Key, Element>>
}

export namespace Mirror {
  export const build = buildMirror

  export const buildFromRecord = buildMirrorFromRecord

  export type Collection<Element> = Record<Key, Element>

  export type FromRecord<Element, Transformations> = Omit<
    Element,
    keyof Transformations
  > & {
    [Key in keyof Transformations]: Transformations[Key]
  }

  export type Format<Element> = Collection<Element> | Element[]

  export type FormatId = `array` | `collection`

  export type Key = string

  export type Options<Element> = Element extends {
    id: string
  }
    ? {
        base?: Mirror<Element>
        extractKey?: Functions.ExtractKey<Element>
        sort?: Functions.SortElements<Element>
      }
    : {
        base?: Mirror<Element>
        extractKey: Functions.ExtractKey<Element>
        sort?: Functions.SortElements<Element>
      }

  export namespace Functions {
    export type ExtractKey<Element> = (record: Element) => Key

    export type SortElements<Element> = (a: Element, b: Element) => number
  }
}

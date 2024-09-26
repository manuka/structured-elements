import { isNumber } from "@/is/number"

export const isDate = (subject: unknown): subject is Date => {
  return subject instanceof Date && isNumber(subject.getTime())
}

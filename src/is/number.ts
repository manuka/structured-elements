export const isNumber = (subject: unknown): subject is number => {
  return typeof subject === `number` && !Number.isNaN(subject)
}

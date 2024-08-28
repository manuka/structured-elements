export const buildTestArray = ({
  base,
  length,
}: {
  base: Record<string, unknown>
  length: number
}) => {
  return Array.from({ length }, (_, index) => {
    return {
      ...base,
      id: `${base.id}-${index}`,
    }
  })
}

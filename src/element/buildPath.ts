export const buildElementPath = ({
  key,
  path,
}: {
  key: string | number
  path: string
}): string => {
  if (typeof key === `string`) {
    return `${path}.${key}`
  }

  return `${path}[${key}]`
}

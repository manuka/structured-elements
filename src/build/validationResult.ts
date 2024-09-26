import type { StructuredElements } from "@"

export const buildValidationResult = <Subject>({
  failures,
  salvage,
  subject,
}: {
  failures: StructuredElements.Failure[]
  salvage?: Subject
  subject: Subject | unknown
}): StructuredElements.ValidationResult<Subject> => {
  return {
    failures,
    salvage,
    subject: subject as Subject,
    valid: failures.length === 0,
  }
}

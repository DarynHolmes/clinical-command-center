import type { Protocol, Biomarker, ProtocolAmendment, ProtocolSection, ProtocolSectionField, AmendmentDiff } from '~/types/clinical'

/**
 * Computes cumulative diffs from baseline (v1.0) up to the target version.
 * If the same field is changed multiple times, uses the final value.
 */
export function computeCumulativeDiffs(
  amendments: ProtocolAmendment[],
  targetVersion: string
): AmendmentDiff[] {
  const cumulativeDiffs = new Map<string, AmendmentDiff>()

  // Sort amendments by version number (oldest first)
  // Handles versions like "v1.0", "v2.1", "v2.10"
  const sortedAmendments = [...amendments].sort((a, b) => {
    const parseVersion = (v: string): [number, number] => {
      const match = v.match(/v?(\d+)\.(\d+)/)
      if (!match || !match[1] || !match[2]) return [0, 0]
      return [parseInt(match[1], 10), parseInt(match[2], 10)]
    }
    const [aMajor, aMinor] = parseVersion(a.version)
    const [bMajor, bMinor] = parseVersion(b.version)
    if (aMajor !== bMajor) return aMajor - bMajor
    return aMinor - bMinor
  })

  for (const amendment of sortedAmendments) {
    // Accumulate diffs from this version
    for (const diff of amendment.diffs) {
      cumulativeDiffs.set(diff.field, diff)
    }

    // Stop after processing the target version
    if (amendment.version === targetVersion) {
      break
    }
  }

  return Array.from(cumulativeDiffs.values())
}

/**
 * Finds a diff that matches a biomarker by checking if the field name contains the biomarker name.
 */
function findDiffForBiomarker(diffs: AmendmentDiff[], biomarkerName: string): AmendmentDiff | undefined {
  const nameLower = biomarkerName.toLowerCase()
  return diffs.find((diff) => {
    const fieldLower = diff.field.toLowerCase()
    return fieldLower.includes(nameLower) || nameLower.includes(fieldLower)
  })
}

/**
 * Builds structured protocol sections with diff information mapped to fields.
 */
export function buildProtocolSections(
  protocol: Protocol,
  biomarkers: Biomarker[],
  diffs: AmendmentDiff[]
): ProtocolSection[] {
  const sections: ProtocolSection[] = []

  // Helper to find diff by field name (case-insensitive partial match)
  const findDiff = (fieldName: string) =>
    diffs.find(d => d.field.toLowerCase().includes(fieldName.toLowerCase()))

  // Protocol Overview Section
  sections.push({
    id: 'overview',
    title: 'Protocol Overview',
    fields: [
      {
        key: 'title',
        label: 'Title',
        value: protocol.title,
        diff: findDiff('title')
      },
      {
        key: 'phase',
        label: 'Phase',
        value: protocol.phase,
        diff: findDiff('phase')
      },
      {
        key: 'status',
        label: 'Status',
        value: protocol.status,
        diff: findDiff('status')
      },
      {
        key: 'therapeuticArea',
        label: 'Therapeutic Area',
        value: protocol.therapeuticArea ?? null,
        diff: findDiff('therapeutic')
      },
      {
        key: 'enrollmentTarget',
        label: 'Enrollment Target',
        value: protocol.enrollmentTarget ?? null,
        diff: findDiff('enrollment')
      }
    ]
  })

  // Group biomarkers by category
  const biomarkersByCategory: Record<string, Biomarker[]> = {}
  for (const biomarker of biomarkers) {
    if (!biomarkersByCategory[biomarker.category]) {
      biomarkersByCategory[biomarker.category] = []
    }
    biomarkersByCategory[biomarker.category]!.push(biomarker)
  }

  // Category display order and labels
  const categoryOrder: Array<{ key: string, label: string }> = [
    { key: 'safety', label: 'Safety Biomarkers' },
    { key: 'efficacy', label: 'Efficacy Biomarkers' },
    { key: 'exploratory', label: 'Exploratory Biomarkers' }
  ]

  for (const { key, label } of categoryOrder) {
    const categoryBiomarkers = biomarkersByCategory[key]
    if (!categoryBiomarkers?.length) continue

    const fields: ProtocolSectionField[] = categoryBiomarkers.map((biomarker) => {
      // Find diff that matches this biomarker's name
      const biomarkerDiff = findDiffForBiomarker(diffs, biomarker.name)

      return {
        key: biomarker.id,
        label: biomarker.name,
        value: biomarker.targetThreshold ?? null,
        unit: biomarker.unit,
        diff: biomarkerDiff
      }
    })

    sections.push({
      id: key,
      title: label,
      fields
    })
  }

  return sections
}

/**
 * Finds the index of a version in the amendments array.
 */
export function findVersionIndex(amendments: ProtocolAmendment[], version: string): number {
  return amendments.findIndex(a => a.version === version)
}

/**
 * Gets available versions for comparison from amendments.
 */
export function getVersionOptions(amendments: ProtocolAmendment[]): Array<{ label: string, value: string }> {
  return amendments.map(a => ({
    label: `${a.version} - ${a.summary.slice(0, 40)}${a.summary.length > 40 ? '...' : ''}`,
    value: a.version
  }))
}

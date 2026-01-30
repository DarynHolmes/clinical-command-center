import { describe, expect, it } from 'vitest'
import {
  computeCumulativeDiffs,
  findVersionIndex,
  getVersionOptions
} from '../../app/utils/protocolDiff'
import type { ProtocolAmendment, AmendmentDiff } from '../../app/types/clinical'

function createAmendment(
  version: string,
  diffs: AmendmentDiff[] = [],
  summary = 'Test amendment'
): ProtocolAmendment {
  return {
    id: `amend-${version}`,
    protocolId: 'proto-1',
    protocolTitle: 'Test Protocol',
    version,
    timestamp: new Date().toISOString(),
    author: 'Test Author',
    summary,
    diffs
  }
}

function createDiff(
  field: string,
  oldValue: string | number,
  newValue: string | number
): AmendmentDiff {
  return {
    field,
    oldValue,
    newValue,
    changeType: 'threshold_tightened'
  }
}

describe('protocolDiff utils', () => {
  describe('computeCumulativeDiffs', () => {
    it('parses simple version formats like v1.0, v2.1', () => {
      const amendments = [
        createAmendment('v2.0', [createDiff('fieldA', 10, 20)]),
        createAmendment('v1.0', [createDiff('fieldA', 0, 10)])
      ]

      const diffs = computeCumulativeDiffs(amendments, 'v2.0')
      expect(diffs).toHaveLength(1)
      expect(diffs[0]?.newValue).toBe(20)
    })

    it('handles multi-digit minor versions like v2.10', () => {
      const amendments = [
        createAmendment('v2.2', [createDiff('fieldA', 20, 22)]),
        createAmendment('v2.10', [createDiff('fieldA', 22, 30)]),
        createAmendment('v2.1', [createDiff('fieldA', 10, 20)])
      ]

      // v2.10 should sort after v2.2, not before
      const diffs = computeCumulativeDiffs(amendments, 'v2.10')
      expect(diffs).toHaveLength(1)
      expect(diffs[0]?.newValue).toBe(30)
    })

    it('sorts older versions first', () => {
      const amendments = [
        createAmendment('v3.0', [createDiff('fieldC', 30, 40)]),
        createAmendment('v1.0', [createDiff('fieldA', 0, 10)]),
        createAmendment('v2.0', [createDiff('fieldB', 20, 30)])
      ]

      // Processing up to v2.0 should include v1.0 and v2.0, but not v3.0
      const diffs = computeCumulativeDiffs(amendments, 'v2.0')
      const fields = diffs.map(d => d.field).sort()
      expect(fields).toEqual(['fieldA', 'fieldB'])
    })

    it('accumulates same field changed twice using final value', () => {
      const amendments = [
        createAmendment('v1.0', [createDiff('threshold', 100, 90)]),
        createAmendment('v2.0', [createDiff('threshold', 90, 80)]),
        createAmendment('v3.0', [createDiff('threshold', 80, 70)])
      ]

      const diffs = computeCumulativeDiffs(amendments, 'v3.0')
      expect(diffs).toHaveLength(1)
      expect(diffs[0]?.field).toBe('threshold')
      expect(diffs[0]?.newValue).toBe(70)
    })

    it('stops at target version', () => {
      const amendments = [
        createAmendment('v1.0', [createDiff('fieldA', 0, 10)]),
        createAmendment('v2.0', [createDiff('fieldB', 10, 20)]),
        createAmendment('v3.0', [createDiff('fieldC', 20, 30)])
      ]

      const diffs = computeCumulativeDiffs(amendments, 'v2.0')
      const fields = diffs.map(d => d.field)
      expect(fields).toContain('fieldA')
      expect(fields).toContain('fieldB')
      expect(fields).not.toContain('fieldC')
    })

    it('returns empty array for empty amendments', () => {
      const diffs = computeCumulativeDiffs([], 'v1.0')
      expect(diffs).toEqual([])
    })

    it('handles version without v prefix', () => {
      const amendments = [
        createAmendment('2.0', [createDiff('fieldA', 10, 20)]),
        createAmendment('1.0', [createDiff('fieldA', 0, 10)])
      ]

      const diffs = computeCumulativeDiffs(amendments, '2.0')
      expect(diffs).toHaveLength(1)
      expect(diffs[0]?.newValue).toBe(20)
    })
  })

  describe('findVersionIndex', () => {
    it('finds correct index by version string', () => {
      const amendments = [
        createAmendment('v1.0'),
        createAmendment('v2.0'),
        createAmendment('v3.0')
      ]

      expect(findVersionIndex(amendments, 'v1.0')).toBe(0)
      expect(findVersionIndex(amendments, 'v2.0')).toBe(1)
      expect(findVersionIndex(amendments, 'v3.0')).toBe(2)
    })

    it('returns -1 for non-existent version', () => {
      const amendments = [
        createAmendment('v1.0'),
        createAmendment('v2.0')
      ]

      expect(findVersionIndex(amendments, 'v5.0')).toBe(-1)
    })

    it('returns -1 for empty amendments', () => {
      expect(findVersionIndex([], 'v1.0')).toBe(-1)
    })
  })

  describe('getVersionOptions', () => {
    it('formats amendments with version and summary', () => {
      const amendments = [
        createAmendment('v1.0', [], 'Initial release')
      ]

      const options = getVersionOptions(amendments)
      expect(options).toHaveLength(1)
      expect(options[0]?.value).toBe('v1.0')
      expect(options[0]?.label).toContain('v1.0')
      expect(options[0]?.label).toContain('Initial release')
    })

    it('truncates long summaries at 40 characters', () => {
      const longSummary = 'This is a very long summary that exceeds forty characters'
      const amendments = [createAmendment('v1.0', [], longSummary)]

      const options = getVersionOptions(amendments)
      expect(options[0]?.label).toContain('...')
      expect(options[0]?.label.length).toBeLessThan(60) // version + dash + 40 chars + ...
    })

    it('does not truncate short summaries', () => {
      const shortSummary = 'Short summary'
      const amendments = [createAmendment('v1.0', [], shortSummary)]

      const options = getVersionOptions(amendments)
      expect(options[0]?.label).not.toContain('...')
      expect(options[0]?.label).toContain(shortSummary)
    })

    it('returns empty array for empty amendments', () => {
      const options = getVersionOptions([])
      expect(options).toEqual([])
    })

    it('preserves order of amendments', () => {
      const amendments = [
        createAmendment('v3.0', [], 'Third'),
        createAmendment('v1.0', [], 'First'),
        createAmendment('v2.0', [], 'Second')
      ]

      const options = getVersionOptions(amendments)
      expect(options[0]?.value).toBe('v3.0')
      expect(options[1]?.value).toBe('v1.0')
      expect(options[2]?.value).toBe('v2.0')
    })
  })
})

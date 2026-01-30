import { describe, expect, it } from 'vitest'
import { mapToTrend, mapToAmendment } from '../../app/services/mappers'
import type { BiomarkerRecord, AmendmentRecord } from '../../app/types/clinical'

function createBiomarkerRecord(overrides: Partial<BiomarkerRecord> = {}): BiomarkerRecord {
  return {
    id: 'bio-1',
    collectionId: 'biomarkers',
    collectionName: 'biomarkers',
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-01T00:00:00Z',
    name: 'Test Biomarker',
    protocol: 'proto-1',
    category: 'safety',
    data_type: 'numeric',
    baseline_value: 100,
    target_threshold: 80,
    frequency: 'weekly',
    current_value: 85,
    unit: 'mg/dL',
    trend_data: [100, 95, 90, 85],
    ...overrides
  }
}

function createAmendmentRecord(overrides: Partial<AmendmentRecord> = {}): AmendmentRecord {
  return {
    id: 'amend-1',
    collectionId: 'amendments',
    collectionName: 'amendments',
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-01T00:00:00Z',
    protocol: 'proto-1',
    version_tag: 'v1.0',
    change_description: 'Initial version',
    ...overrides
  }
}

describe('mappers', () => {
  describe('mapToTrend', () => {
    it('maps all fields correctly', () => {
      const record = createBiomarkerRecord()
      const trend = mapToTrend(record)

      expect(trend.id).toBe('bio-1')
      expect(trend.name).toBe('Test Biomarker')
      expect(trend.category).toBe('safety')
      expect(trend.currentValue).toBe(85)
      expect(trend.unit).toBe('mg/dL')
      expect(trend.data.values).toEqual([100, 95, 90, 85])
      expect(trend.data.threshold).toBe(80)
    })

    it('uses nullish coalescing for current_value (defaults to 0)', () => {
      const record = createBiomarkerRecord({ current_value: undefined })
      const trend = mapToTrend(record)
      expect(trend.currentValue).toBe(0)
    })

    it('preserves current_value of 0 (does not treat as falsy)', () => {
      const record = createBiomarkerRecord({ current_value: 0 })
      const trend = mapToTrend(record)
      expect(trend.currentValue).toBe(0)
    })

    it('uses nullish coalescing for trend_data (defaults to empty array)', () => {
      const record = createBiomarkerRecord({ trend_data: undefined })
      const trend = mapToTrend(record)
      expect(trend.data.values).toEqual([])
    })

    it('preserves empty trend_data array', () => {
      const record = createBiomarkerRecord({ trend_data: [] })
      const trend = mapToTrend(record)
      expect(trend.data.values).toEqual([])
    })

    it('handles missing optional fields', () => {
      const record = createBiomarkerRecord({
        unit: undefined,
        target_threshold: undefined
      })
      const trend = mapToTrend(record)
      expect(trend.unit).toBeUndefined()
      expect(trend.data.threshold).toBeUndefined()
    })
  })

  describe('mapToAmendment', () => {
    it('maps basic fields correctly', () => {
      const record = createAmendmentRecord()
      const amendment = mapToAmendment(record)

      expect(amendment.id).toBe('amend-1')
      expect(amendment.protocolId).toBe('proto-1')
      expect(amendment.version).toBe('v1.0')
      expect(amendment.summary).toBe('Initial version')
    })

    it('extracts protocol title from expand data', () => {
      const record = createAmendmentRecord({
        expand: {
          protocol: {
            id: 'proto-1',
            collectionId: 'protocols',
            collectionName: 'protocols',
            created: '2024-01-01T00:00:00Z',
            updated: '2024-01-01T00:00:00Z',
            title: 'Protocol Alpha',
            phase: 'II',
            status: 'active',
            version_id: 'v1'
          }
        }
      })
      const amendment = mapToAmendment(record)
      expect(amendment.protocolTitle).toBe('Protocol Alpha')
    })

    it('falls back to "Unknown Protocol" when expand.protocol is missing', () => {
      const record = createAmendmentRecord({ expand: undefined })
      const amendment = mapToAmendment(record)
      expect(amendment.protocolTitle).toBe('Unknown Protocol')
    })

    it('extracts author name from expand.user.name', () => {
      const record = createAmendmentRecord({
        expand: {
          user: { name: 'Dr. Smith', email: 'smith@example.com' }
        }
      })
      const amendment = mapToAmendment(record)
      expect(amendment.author).toBe('Dr. Smith')
    })

    it('falls back to email when name is missing', () => {
      const record = createAmendmentRecord({
        expand: {
          user: { email: 'smith@example.com' }
        }
      })
      const amendment = mapToAmendment(record)
      expect(amendment.author).toBe('smith@example.com')
    })

    it('falls back to "System" when user is missing', () => {
      const record = createAmendmentRecord({ expand: undefined })
      const amendment = mapToAmendment(record)
      expect(amendment.author).toBe('System')
    })

    it('uses created timestamp or falls back to current time', () => {
      const record = createAmendmentRecord({ created: '2024-06-15T10:30:00Z' })
      const amendment = mapToAmendment(record)
      expect(amendment.timestamp).toBe('2024-06-15T10:30:00Z')
    })

    it('extracts diffs from metadata', () => {
      const record = createAmendmentRecord({
        metadata: {
          diffs: [
            { field: 'threshold', oldValue: 100, newValue: 90, changeType: 'threshold_tightened' }
          ]
        }
      })
      const amendment = mapToAmendment(record)
      expect(amendment.diffs).toHaveLength(1)
      expect(amendment.diffs[0]?.field).toBe('threshold')
    })

    it('defaults to empty diffs array when metadata is missing', () => {
      const record = createAmendmentRecord({ metadata: undefined })
      const amendment = mapToAmendment(record)
      expect(amendment.diffs).toEqual([])
    })

    it('defaults to empty diffs array when metadata.diffs is missing', () => {
      const record = createAmendmentRecord({ metadata: {} })
      const amendment = mapToAmendment(record)
      expect(amendment.diffs).toEqual([])
    })
  })
})

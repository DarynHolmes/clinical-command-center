import { describe, expect, it } from 'vitest'
import {
  getChangeTypeStyle,
  isValueTransition,
  hasOldValue,
  hasNewValue
} from '../../app/utils/amendmentChange'
import type { AmendmentChangeType } from '../../app/types/dashboard'

describe('amendmentChange utils', () => {
  const allChangeTypes: AmendmentChangeType[] = [
    'threshold_tightened',
    'threshold_loosened',
    'criteria_expanded',
    'biomarker_added',
    'biomarker_removed'
  ]

  describe('getChangeTypeStyle', () => {
    it('returns correct styling for threshold_tightened', () => {
      const style = getChangeTypeStyle('threshold_tightened')
      expect(style.label).toBe('Tightened')
      expect(style.color).toBe('indigo')
      expect(style.bgClass).toContain('indigo')
      expect(style.textClass).toContain('indigo')
    })

    it('returns correct styling for threshold_loosened', () => {
      const style = getChangeTypeStyle('threshold_loosened')
      expect(style.label).toBe('Loosened')
      expect(style.color).toBe('slate')
      expect(style.bgClass).toContain('amber')
      expect(style.textClass).toContain('amber')
    })

    it('returns correct styling for criteria_expanded', () => {
      const style = getChangeTypeStyle('criteria_expanded')
      expect(style.label).toBe('Expanded')
      expect(style.color).toBe('neutral')
      expect(style.bgClass).toContain('slate')
      expect(style.textClass).toContain('slate')
    })

    it('returns correct styling for biomarker_added', () => {
      const style = getChangeTypeStyle('biomarker_added')
      expect(style.label).toBe('Added')
      expect(style.color).toBe('emerald')
      expect(style.bgClass).toContain('emerald')
      expect(style.textClass).toContain('emerald')
    })

    it('returns correct styling for biomarker_removed', () => {
      const style = getChangeTypeStyle('biomarker_removed')
      expect(style.label).toBe('Removed')
      expect(style.color).toBe('rose')
      expect(style.bgClass).toContain('rose')
      expect(style.textClass).toContain('rose')
    })

    it('returns valid structure for all change types', () => {
      for (const changeType of allChangeTypes) {
        const style = getChangeTypeStyle(changeType)
        expect(style).toHaveProperty('label')
        expect(style).toHaveProperty('bgClass')
        expect(style).toHaveProperty('textClass')
        expect(style).toHaveProperty('color')
      }
    })
  })

  describe('isValueTransition', () => {
    it('returns false for biomarker_added', () => {
      expect(isValueTransition('biomarker_added')).toBe(false)
    })

    it('returns false for biomarker_removed', () => {
      expect(isValueTransition('biomarker_removed')).toBe(false)
    })

    it('returns true for threshold_tightened', () => {
      expect(isValueTransition('threshold_tightened')).toBe(true)
    })

    it('returns true for threshold_loosened', () => {
      expect(isValueTransition('threshold_loosened')).toBe(true)
    })

    it('returns true for criteria_expanded', () => {
      expect(isValueTransition('criteria_expanded')).toBe(true)
    })
  })

  describe('hasOldValue', () => {
    it('returns false only for biomarker_added', () => {
      expect(hasOldValue('biomarker_added')).toBe(false)
    })

    it('returns true for biomarker_removed', () => {
      expect(hasOldValue('biomarker_removed')).toBe(true)
    })

    it('returns true for threshold changes', () => {
      expect(hasOldValue('threshold_tightened')).toBe(true)
      expect(hasOldValue('threshold_loosened')).toBe(true)
    })

    it('returns true for criteria_expanded', () => {
      expect(hasOldValue('criteria_expanded')).toBe(true)
    })
  })

  describe('hasNewValue', () => {
    it('returns false only for biomarker_removed', () => {
      expect(hasNewValue('biomarker_removed')).toBe(false)
    })

    it('returns true for biomarker_added', () => {
      expect(hasNewValue('biomarker_added')).toBe(true)
    })

    it('returns true for threshold changes', () => {
      expect(hasNewValue('threshold_tightened')).toBe(true)
      expect(hasNewValue('threshold_loosened')).toBe(true)
    })

    it('returns true for criteria_expanded', () => {
      expect(hasNewValue('criteria_expanded')).toBe(true)
    })
  })
})

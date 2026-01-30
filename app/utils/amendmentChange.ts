import type { AmendmentChangeType } from '~/types/dashboard'

export interface ChangeTypeStyle {
  label: string
  bgClass: string
  textClass: string
  /** Semantic color name for use with Nuxt UI components */
  color: 'primary' | 'slate' | 'indigo' | 'emerald' | 'rose' | 'neutral'
}

const CHANGE_TYPE_STYLES: Record<AmendmentChangeType, ChangeTypeStyle> = {
  threshold_tightened: {
    label: 'Tightened',
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/30',
    textClass: 'text-indigo-700 dark:text-indigo-300',
    color: 'indigo'
  },
  threshold_loosened: {
    label: 'Loosened',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-300',
    color: 'slate'
  },
  criteria_expanded: {
    label: 'Expanded',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    textClass: 'text-slate-700 dark:text-slate-300',
    color: 'neutral'
  },
  biomarker_added: {
    label: 'Added',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    color: 'emerald'
  },
  biomarker_removed: {
    label: 'Removed',
    bgClass: 'bg-rose-100 dark:bg-rose-900/30',
    textClass: 'text-rose-700 dark:text-rose-300',
    color: 'rose'
  }
}

/**
 * Returns the styling configuration for a given amendment change type.
 *
 * Color semantics:
 * - Tightened (Indigo): Criteria made more restrictive
 * - Loosened (Amber): Criteria made less restrictive
 * - Expanded (Slate): Criteria scope widened
 * - Added (Emerald): New biomarker introduced
 * - Removed (Rose): Biomarker discontinued
 */
export function getChangeTypeStyle(changeType: AmendmentChangeType): ChangeTypeStyle {
  return CHANGE_TYPE_STYLES[changeType]
}

/**
 * Determines if the change represents a value transition (old -> new arrow display)
 */
export function isValueTransition(changeType: AmendmentChangeType): boolean {
  return changeType !== 'biomarker_added' && changeType !== 'biomarker_removed'
}

/**
 * Determines if the change has an old value to display
 */
export function hasOldValue(changeType: AmendmentChangeType): boolean {
  return changeType !== 'biomarker_added'
}

/**
 * Determines if the change has a new value to display
 */
export function hasNewValue(changeType: AmendmentChangeType): boolean {
  return changeType !== 'biomarker_removed'
}

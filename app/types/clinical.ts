// PocketBase record types and domain types for clinical trial data

import type { RecordModel } from 'pocketbase'

// =============================================================================
// PocketBase Record Types (raw API responses)
// =============================================================================

export interface ProtocolRecord extends RecordModel {
  title: string
  phase: 'I' | 'II' | 'III' | 'IV'
  status: 'draft' | 'active' | 'amended' | 'archived'
  version_id: string
  parent_protocol?: string
  enrollment_target?: number
  therapeutic_area?: string
}

export interface BiomarkerRecord extends RecordModel {
  name: string
  protocol: string
  category: 'safety' | 'efficacy' | 'exploratory'
  data_type: 'numeric' | 'boolean' | 'categorical'
  baseline_value?: number
  target_threshold?: number
  frequency?: string
  current_value?: number
  unit?: string
  trend_data?: number[]
}

export interface AmendmentRecord extends RecordModel {
  protocol: string
  user?: string
  version_tag: string
  change_description: string
  metadata?: {
    diffs?: AmendmentDiff[]
  }
  expand?: {
    protocol?: ProtocolRecord
    user?: { name?: string, email?: string }
  }
}

// =============================================================================
// Domain Types (UI-friendly)
// =============================================================================

export interface Protocol {
  id: string
  title: string
  phase: 'I' | 'II' | 'III' | 'IV'
  status: 'draft' | 'active' | 'amended' | 'archived'
  versionId: string
  parentProtocol?: string
  enrollmentTarget?: number
  therapeuticArea?: string
  lastAmendedAt: string
}

export interface Biomarker {
  id: string
  protocolId: string
  name: string
  category: 'safety' | 'efficacy' | 'exploratory'
  dataType: 'numeric' | 'boolean' | 'categorical'
  baselineValue?: number
  targetThreshold?: number
  frequency?: string
  currentValue?: number
  unit?: string
  trendData?: number[]
}

export interface AmendmentDiff {
  field: string
  oldValue: string | number
  newValue: string | number
  changeType: 'threshold_tightened' | 'threshold_loosened' | 'criteria_expanded' | 'biomarker_added' | 'biomarker_removed'
}

export interface ProtocolAmendment {
  id: string
  protocolId: string
  protocolTitle: string
  version: string
  timestamp: string
  author: string
  summary: string
  diffs: AmendmentDiff[]
}

// =============================================================================
// Protocol Comparison Types
// =============================================================================

export interface ProtocolWithHistory {
  protocol: Protocol
  amendments: ProtocolAmendment[]
}

export interface ProtocolSection {
  id: string
  title: string
  fields: ProtocolSectionField[]
}

export interface ProtocolSectionField {
  key: string
  label: string
  value: string | number | null
  unit?: string
  diff?: AmendmentDiff
}

// Re-export dashboard types for convenience
export type { BiomarkerTrend, SparklineData, StatCardData } from './dashboard'

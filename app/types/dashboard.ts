// Dashboard type definitions for the Inverted Pyramid layout

export interface StatCardData {
  label: string
  value: string | number
  icon: string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
  }
}

export interface SparklineData {
  values: number[]
  threshold?: number
}

export interface BiomarkerTrend {
  id: string
  name: string
  category: 'safety' | 'efficacy' | 'exploratory'
  data: SparklineData
  currentValue: number
  unit?: string
}

export type AmendmentChangeType
  = | 'threshold_tightened'
    | 'threshold_loosened'
    | 'criteria_expanded'
    | 'biomarker_added'
    | 'biomarker_removed'

export interface AmendmentDiffItem {
  field: string
  oldValue: string | number
  newValue: string | number
  changeType: AmendmentChangeType
}

export interface ProtocolAmendment {
  id: string
  protocolId: string
  protocolTitle: string
  version: string
  timestamp: string
  author: string
  summary: string
  diffs: AmendmentDiffItem[]
}

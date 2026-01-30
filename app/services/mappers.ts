// Bridge pattern mappers: PocketBase records → Domain types
import type {
  ProtocolRecord,
  BiomarkerRecord,
  AmendmentRecord,
  Protocol,
  Biomarker,
  ProtocolAmendment
} from '~/types/clinical'
import type { BiomarkerTrend } from '~/types/dashboard'

export function mapToProtocol(record: ProtocolRecord): Protocol {
  return {
    id: record.id,
    title: record.title,
    phase: record.phase,
    status: record.status,
    versionId: record.version_id,
    parentProtocol: record.parent_protocol,
    enrollmentTarget: record.enrollment_target,
    therapeuticArea: record.therapeutic_area,
    lastAmendedAt: record.updated
  }
}

export function mapToBiomarker(record: BiomarkerRecord): Biomarker {
  return {
    id: record.id,
    protocolId: record.protocol,
    name: record.name,
    category: record.category,
    dataType: record.data_type,
    baselineValue: record.baseline_value,
    targetThreshold: record.target_threshold,
    frequency: record.frequency,
    currentValue: record.current_value,
    unit: record.unit,
    trendData: record.trend_data
  }
}

export function mapToTrend(record: BiomarkerRecord): BiomarkerTrend {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    currentValue: record.current_value ?? 0,
    unit: record.unit,
    data: {
      values: record.trend_data ?? [],
      threshold: record.target_threshold
    }
  }
}

export function mapToAmendment(record: AmendmentRecord): ProtocolAmendment {
  const protocol = record.expand?.protocol
  const user = record.expand?.user

  return {
    id: record.id,
    protocolId: record.protocol,
    protocolTitle: protocol?.title ?? 'Unknown Protocol',
    version: record.version_tag,
    timestamp: record.created || new Date().toISOString(),
    author: user?.name ?? user?.email ?? 'System',
    summary: record.change_description,
    diffs: record.metadata?.diffs ?? []
  }
}

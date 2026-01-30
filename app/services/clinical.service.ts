// Functional data layer for clinical trial data
import type { RecordSubscription } from 'pocketbase'
import { pb } from './pocketbase'
import { mapToProtocol, mapToBiomarker, mapToTrend, mapToAmendment } from './mappers'
import type { ProtocolRecord, BiomarkerRecord, AmendmentRecord, Protocol, Biomarker, ProtocolAmendment, ProtocolWithHistory } from '~/types/clinical'
import type { BiomarkerTrend } from '~/types/dashboard'

export const clinicalService = {
  // =========================================================================
  // Protocols
  // =========================================================================
  async getProtocols(): Promise<Protocol[]> {
    const records = await pb.collection('protocols').getFullList<ProtocolRecord>({
      sort: '-updated'
    })
    return records.map(mapToProtocol)
  },

  async getProtocol(id: string): Promise<Protocol> {
    const record = await pb.collection('protocols').getOne<ProtocolRecord>(id)
    return mapToProtocol(record)
  },

  async getProtocolWithHistory(id: string): Promise<ProtocolWithHistory> {
    const [protocolRecord, amendmentRecords] = await Promise.all([
      pb.collection('protocols').getOne<ProtocolRecord>(id),
      pb.collection('amendments').getFullList<AmendmentRecord>({
        filter: `protocol = "${id}"`,
        sort: 'created',
        expand: 'user'
      })
    ])

    return {
      protocol: mapToProtocol(protocolRecord),
      amendments: amendmentRecords.map(mapToAmendment)
    }
  },

  // =========================================================================
  // Biomarkers
  // =========================================================================
  async getBiomarkers(): Promise<Biomarker[]> {
    const records = await pb.collection('biomarkers').getFullList<BiomarkerRecord>({
      sort: 'name'
    })
    return records.map(mapToBiomarker)
  },

  async getBiomarkerTrends(): Promise<BiomarkerTrend[]> {
    const records = await pb.collection('biomarkers').getFullList<BiomarkerRecord>({
      sort: 'name'
    })
    return records.map(mapToTrend)
  },

  async getBiomarkersByProtocol(protocolId: string): Promise<Biomarker[]> {
    const records = await pb.collection('biomarkers').getFullList<BiomarkerRecord>({
      filter: `protocol = "${protocolId}"`,
      sort: 'name'
    })
    return records.map(mapToBiomarker)
  },

  // =========================================================================
  // Amendments
  // =========================================================================
  async getRecentAmendments(limit = 10): Promise<ProtocolAmendment[]> {
    const records = await pb.collection('amendments').getList<AmendmentRecord>(1, limit, {
      sort: '-created',
      expand: 'protocol,user'
    })
    return records.items.map(mapToAmendment)
  },

  // =========================================================================
  // Real-time Subscriptions
  // =========================================================================
  subscribeToBiomarkers(callback: (trend: BiomarkerTrend) => void): () => void {
    pb.collection('biomarkers').subscribe<BiomarkerRecord>('*', (e: RecordSubscription<BiomarkerRecord>) => {
      if (e.action === 'update' || e.action === 'create') {
        callback(mapToTrend(e.record))
      }
    })

    return () => {
      pb.collection('biomarkers').unsubscribe('*')
    }
  },

  subscribeToAmendments(callback: (amendment: ProtocolAmendment, action: string) => void): () => void {
    pb.collection('amendments').subscribe<AmendmentRecord>('*', async (e: RecordSubscription<AmendmentRecord>) => {
      if (e.action === 'create' || e.action === 'update') {
        // Fetch with expand to get full data
        const record = await pb.collection('amendments').getOne<AmendmentRecord>(e.record.id, {
          expand: 'protocol,user'
        })
        callback(mapToAmendment(record), e.action)
      }
    })

    return () => {
      pb.collection('amendments').unsubscribe('*')
    }
  },

  subscribeToProtocolAmendments(
    protocolId: string,
    callback: (amendment: ProtocolAmendment, action: string) => void
  ): () => void {
    const subscriptionId = `protocol_${protocolId}`

    pb.collection('amendments').subscribe<AmendmentRecord>('*', async (e: RecordSubscription<AmendmentRecord>) => {
      // Only process amendments for this specific protocol
      if (e.record.protocol !== protocolId) return

      if (e.action === 'create' || e.action === 'update') {
        const record = await pb.collection('amendments').getOne<AmendmentRecord>(e.record.id, {
          expand: 'protocol,user'
        })
        callback(mapToAmendment(record), e.action)
      }
    })

    return () => {
      pb.collection('amendments').unsubscribe(subscriptionId)
    }
  }
}

// PocketBase seed script
// Run with: npx tsx --env-file=.env scripts/seed-pocketbase.ts

import PocketBase from 'pocketbase'

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090'
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error('Error: PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables are required')
  console.error('Create a .env file or set them directly:')
  console.error('  PB_ADMIN_EMAIL=your@email.com PB_ADMIN_PASSWORD=yourpass npx tsx scripts/seed-pocketbase.ts')
  process.exit(1)
}

const pb = new PocketBase(PB_URL)

async function seed() {
  // Authenticate as admin
  await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD)
  console.log('Authenticated as admin')

  // Check if collections exist
  const collections = await pb.collections.getFullList()
  const collectionNames = collections.map(c => c.name)
  console.log('Existing collections:', collectionNames)

  // Create protocols collection if it doesn't exist
  if (!collectionNames.includes('protocols')) {
    console.log('Creating protocols collection...')
    try {
      await pb.collections.create({
        name: 'protocols',
        type: 'base',
        fields: [
          { name: 'title', type: 'text', required: true, presentable: true },
          { name: 'phase', type: 'select', required: true, values: ['I', 'II', 'III', 'IV'], maxSelect: 1 },
          { name: 'status', type: 'select', required: true, values: ['draft', 'active', 'amended', 'archived'], maxSelect: 1 },
          { name: 'version_id', type: 'text', required: true },
          { name: 'enrollment_target', type: 'number', required: false },
          { name: 'therapeutic_area', type: 'text', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }
        ],
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""'
      })
      console.log('Created protocols collection')
    } catch (err: unknown) {
      console.error('Failed to create protocols collection:', JSON.stringify((err as { response?: unknown }).response, null, 2))
      throw err
    }
  }

  // Create biomarkers collection if it doesn't exist
  if (!collectionNames.includes('biomarkers')) {
    // Get protocols collection ID for relation
    const protocolsCollection = await pb.collections.getOne('protocols')

    console.log('Creating biomarkers collection...')
    try {
      await pb.collections.create({
        name: 'biomarkers',
        type: 'base',
        fields: [
          { name: 'name', type: 'text', required: true, presentable: true },
          { name: 'protocol', type: 'relation', required: true, collectionId: protocolsCollection.id, maxSelect: 1 },
          { name: 'category', type: 'select', required: true, values: ['safety', 'efficacy', 'exploratory'], maxSelect: 1 },
          { name: 'data_type', type: 'select', required: true, values: ['numeric', 'boolean', 'categorical'], maxSelect: 1 },
          { name: 'baseline_value', type: 'number', required: false },
          { name: 'target_threshold', type: 'number', required: false },
          { name: 'frequency', type: 'text', required: false },
          { name: 'current_value', type: 'number', required: false },
          { name: 'unit', type: 'text', required: false },
          { name: 'trend_data', type: 'json', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }
        ],
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""'
      })
      console.log('Created biomarkers collection')
    } catch (err: unknown) {
      console.error('Failed to create biomarkers collection:', JSON.stringify((err as { response?: unknown }).response, null, 2))
      throw err
    }
  }

  // Create amendments collection if it doesn't exist
  if (!collectionNames.includes('amendments')) {
    const protocolsCollection = await pb.collections.getOne('protocols')

    console.log('Creating amendments collection...')
    try {
      await pb.collections.create({
        name: 'amendments',
        type: 'base',
        fields: [
          { name: 'protocol', type: 'relation', required: true, collectionId: protocolsCollection.id, maxSelect: 1 },
          { name: 'user', type: 'relation', required: false, collectionId: '_pb_users_auth_', maxSelect: 1 },
          { name: 'version_tag', type: 'text', required: true },
          { name: 'change_description', type: 'text', required: true },
          { name: 'metadata', type: 'json', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }
        ],
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""'
      })
      console.log('Created amendments collection')
    } catch (err: unknown) {
      console.error('Failed to create amendments collection:', JSON.stringify((err as { response?: unknown }).response, null, 2))
      throw err
    }
  }

  // Seed demo data
  console.log('\nSeeding demo data...')

  // Create protocols
  const protocols = await pb.collection('protocols').getFullList()
  if (protocols.length === 0) {
    console.log('Creating protocols...')
    const beacon = await pb.collection('protocols').create({
      title: 'BEACON-2 Phase III',
      phase: 'III',
      status: 'active',
      version_id: 'v2.3',
      enrollment_target: 500,
      therapeutic_area: 'Oncology'
    })

    const nova = await pb.collection('protocols').create({
      title: 'NOVA-1 Phase II',
      phase: 'II',
      status: 'active',
      version_id: 'v1.4',
      enrollment_target: 200,
      therapeutic_area: 'Immunology'
    })

    const clarity = await pb.collection('protocols').create({
      title: 'CLARITY Phase I',
      phase: 'I',
      status: 'draft',
      version_id: 'v1.1',
      enrollment_target: 50,
      therapeutic_area: 'Cardiology'
    })

    console.log('Created 3 protocols')

    // Create biomarkers for BEACON-2
    console.log('Creating biomarkers...')
    const biomarkerData = [
      { name: 'HER2', category: 'efficacy', data_type: 'numeric', current_value: 2.8, unit: 'ng/mL', target_threshold: 2.5, trend_data: [2.1, 2.3, 2.4, 2.2, 2.5, 2.7, 2.6, 2.8], protocol: beacon.id },
      { name: 'HbA1c', category: 'safety', data_type: 'numeric', current_value: 6.4, unit: '%', target_threshold: 7.0, trend_data: [7.2, 7.0, 6.8, 6.9, 6.6, 6.5, 6.4, 6.4], protocol: beacon.id },
      { name: 'CD4+', category: 'efficacy', data_type: 'numeric', current_value: 842, unit: 'cells/µL', target_threshold: 500, trend_data: [650, 680, 720, 710, 760, 800, 820, 842], protocol: nova.id },
      { name: 'ALT', category: 'safety', data_type: 'numeric', current_value: 32, unit: 'U/L', target_threshold: 40, trend_data: [28, 30, 29, 31, 33, 32, 31, 32], protocol: beacon.id },
      { name: 'CRP', category: 'exploratory', data_type: 'numeric', current_value: 1.8, unit: 'mg/L', target_threshold: 3.0, trend_data: [3.2, 2.8, 2.5, 2.3, 2.1, 2.0, 1.9, 1.8], protocol: nova.id },
      { name: 'TNF-α', category: 'efficacy', data_type: 'numeric', current_value: 12.4, unit: 'pg/mL', target_threshold: 15.0, trend_data: [18.2, 16.5, 15.8, 14.2, 13.8, 13.1, 12.8, 12.4], protocol: nova.id },
      { name: 'Creatinine', category: 'safety', data_type: 'numeric', current_value: 0.92, unit: 'mg/dL', target_threshold: 1.2, trend_data: [0.88, 0.90, 0.89, 0.91, 0.90, 0.92, 0.91, 0.92], protocol: clarity.id },
      { name: 'IL-6', category: 'exploratory', data_type: 'numeric', current_value: 4.2, unit: 'pg/mL', target_threshold: 5.0, trend_data: [6.8, 6.2, 5.8, 5.4, 5.0, 4.6, 4.4, 4.2], protocol: nova.id }
    ]

    for (const biomarker of biomarkerData) {
      await pb.collection('biomarkers').create(biomarker)
    }
    console.log('Created 8 biomarkers')

    // Create amendments
    console.log('Creating amendments...')
    const amendmentData = [
      {
        protocol: beacon.id,
        version_tag: 'v2.3',
        change_description: 'Adjusted HER2 threshold based on interim analysis',
        metadata: {
          diffs: [{ field: 'HER2 threshold', oldValue: '3.0 ng/mL', newValue: '2.5 ng/mL', changeType: 'threshold_tightened' }]
        }
      },
      {
        protocol: nova.id,
        version_tag: 'v1.4',
        change_description: 'Added exploratory biomarker for immune response monitoring',
        metadata: {
          diffs: [{ field: 'IL-17A', oldValue: '', newValue: 'Exploratory, monthly', changeType: 'biomarker_added' }]
        }
      },
      {
        protocol: beacon.id,
        version_tag: 'v2.2',
        change_description: 'Expanded inclusion criteria for wider patient population',
        metadata: {
          diffs: [
            { field: 'Age range', oldValue: '18-65', newValue: '18-75', changeType: 'criteria_expanded' },
            { field: 'HbA1c upper limit', oldValue: '6.5%', newValue: '7.0%', changeType: 'threshold_loosened' }
          ]
        }
      },
      {
        protocol: clarity.id,
        version_tag: 'v1.1',
        change_description: 'Removed redundant safety marker from protocol',
        metadata: {
          diffs: [{ field: 'BNP', oldValue: 'Safety, weekly', newValue: '', changeType: 'biomarker_removed' }]
        }
      }
    ]

    for (const amendment of amendmentData) {
      await pb.collection('amendments').create(amendment)
    }
    console.log('Created 4 amendments')
  } else {
    console.log('Data already exists, skipping seed')
  }

  console.log('\nSeed complete!')
}

seed().catch(console.error)

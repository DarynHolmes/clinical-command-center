// Fix missing autodate fields in PocketBase collections
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

interface Field {
  name: string
  type: string
  [key: string]: unknown
}

async function fixCollections() {
  await pb.collection('_superusers').authWithPassword('darynholmes@gmail.com', 'admin@2026')
  console.log('Authenticated')

  const collections = ['protocols', 'biomarkers', 'amendments']

  for (const collName of collections) {
    const coll = await pb.collections.getOne(collName)
    const existingFields = (coll.fields || []) as Field[]

    const hasCreated = existingFields.some(f => f.name === 'created')

    if (hasCreated) {
      console.log(`${collName} already has autodate fields`)
      continue
    }

    console.log(`Adding autodate fields to ${collName}...`)
    await pb.collections.update(collName, {
      fields: [
        ...existingFields,
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }
      ]
    })
    console.log(`Added autodate fields to ${collName}`)
  }

  console.log('Done!')
}

fixCollections().catch(console.error)

/// <reference path="../pb_data/types.d.ts" />

// Demo simulation endpoint for heartbeat-driven biomarker updates
routerAdd('POST', '/api/demo/pulse', (e) => {
  // All constants must be inside the handler due to PocketBase's hook scoping
  const COOLDOWN_MS = 8000 // 8-second cooldown between pulses
  const STORE_KEY = 'demo_last_pulse_time'

  const BIOMARKER_PROFILES = {
    'ALT': { volatility: 2.0, min: 15, max: 70, spikeChance: 0.08 },
    'AST': { volatility: 1.8, min: 15, max: 55, spikeChance: 0.06 },
    'Creatinine': { volatility: 0.15, min: 0.6, max: 1.8, spikeChance: 0.05 },
    'Hemoglobin': { volatility: 0.3, min: 12, max: 17, spikeChance: 0.04 },
    'WBC': { volatility: 0.5, min: 4, max: 11, spikeChance: 0.04 },
    'Platelets': { volatility: 15, min: 150, max: 400, spikeChance: 0.03 },
    'Glucose': { volatility: 5, min: 70, max: 140, spikeChance: 0.05 },
    'BUN': { volatility: 2, min: 7, max: 25, spikeChance: 0.04 },
    'CD4': { volatility: 25, min: 500, max: 1200, spikeChance: 0.04 },
    'HER2': { volatility: 0.2, min: 1.5, max: 4.0, spikeChance: 0.06 },
    'HbA1c': { volatility: 0.15, min: 5.5, max: 8.0, spikeChance: 0.05 },
    'CRP': { volatility: 0.3, min: 0.5, max: 5.0, spikeChance: 0.06 },
    'TNF': { volatility: 1.5, min: 8, max: 25, spikeChance: 0.05 },
    'IL-6': { volatility: 0.5, min: 2, max: 10, spikeChance: 0.05 }
  }

  const DEFAULT_PROFILE = { volatility: 1.0, min: 0, max: 100, spikeChance: 0.03 }

  function getProfile(biomarkerName) {
    for (const key in BIOMARKER_PROFILES) {
      if (biomarkerName.toUpperCase().indexOf(key.toUpperCase()) !== -1) {
        return BIOMARKER_PROFILES[key]
      }
    }
    return DEFAULT_PROFILE
  }

  function simulateValue(currentValue, baseline, threshold, profile) {
    const shouldSpike = Math.random() < profile.spikeChance && threshold != null

    let newValue
    if (shouldSpike) {
      const moveRatio = 0.7 + Math.random() * 0.2
      newValue = currentValue + (threshold - currentValue) * moveRatio
    } else {
      const meanTarget = baseline || ((profile.min + profile.max) / 2)
      const reversionStrength = 0.1
      const randomChange = (Math.random() - 0.5) * 2 * profile.volatility
      const reversion = (meanTarget - currentValue) * reversionStrength
      newValue = currentValue + reversion + randomChange
    }

    newValue = Math.max(profile.min, Math.min(profile.max, newValue))

    if (profile.volatility < 1) {
      newValue = Math.round(newValue * 100) / 100
    } else {
      newValue = Math.round(newValue * 10) / 10
    }

    return newValue
  }

  // Main logic
  const now = Date.now()
  let lastPulseTime = $app.store().get(STORE_KEY) || 0

  if (now - lastPulseTime < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - (now - lastPulseTime)) / 1000)
    return e.json(200, {
      status: 'debounced',
      message: 'Cooldown active, ' + remaining + 's remaining',
      updated: 0
    })
  }

  $app.store().set(STORE_KEY, now)

  try {
    const biomarkers = $app.findAllRecords('biomarkers')

    if (biomarkers.length === 0) {
      return e.json(200, {
        status: 'ok',
        message: 'No biomarkers found',
        updated: 0
      })
    }

    const numToUpdate = Math.min(biomarkers.length, 1 + Math.floor(Math.random() * 3))
    const shuffled = biomarkers.sort(function() { return Math.random() - 0.5 })
    const toUpdate = shuffled.slice(0, numToUpdate)

    const updatedNames = []

    for (let i = 0; i < toUpdate.length; i++) {
      const biomarker = toUpdate[i]
      const name = biomarker.getString('name')
      const profile = getProfile(name)

      let currentValue = biomarker.getFloat('current_value')
      const baseline = biomarker.getFloat('baseline_value')
      const threshold = biomarker.getFloat('target_threshold')
      // Get trend data - use getString to get raw JSON, avoiding Goja proxy issues
      // PocketBase's Goja runtime returns a Go slice proxy that corrupts on JSON.stringify()
      let trendData = []
      try {
        const rawJson = biomarker.getString('trend_data')
        if (rawJson) {
          const parsed = JSON.parse(rawJson)
          if (Array.isArray(parsed)) {
            for (let j = 0; j < parsed.length; j++) {
              const v = parsed[j]
              if (typeof v === 'number' && isFinite(v)) {
                trendData.push(v)
              }
            }
          }
        }
      } catch (err) {
        trendData = []
      }

      if (currentValue === 0 || currentValue == null) {
        currentValue = baseline || ((profile.min + profile.max) / 2)
      }

      const newValue = simulateValue(currentValue, baseline, threshold, profile)

      trendData.push(newValue)

      // Keep only last 20 values - use explicit array copy for Goja compatibility
      if (trendData.length > 20) {
        const trimmed = []
        const start = trendData.length - 20
        for (let k = start; k < trendData.length; k++) {
          trimmed.push(trendData[k])
        }
        trendData = trimmed
      }

      biomarker.set('current_value', newValue)
      // Must stringify for PocketBase JSON field - Goja array serialization is buggy
      biomarker.set('trend_data', JSON.stringify(trendData))

      $app.save(biomarker)

      updatedNames.push(name)
    }

    return e.json(200, {
      status: 'ok',
      message: 'Updated ' + updatedNames.length + ' biomarker(s)',
      updated: updatedNames.length,
      biomarkers: updatedNames
    })

  } catch (err) {
    console.error('Pulse simulation error:', err)
    return e.json(500, {
      status: 'error',
      message: err.message || 'Unknown error'
    })
  }
})

// Pulse simulation coordinator for demo mode
// Uses BroadcastChannel for leader election so only one tab sends pulses

import { onMounted, onUnmounted, ref } from 'vue'

const PULSE_INTERVAL = 10200 // ~10 seconds between pulses
const LEADER_HEARTBEAT = 5000 // 5 seconds between leader heartbeats
const LEADER_TIMEOUT = 10000 // 10 seconds before assuming leader is gone

interface PulseMessage {
  type: 'leader-heartbeat' | 'leader-resign' | 'pulse-sent'
  tabId: string
  timestamp: number
}

// Generate a unique tab ID
const TAB_ID = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

// Module-level state to prevent multiple instances
let isInitialized = false

export function usePulseSimulation() {
  // Prevent multiple initializations in the same tab
  if (isInitialized) {
    return
  }
  isInitialized = true

  const isLeader = ref(false)
  const lastLeaderHeartbeat = ref(0)

  let channel: BroadcastChannel | null = null
  let pulseInterval: ReturnType<typeof setInterval> | null = null
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null
  let leaderCheckInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Send a pulse to the backend
   */
  async function sendPulse() {
    // Skip if tab is hidden (browser may throttle anyway)
    if (document.hidden) {
      return
    }

    try {
      const baseUrl = import.meta.env.VITE_POCKETBASE_URL || window.location.origin
      const response = await fetch(`${baseUrl}/api/demo/pulse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.status === 'ok' && data.updated > 0) {
          console.log(`[Pulse] Updated ${data.updated} biomarker(s):`, data.biomarkers)
        }
      }
    } catch (err) {
      // Silently fail - server might be restarting
      console.debug('[Pulse] Failed to send pulse:', err)
    }
  }

  /**
   * Broadcast a message to other tabs
   */
  function broadcast(message: Omit<PulseMessage, 'tabId' | 'timestamp'>) {
    if (channel) {
      channel.postMessage({
        ...message,
        tabId: TAB_ID,
        timestamp: Date.now()
      })
    }
  }

  /**
   * Become the leader and start sending pulses
   */
  function becomeLeader() {
    if (isLeader.value) return

    console.log('[Pulse] Becoming leader:', TAB_ID)
    isLeader.value = true

    // Start sending pulses
    pulseInterval = setInterval(sendPulse, PULSE_INTERVAL)

    // Send first pulse immediately
    sendPulse()

    // Start broadcasting heartbeats
    heartbeatInterval = setInterval(() => {
      broadcast({ type: 'leader-heartbeat' })
    }, LEADER_HEARTBEAT)

    // Broadcast initial heartbeat
    broadcast({ type: 'leader-heartbeat' })
  }

  /**
   * Resign as leader
   */
  function resignLeadership() {
    if (!isLeader.value) return

    console.log('[Pulse] Resigning leadership:', TAB_ID)
    isLeader.value = false

    broadcast({ type: 'leader-resign' })

    if (pulseInterval) {
      clearInterval(pulseInterval)
      pulseInterval = null
    }

    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  }

  /**
   * Handle messages from other tabs
   */
  function handleMessage(event: MessageEvent<PulseMessage>) {
    const { type, tabId, timestamp } = event.data

    // Ignore our own messages
    if (tabId === TAB_ID) return

    switch (type) {
      case 'leader-heartbeat':
        lastLeaderHeartbeat.value = timestamp
        // If we thought we were leader but someone else is, resign
        if (isLeader.value) {
          resignLeadership()
        }
        break

      case 'leader-resign':
        // Leader resigned, try to become new leader after short delay
        // (delay prevents race conditions)
        setTimeout(() => {
          if (!isLeader.value && Date.now() - lastLeaderHeartbeat.value > LEADER_TIMEOUT) {
            becomeLeader()
          }
        }, Math.random() * 1000 + 500)
        break
    }
  }

  /**
   * Check if current leader is still active
   */
  function checkLeader() {
    const timeSinceHeartbeat = Date.now() - lastLeaderHeartbeat.value

    if (!isLeader.value && timeSinceHeartbeat > LEADER_TIMEOUT) {
      // No active leader, try to become one
      becomeLeader()
    }
  }

  onMounted(() => {
    // Set up BroadcastChannel for cross-tab communication
    try {
      channel = new BroadcastChannel('pulse-simulation')
      channel.onmessage = handleMessage
    } catch {
      // BroadcastChannel not supported, this tab will just pulse independently
      // (server-side debounce will handle multiple pulses)
      console.debug('[Pulse] BroadcastChannel not supported, falling back to independent mode')
    }

    // Start checking for leader
    leaderCheckInterval = setInterval(checkLeader, LEADER_HEARTBEAT)

    // Initial leader check after a short delay (allow other tabs to claim leadership)
    setTimeout(checkLeader, Math.random() * 2000 + 1000)

    // Handle visibility changes - pause when hidden, resume when visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isLeader.value) {
        // Tab is hidden, resign leadership so other tabs can take over
        resignLeadership()
      } else if (!document.hidden) {
        // Tab is visible again, check if we should become leader
        setTimeout(checkLeader, 500)
      }
    })
  })

  onUnmounted(() => {
    // Clean up
    resignLeadership()

    if (leaderCheckInterval) {
      clearInterval(leaderCheckInterval)
    }

    if (channel) {
      channel.close()
    }

    isInitialized = false
  })
}

# Heartbeat

As there is no UI to update data, we want to simulate this, as this is a demo app.

This needs to run on pockethost so we need to use webhooks.

This webhook will be pinged by the browser running the app.



# 1. The Backend: Custom API Route (Instead of Cron)
Wwe will create a custom API endpoint in PocketBase that, when hit, updates the ALT biomarker.


Sample code: 

```ts


// pb_hooks/simulation.pb.js

// Define a public API endpoint: POST /api/demo/pulse
routerAdd("POST", "/api/demo/pulse", (c) => {
    try {
        // 1. Fetch the 'ALT' biomarker
        const record = $app.dao().findFirstRecordByData("biomarkers", "name", "ALT")
        
        if (record) {
            // 2. Calculate the new value (Safety Signal Simulation)
            const currentVal = record.get("current_value")
            // Fluctuate between -1.5 and +1.5
            let change = (Math.random() * 3) - 1.5
            
            let newVal = currentVal + change
            
            // 3. Keep within realistic bounds
            if (newVal < 20) newVal = 20
            if (newVal > 65) newVal = 65 
            
            record.set("current_value", parseFloat(newVal.toFixed(1)))
            
            // 4. Save (This triggers the realtime subscription event automatically)
            $app.dao().saveRecord(record)
            
            return c.json(200, { 
                success: true, 
                value: newVal,
                message: "Pulse updated" 
            })
        }
    } catch (e) {
        return c.json(500, { error: e.message })
    }
    
    return c.json(404, { error: "Biomarker ALT not found" })
})

```

# 2. The Frontend: The "Pacemaker"

Now, add logic piece to the app.vue (or your main layout). This effectively says: "While this window is open, poke the server every 3 seconds to generate new data."

```ts
// app.vue or layouts/default.vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// Only run this logic if we are in the browser
if (import.meta.client) {
  let timer: any = null

  onMounted(() => {
    // Ping the backend every 3 seconds
    timer = setInterval(async () => {
      try {
        // We use a simple fetch to trigger the simulation hook
        // No need to process the result; the WebSocket listener will handle the update
        await fetch('/api/demo/pulse', { method: 'POST' })
      } catch (e) {
        // Silent fail (offline, etc)
      }
    }, 3000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })
}
</script>
```



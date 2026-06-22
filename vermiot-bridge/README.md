# VermIoT Bridge

MQTT → Firebase bridge for the VermIoT worm-bed monitoring system.
Receives sensor data from an ESP32 and writes it to Firebase Realtime Database
in the exact structure the React dashboard expects.

**Course:** ICS 4111 — Internet of Things | Strathmore University | Group 4E

---

## Prerequisites

- Node.js 18 or higher — https://nodejs.org
- A Firebase project (vermiot-8e72b)
- The ESP32 firmware running and publishing to HiveMQ

---

## Installation

```bash
cd vermiot-bridge
npm install
```

---

## Firebase service account key

The bridge authenticates with Firebase using a service account key.

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Select the **vermiot-8e72b** project
3. Click the gear icon → **Project settings**
4. Open the **Service accounts** tab
5. Click **Generate new private key** → confirm → download the JSON file
6. Rename the downloaded file to `serviceAccountKey.json`
7. Place it in this folder (`vermiot-bridge/serviceAccountKey.json`)

> **Never commit this file.** It is already listed in `.gitignore`.

---

## Environment setup

Copy the example file and verify the values:

```bash
cp .env.example .env
```

The default `.env` is already configured for the VermIoT project:

```
DATABASE_URL=https://vermiot-8e72b-default-rtdb.firebaseio.com
MQTT_BROKER=mqtt://broker.hivemq.com:1883
MQTT_CLIENT_ID=VermIoT_Bridge_Group4E
BED_ID=bed_1
```

No changes needed unless you rename the bed or switch brokers.

---

## Running the bridge

```bash
npm start
```

For development with auto-restart on file changes:

```bash
npm run dev
```

The bridge runs indefinitely. Press `Ctrl+C` to stop it cleanly.

---

## Expected console output

When everything is working you should see:

```
╔══════════════════════════════════╗
║   VermIoT Bridge  v2.0           ║
║   MQTT → Firebase                ║
║   ICS 4111 · Group 4E            ║
╚══════════════════════════════════╝

[2026-06-22 10:00:00] ℹ  Firebase connected → https://vermiot-8e72b-default-rtdb.firebaseio.com
[2026-06-22 10:00:00] ℹ  beds/bed_1/info already exists — skipping seed
[2026-06-22 10:00:01] ✓  Connected to MQTT broker (mqtt://broker.hivemq.com:1883)
[2026-06-22 10:00:01] ℹ  Subscribed → vermiot/bed_1/temperature
[2026-06-22 10:00:01] ℹ  Subscribed → vermiot/bed_1/humidity
[2026-06-22 10:00:01] ℹ  Subscribed → vermiot/bed_1/soil_moisture
[2026-06-22 10:00:01] ℹ  Subscribed → vermiot/bed_1/gas
[2026-06-22 10:00:01] ℹ  Subscribed → vermiot/bed_1/status

[2026-06-22 10:00:01] Waiting for ESP32 sensor data...

[2026-06-22 10:00:10] Received  temperature    = 25.20
[2026-06-22 10:00:10] Received  humidity       = 54.40
[2026-06-22 10:00:10] Received  soil_moisture  = 24
[2026-06-22 10:00:10] Received  gas            = 430
[2026-06-22 10:00:10] ✓  beds/bed_1/latest written
[2026-06-22 10:00:10] ✓  beds/bed_1/history entry pushed
```

---

## Verifying data in Firebase Console

1. Go to the [Firebase Console](https://console.firebase.google.com) → **vermiot-8e72b**
2. Click **Realtime Database** in the left sidebar
3. You should see this structure update in real time:

```
beds/
└── bed_1/
    ├── info/     ← created on first run
    ├── latest/   ← overwrites every ~10 seconds
    └── history/  ← grows by one entry every ~10 seconds
```

---

## Running everything together

Open three terminals:

**Terminal 1 — Bridge:**
```bash
cd vermiot-bridge
npm start
```

**Terminal 2 — Dashboard:**
```bash
cd dashboard
npm run dev
```

**Terminal 3 — Serial Monitor:**
Open your Arduino IDE or PlatformIO serial monitor at 115200 baud to watch ESP32 output.

---

## Troubleshooting

### `Cannot find module './serviceAccountKey.json'`
You haven't placed the service account key in this folder yet.
Follow the **Firebase service account key** section above.

### `Firebase write failed: PERMISSION_DENIED`
Your service account key is for a different project, or the Realtime Database
security rules are blocking writes. Check:
- The key belongs to the `vermiot-8e72b` project
- Firebase Console → Realtime Database → Rules → ensure write is allowed

### `MQTT error: connect ECONNREFUSED`
The HiveMQ public broker is unreachable. Check your internet connection.
The bridge will automatically retry every 5 seconds.

### `Reconnecting to MQTT broker...`
Normal after a network blip. The bridge reconnects automatically — no action needed.

### Dashboard shows "No Data" for sensors
Check that the ESP32 is publishing to the correct topics:
```
vermiot/bed_1/temperature
vermiot/bed_1/humidity
vermiot/bed_1/soil_moisture
vermiot/bed_1/gas
```
Use an MQTT client like [MQTT Explorer](https://mqtt-explorer.com) to verify
messages are arriving at the broker.

### `DATABASE_URL is not set in .env — exiting`
Create a `.env` file by copying `.env.example`:
```bash
cp .env.example .env
```

---

## Firebase data structure

The bridge writes data using these exact field names (verified against the dashboard):

```
beds/bed_1/latest/
  temperature  ← °C (float)
  humidity     ← % relative humidity (float)
  moisture     ← % soil moisture (float)
  gasIndex     ← raw MQ-5 analog value (int)
  ph           ← fixed 7.0 (no sensor)
  timestamp    ← Unix ms (int)

beds/bed_1/history/{pushId}/
  (same fields as latest)
```

> Note: field names `gasIndex` and `ph` match what the React dashboard reads.
> The MQTT topics publish `gas` and the hardware has no pH sensor — the bridge
> performs this mapping automatically.

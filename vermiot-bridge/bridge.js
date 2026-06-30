require("dotenv").config();
const mqtt = require("mqtt");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const serviceAccount = require("./serviceAccountKey.json");

// ── Helpers ───────────────────────────────────
function ts() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}
function log(msg)  { console.log(`[${ts()}] ${msg}`); }
function info(msg) { console.log(`[${ts()}] ℹ  ${msg}`); }
function ok(msg)   { console.log(`[${ts()}] ✓  ${msg}`); }
function warn(msg) { console.warn(`[${ts()}] ⚠  ${msg}`); }
function err(msg)  { console.error(`[${ts()}] ✗  ${msg}`); }

// ── Banner ────────────────────────────────────
console.log("╔══════════════════════════════════╗");
console.log("║   VermIoT Bridge  v2.0           ║");
console.log("║   MQTT → Firebase                ║");
console.log("║   ICS 4111 · Group 4E            ║");
console.log("╚══════════════════════════════════╝");
console.log();

// ── Email Notifications ───────────────────────
const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_TO   = process.env.EMAIL_TO;
const EMAIL_PASS = process.env.EMAIL_PASS;
const emailEnabled = EMAIL_FROM && EMAIL_TO && EMAIL_PASS;

const transporter = emailEnabled
  ? nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_FROM, pass: EMAIL_PASS },
    })
  : null;

async function sendEmail(subject, text) {
  if (!transporter) return;
  try {
    await transporter.sendMail({ from: EMAIL_FROM, to: EMAIL_TO, subject, text });
    ok(`Email sent: ${subject}`);
  } catch (e) {
    warn(`Email failed: ${e.message}`);
  }
}

// Thresholds (mirrors dashboard/src/utils/thresholds.js)
const THRESHOLDS = {
  moisture:    { optimal: { min: 70,  max: 85  }, acceptable: { min: 60,  max: 92  } },
  temperature: { optimal: { min: 15,  max: 25  }, acceptable: { min: 10,  max: 35  } },
  ph:          { optimal: { min: 6.5, max: 7.5 }, acceptable: { min: 5.5, max: 8.5 } },
  gasIndex:    { optimal: { min: 0,   max: 300 }, acceptable: { min: 0,   max: 500 } },
};
const NOTIFY_KEYS = ["moisture", "temperature", "ph", "gasIndex"];

function sensorStatus(key, value) {
  const t = THRESHOLDS[key];
  if (!t || value == null) return "unknown";
  if (value >= t.optimal.min && value <= t.optimal.max) return "optimal";
  if (value >= t.acceptable.min && value <= t.acceptable.max) return "acceptable";
  return "danger";
}

function harvestReadiness(reading) {
  if (!reading) return "unknown";
  const statuses = NOTIFY_KEYS.map(k => sensorStatus(k, reading[k]));
  if (statuses.some(s => s === "danger")) return "not-ready";
  if (statuses.every(s => s === "optimal")) return "ready";
  return "approaching";
}

// Notification state — tracks previous conditions to avoid duplicate emails
let prevReadiness = null;
const prevDanger = new Set();

async function checkAndNotify(reading) {
  if (!emailEnabled) return;

  const readiness = harvestReadiness(reading);

  if (readiness !== prevReadiness) {
    if (readiness === "ready") {
      await sendEmail(
        `VermIoT: Bed ${BED_ID} is ready to harvest!`,
        `All sensors are in the optimal range. Your vermiculture bed (${BED_ID}) is ready to harvest.\n\nReadings:\n` +
        NOTIFY_KEYS.map(k => `  ${k}: ${reading[k]}`).join("\n")
      );
    } else if (readiness === "approaching" && prevReadiness === "not-ready") {
      await sendEmail(
        `VermIoT: Bed ${BED_ID} approaching readiness`,
        `Sensor conditions are improving. Bed (${BED_ID}) is approaching harvest readiness.\n\nReadings:\n` +
        NOTIFY_KEYS.map(k => `  ${k}: ${reading[k]}`).join("\n")
      );
    }
    prevReadiness = readiness;
  }

  // Alert on each newly-dangerous sensor
  for (const key of NOTIFY_KEYS) {
    const isDanger = sensorStatus(key, reading[key]) === "danger";
    if (isDanger && !prevDanger.has(key)) {
      await sendEmail(
        `VermIoT Alert: ${key} out of range on bed ${BED_ID}`,
        `Sensor "${key}" has entered a danger range.\n\n  Value: ${reading[key]}\n  Bed: ${BED_ID}\n\nCheck the dashboard immediately.`
      );
      prevDanger.add(key);
    } else if (!isDanger) {
      prevDanger.delete(key);
    }
  }
}

// ── Config ────────────────────────────────────
const DATABASE_URL  = process.env.DATABASE_URL;
const MQTT_BROKER   = process.env.MQTT_BROKER   || "mqtt://broker.hivemq.com:1883";
const MQTT_CLIENT_ID = process.env.MQTT_CLIENT_ID || "VermIoT_Bridge_Group4E";
const BED_ID        = process.env.BED_ID         || "bed_1";

if (!DATABASE_URL) {
  err("DATABASE_URL is not set in .env — exiting.");
  process.exit(1);
}

// ── Firebase Init ─────────────────────────────
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: DATABASE_URL,
});

const db = admin.database();
info(`Firebase connected → ${DATABASE_URL}`);
if (emailEnabled) {
  info(`Email notifications → ${EMAIL_TO}`);
} else {
  warn("Email notifications disabled (EMAIL_FROM / EMAIL_TO / EMAIL_PASS not set)");
}

// ── Seed bed/info if absent ───────────────────
async function ensureBedInfo() {
  const infoRef = db.ref(`beds/${BED_ID}/info`);
  const snapshot = await infoRef.once("value");
  if (!snapshot.exists()) {
    await infoRef.set({
      name: "Bed 1",
      dateSeeded: new Date().toISOString().split("T")[0],
      estimatedMaturity: "",
      notes: "Prototype bed — Group 4E",
    });
    ok(`beds/${BED_ID}/info created in Firebase`);
  } else {
    info(`beds/${BED_ID}/info already exists — skipping seed`);
  }
}

ensureBedInfo().catch((e) => err(`Failed to seed bed info: ${e.message}`));

// ── Sensor state ──────────────────────────────
// Holds the most recent reading for each field.
// All four sensor fields must be non-null before we write to Firebase.
let pending = {
  temperature: null,
  humidity:    null,
  moisture:    null,
  gasIndex:    null,
  ph:          7.0,   // no pH sensor — fixed neutral default
};

const REQUIRED_FIELDS = ["temperature", "humidity", "moisture", "gasIndex"];

function allReceived() {
  return REQUIRED_FIELDS.every((k) => pending[k] !== null);
}

// ── MQTT topic → pending field mapping ────────
const TOPIC_MAP = {
  [`vermiot/${BED_ID}/temperature`]:   (v) => { pending.temperature = parseFloat(v); },
  [`vermiot/${BED_ID}/humidity`]:      (v) => { pending.humidity    = parseFloat(v); },
  [`vermiot/${BED_ID}/soil_moisture`]: (v) => { pending.moisture    = parseFloat(v); },
  [`vermiot/${BED_ID}/gas`]:           (v) => { pending.gasIndex    = parseFloat(v); },
  [`vermiot/${BED_ID}/status`]:        (v) => { info(`ESP32 status: ${v}`); },
};

const TOPICS = Object.keys(TOPIC_MAP);

// ── Firebase write ────────────────────────────
async function writeToFirebase() {
  const reading = {
    temperature: pending.temperature,
    humidity:    pending.humidity,
    moisture:    pending.moisture,
    gasIndex:    pending.gasIndex,
    ph:          pending.ph,
    timestamp:   Date.now(),
  };

  try {
    // Overwrite latest
    await db.ref(`beds/${BED_ID}/latest`).set(reading);
    ok(`beds/${BED_ID}/latest written`);

    // Append to history (push generates a unique key)
    await db.ref(`beds/${BED_ID}/history`).push(reading);
    ok(`beds/${BED_ID}/history entry pushed`);

    await checkAndNotify(reading);
  } catch (e) {
    err(`Firebase write failed: ${e.message}`);
  }
}

// ── MQTT Init ─────────────────────────────────
info(`Connecting to MQTT broker: ${MQTT_BROKER}`);

const mqttClient = mqtt.connect(MQTT_BROKER, {
  clientId: MQTT_CLIENT_ID,
  clean: true,
  reconnectPeriod: 5000,
  connectTimeout: 30000,
});

mqttClient.on("connect", () => {
  ok(`Connected to MQTT broker (${MQTT_BROKER})`);

  TOPICS.forEach((topic) => {
    mqttClient.subscribe(topic, (e) => {
      if (e) {
        err(`Failed to subscribe to ${topic}: ${e.message}`);
      } else {
        info(`Subscribed → ${topic}`);
      }
    });
  });

  console.log();
  log("Waiting for ESP32 sensor data...\n");
});

mqttClient.on("message", (topic, message) => {
  const value = message.toString().trim();
  const field = topic.split("/").pop();

  log(`Received  ${field.padEnd(14)} = ${value}`);

  const handler = TOPIC_MAP[topic];
  if (handler) {
    handler(value);
  } else {
    warn(`Unknown topic: ${topic}`);
  }

  // Write to Firebase once all four sensor readings are in hand
  if (allReceived()) {
    writeToFirebase().then(() => {
      // Reset only the four sensor fields so the next cycle waits
      // for a fresh complete set before writing again
      pending.temperature = null;
      pending.humidity    = null;
      pending.moisture    = null;
      pending.gasIndex    = null;
    });
  }
});

mqttClient.on("error",     (e)  => err(`MQTT error: ${e.message}`));
mqttClient.on("reconnect", ()   => warn("Reconnecting to MQTT broker..."));
mqttClient.on("offline",   ()   => warn("MQTT client offline"));
mqttClient.on("close",     ()   => warn("MQTT connection closed"));

// ── Graceful shutdown ─────────────────────────
process.on("SIGINT", () => {
  log("Shutting down...");
  mqttClient.end(true, {}, () => {
    db.app.delete().then(() => {
      log("Bridge stopped cleanly.");
      process.exit(0);
    });
  });
});

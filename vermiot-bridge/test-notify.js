// Quick test — run with: node test-notify.js
// Tests each notification type without needing MQTT or an ESP32.
require("dotenv").config();
const nodemailer = require("nodemailer");

const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_TO   = process.env.EMAIL_TO;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_FROM || !EMAIL_TO || !EMAIL_PASS) {
  console.error("Missing EMAIL_FROM / EMAIL_TO / EMAIL_PASS in .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_FROM, pass: EMAIL_PASS },
});

async function send(subject, text) {
  await transporter.sendMail({ from: EMAIL_FROM, to: EMAIL_TO, subject, text });
  console.log(`✓ Sent: ${subject}`);
}

const TEST = process.argv[2] || "all";

(async () => {
  try {
    if (TEST === "ready" || TEST === "all") {
      await send(
        "VermIoT: Bed bed_1 is ready to harvest!",
        "All sensors are in the optimal range. Your vermiculture bed (bed_1) is ready to harvest.\n\nReadings:\n  moisture: 78\n  temperature: 22\n  ph: 7.0\n  gasIndex: 150"
      );
    }
    if (TEST === "approaching" || TEST === "all") {
      await send(
        "VermIoT: Bed bed_1 approaching readiness",
        "Sensor conditions are improving. Bed (bed_1) is approaching harvest readiness.\n\nReadings:\n  moisture: 65\n  temperature: 22\n  ph: 7.0\n  gasIndex: 150"
      );
    }
    if (TEST === "alert" || TEST === "all") {
      await send(
        'VermIoT Alert: temperature out of range on bed bed_1',
        'Sensor "temperature" has entered a danger range.\n\n  Value: 40\n  Bed: bed_1\n\nCheck the dashboard immediately.'
      );
    }
    console.log("\nDone. Check your inbox.");
  } catch (e) {
    console.error("Failed:", e.message);
  }
})();

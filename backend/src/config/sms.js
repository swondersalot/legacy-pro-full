const Twilio = require("twilio");
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = require("./index");
const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function sendSMS({ to, body }) {
  await client.messages.create({ from: TWILIO_PHONE_NUMBER, to, body });
}

module.exports = sendSMS;

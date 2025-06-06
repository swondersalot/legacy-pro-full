const Stripe = require("stripe");
const { STRIPE_SECRET_KEY } = require("./index");
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
module.exports = stripe;

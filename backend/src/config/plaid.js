const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV } = require("./index");

const config = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET
    }
  }
});
const plaidClient = new PlaidApi(config);
module.exports = plaidClient;

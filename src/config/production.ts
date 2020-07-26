export const production_config = {
  MONGO_URL: process.env.MONGO_DB_URI || "mongodb://db/carrental",
  SECRET: "asdytuyweiouhgl1234Q^%#",
  SALT_ROUNDS: 10,
  APP_NAME: "Car Rental",
  PORT: process.env.PORT || 3000,
  SESSION_KEY: "tgugfhsifujhsjfh%$^dsa",
  HOST: "0.0.0.0",
  SITE_URL: "http://104.248.147.124:80"
};

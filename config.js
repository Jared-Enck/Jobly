"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
const env = process.env
require("colors");

const SECRET_KEY = env.SECRET_KEY || "secret-dev";

const PORT = +env.PORT || 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  const dbase = (env.NODE_ENV === "test")
  ? env.DATABASE_TEST
  : env.DATABASE;
  const DB_URI =`socket:/var/run/postgresql?db=${dbase}`
  return DB_URI
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = env.NODE_ENV === "test" ? 1 : 12;

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};

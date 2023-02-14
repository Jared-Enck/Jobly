"use strict";

const env = process.env

describe("config can come from env", function () {
  test("works", function() {
    env.SECRET_KEY = "abc";
    env.PORT = "5000";
    env.DATABASE = "other";
    env.NODE_ENV = "other";

    const config = require("./config");
    expect(config.SECRET_KEY).toEqual("abc");
    expect(config.PORT).toEqual(5000);
    expect(config.getDatabaseUri()).toEqual(
      "socket:/var/run/postgresql?db=other"
      );
    expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

    delete env.SECRET_KEY;
    delete env.PORT;
    delete env.BCRYPT_WORK_FACTOR;
    env.DATABASE = "jobly"

    expect(config.getDatabaseUri()).toEqual(
      "socket:/var/run/postgresql?db=jobly"
      );
    env.NODE_ENV = "test";

    expect(config.getDatabaseUri()).toEqual(
      "socket:/var/run/postgresql?db=jobly_test"
      );
  });
})


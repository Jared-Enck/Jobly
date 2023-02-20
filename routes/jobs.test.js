"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  testJobIDs
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 120000,
    equity: 0.4,
    companyHandle: "c1",
  };

  test("ok admin for users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "new",
        salary: 120000,
        equity: "0.4",
        companyHandle: "c1"
      }
    });
  });
  
  test("unauth for anon", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
            ...newJob
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non admin user", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
            ...newJob
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new",
          salary: 120000
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          id: 1,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
        [
          {
            title: "j1",
            salary: 60000,
            equity: "0",
            companyHandle: "c1"
          },
          {
            title: "j2",
            salary: 80000,
            equity: "0.5",
            companyHandle: "c1"
          },
          {
            title: "j3",
            salary: 100000,
            equity: "1",
            companyHandle: "c3"
          },
          {
            title: "j4",
            salary: 120000,
            equity: "0.8",
            companyHandle: "c3"
          },
        ],
    });
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${testJobIDs[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIDs[0],
        title: "j1",
        salary: 60000,
        equity: "0",
        companyHandle: "c1",
      }
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIDs[0]}`)
        .send({
          title: "new",
          salary: 70000
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIDs[0],
        title: "new",
        salary: 70000,
        equity: "0",
        companyHandle: "c1",
      }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIDs[0]}`)
        .send({
          title: "new",
          salary: 70000
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "new",
          salary: 70000
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIDs[0]}`)
        .send({
          id: 1,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIDs[0]}`)
        .send({
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIDs[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${testJobIDs[0]}` });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIDs[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
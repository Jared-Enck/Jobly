"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
        FROM companies
        ORDER BY name`);
    return companiesRes.rows;
  }

  /** Find all companies with like name case-insensitive. 
   * 
   * Returns [{ handle, name, description, logoUrl }, ...]
   * */

  static async findAllByName(name) {
    if (name === '') {
      throw new BadRequestError('Please enter a company name.')
    }
    const companiesNameRes = await db.query(
      `SELECT c.handle,
              c.name,
              c.description,
              c.logo_url AS "logoUrl"
        FROM companies as c
        WHERE c.name iLIKE '%${name}%'
        ORDER BY name`
    );
    if (companiesNameRes.rows.length === 0) {
      throw new NotFoundError(`Can't find company with '${name}' in their name.`)
    }
    return companiesNameRes.rows;
  }

  /** Find all companies that meet min/max num employees. 
   * 
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAllByNumEmps(qParams) {
    const minEmps = Number(qParams.minEmps)
    const maxEmps = Number(qParams.maxEmps)

    if (minEmps > maxEmps) {
      throw new BadRequestError('Minimum employees cannot be greater than maximum employess.')
    }

    if (minEmps && maxEmps) {
      const compsByMinMax = await db.query(
        `SELECT c.handle,
                c.name,
                c.description,
                c.num_employees AS "numEmployees",
                c.logo_url AS "logoUrl"
          FROM companies as c
          WHERE c.num_employees >= ${minEmps} AND c.num_employees <= ${maxEmps}
          ORDER BY c.num_employees DESC`
      );
      return compsByMinMax.rows;
    }
    if (minEmps && !maxEmps) {
      const compsByMinEmps = await db.query(
        `SELECT c.handle,
                c.name,
                c.description,
                c.num_employees AS "numEmployees",
                c.logo_url AS "logoUrl"
          FROM companies as c
          WHERE c.num_employees >= ${minEmps}
          ORDER BY c.num_employees`
      );
      return compsByMinEmps.rows;
    }
    if (!minEmps && maxEmps) {
      const compsByMaxEmps = await db.query(
        `SELECT c.handle,
                c.name,
                c.description,
                c.num_employees AS "numEmployees",
                c.logo_url AS "logoUrl"
          FROM companies as c
          WHERE c.num_employees <= ${maxEmps}
          ORDER BY c.num_employees DESC`
      );
      return compsByMaxEmps.rows;
    }
    
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT c.handle,
                  c.name,
                  c.description,
                  c.num_employees AS "numEmployees",
                  c.logo_url AS "logoUrl",
                  j.id,
                  j.title,
                  j.salary,
                  j.equity,
                  j.company_handle
           FROM companies c
            LEFT JOIN jobs j
              ON c.handle = j.company_handle
           WHERE c.handle = $1`,
        [handle]);
        
    if (!companyRes.rows.length) throw new NotFoundError(`No company: ${handle}`);

    const {name,description,numEmployees,logoUrl} = companyRes.rows[0];

    const jobs = (companyRes.rows[0].id) ? 
      companyRes.rows.map(r => {
        return {
          id: r.id,
          title: r.title,
          salary: r.salary,
          equity: r.equity,
        }
      }) :
      false;

    const company = (jobs) ? 
      {
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
        jobs
      } :
      {
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      }
    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;

// Ensures query parameters for /companies route are acceptable.
const { BadRequestError } = require("../expressError");

qParamsValidator = (params, route) => {
  let acceptableParams;
  const compsParams = new Set(['name','minEmps','maxEmps'])
  const jobsParams = new Set(['title','minSalary','hasEquity'])

  acceptableParams = (route === 'comps') ? compsParams : jobsParams

  const paramsArr = Array.from(acceptableParams).join(', ')

  for (p in params) {
    if (!acceptableParams.has(params[p])) {
        throw new BadRequestError(`Acceptable query parameters are: ${paramsArr}`)
    }
  }
}

module.exports = {qParamsValidator}
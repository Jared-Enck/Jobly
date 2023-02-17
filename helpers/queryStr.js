// Ensures query parameters for /companies route are acceptable.
const { BadRequestError } = require("../expressError");

qParamsValidator = (params) => {
    const acceptableParams = new Set(['name','minEmps','maxEmps'])
    const paramsArr = Array.from(acceptableParams).join(', ')

    for (p in params) {
        if (!acceptableParams.has(params[p])) {
            throw new BadRequestError(`Acceptable query parameters are: ${paramsArr}`)
        }
    }
}

module.exports = {qParamsValidator}
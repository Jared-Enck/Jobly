// Ensures query parameters for /companies route are acceptable.

const acceptableParams = new Set(['name','minEmps','maxEmps'])

qParamsValidator = (params) => {
    for (p in params) {
        if (!acceptableParams.has(params[p])) return false
    }
    return true
}

module.exports = {qParamsValidator, acceptableParams}
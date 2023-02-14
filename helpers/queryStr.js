// Ensures query parameters for /companies route are acceptable.

qParamsValidator = (params) => {
    const acceptableParams = new Set(['name','minEmps','maxEmps'])

    for (p in params) {
        if (!acceptableParams.has(params[p])) {
            return false
        }
    }
    return true
}

module.exports = {qParamsValidator}
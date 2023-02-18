const { BadRequestError } = require("../expressError");
/** Takes query params and forms sql "WHERE" string.
 *  Converts js key to sql col name
 */
function sqlForJobFilters(params, jsToSql) {
  const keys = Object.keys(params);
  const vals = Object.values(params);

  // {minSalary: 80000} => [ salary >= 80000 ]
  let str = '';

  keys.map((colName, idx) => {
    const name = jsToSql[colName] || colName
    
    if (name === 'title') {
      str += (idx === 0) ?
        `title ILIKE '%${vals[idx]}%'` :
        ` AND title ILIKE '%${vals[idx]}%'`
    } 
    if (name === 'salary') {
      str += (idx === 0) ?
        `salary >= ${vals[idx]}`:
        ` AND salary >= ${vals[idx]}`
    }
    // If hasEquity converted to sql col 'equity' exists in query
    if (name === 'equity') {
      str += (idx === 0) ?
        `equity > '0'`:
        ` AND equity > '0'`
    }
  })
  return str
}
  
module.exports = { sqlForJobFilters };
// DTOs for reference only (plain JS, not enforced)
// Example:
// /**
//  * @typedef {Object} SupplierDTO
//  * @property {string} _id
//  * @property {string} name
//  * @property {string} email
//  * ...etc
//  */

/**
 * Helper to strip null/undefined/empty string before sending to backend
 * @param {Object} obj
 * @returns {Object}
 */
export function clean(obj) {
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") out[k] = v;
  });
  return out;
}

import { FIELD_REGISTRIES } from './utils/visitor.js';

const KNOWN_FIELDS = Object.keys(FIELD_REGISTRIES);

/**
 * Validates that `value` is an array of strings with no duplicates and
 * only keys from `allowed`.  Throws a descriptive error on any violation.
 * @param {string} field - The visitor field name (e.g. 'hostname').
 * @param {unknown} value - The value supplied for the field.
 * @param {string[]} allowed - The set of allowed source keys for the field.
 */
function validateField(field, value, allowed) {
  const path = `visitor.priority.${field}`;

  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array of source keys.`);
  }

  if (value.some(k => typeof k !== 'string')) {
    throw new Error(`${path}: all entries must be strings.`);
  }

  const seen = new Set();
  for (const key of value) {
    if (seen.has(key)) {
      throw new Error(`${path}: duplicate key '${key}'.`);
    }
    seen.add(key);

    if (!allowed.includes(key)) {
      throw new Error(
        `${path}: unknown source key '${key}'. ` +
        `Allowed keys for ${field}: ${allowed.map(k => `'${k}'`).join(', ')}.`
      );
    }
  }
}

/**
 * Validates `gasket.config.visitor.priority` and throws on misconfiguration.
 * Returns baseConfig unchanged.
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
export default function configure(gasket, baseConfig) {
  const priority = baseConfig?.visitor?.priority;
  if (priority == null) return baseConfig;

  if (typeof priority !== 'object' || Array.isArray(priority)) {
    throw new Error('visitor.priority must be an object keyed by visitor field name.');
  }

  for (const [field, value] of Object.entries(priority)) {
    if (!KNOWN_FIELDS.includes(field)) {
      throw new Error(
        `visitor.priority.${field}: Unknown field. Allowed fields: ${KNOWN_FIELDS.join(', ')}.`
      );
    }
    validateField(field, value, FIELD_REGISTRIES[field].defaultOrder);
  }

  return baseConfig;
}

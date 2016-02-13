import cronParser from 'cron-parser';
import {AlreadyPassedPattern, InvalidPattern} from './errors';


/**
 * Diff of Object
 *
 * @param {Object} obj1 target object
 * @param {Object} obj2 target object
 * @return {Object}
 */
export function difference(obj1 = {}, obj2 = {}) {
  const diff = {};
  Object.keys(obj1).forEach(id => {
    const job = obj1[id];
    if (!obj2[id]) {
      diff[id] = job;
    }
  });
  return diff;
}


/**
 * is Cron pattern
 *
 * @param {string} pattern pattern string
 * @return {boolean}
 */
export function isCronPattern(pattern) {
  const errors = cronParser.parseString(pattern).errors;
  return !Object.keys(errors).length;
}


/**
 * Return pattern type (`cron` or `date`)
 *
 * @param {string} pattern pattern string
 * @return {string}
 */
export function getPatternType(pattern) {
  if (isCronPattern(pattern)) {
    return 'cron';
  }
  const date = Date.parse(pattern);
  if (!isNaN(date)) {
    if (date < Date.now()) {
      throw new AlreadyPassedPattern();
    }
    return 'date';
  }
  throw new InvalidPattern();
}

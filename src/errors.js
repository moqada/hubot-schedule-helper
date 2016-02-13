/**
 * JobNotFound
 */
export class JobNotFound extends Error {  // eslint-disable-line require-jsdoc
  /**
   * Constructor
   *
   * @param {string} message message
   */
  constructor(message = 'Job ID does not exists.') {
    super(message);

    /**
     * @type {string}
     */
    this.name = 'JobNotFound';
  }
}


/**
 * InvalidPattern
 */
export class InvalidPattern extends Error {  // eslint-disable-line require-jsdoc
  /**
   * Constructor
   *
   * @param {string} message message
   */
  constructor(message = 'Invalid pattern.') {
    super(message);

    /**
     * @type {string}
     */
    this.name = 'InvalidPattern';
  }
}


/**
 * AlreadyPassedPattern
 */
export class AlreadyPassedPattern extends Error {  // eslint-disable-line require-jsdoc
  /**
   * Constructor
   *
   * @param {string} message message
   */
  constructor(message = 'Pattern date already passed.') {
    super(message);

    /**
     * @type {string}
     */
    this.name = 'AlreadyPassedPattern';
  }
}

import schedule from 'node-schedule';


/**
 * Base Job class
 */
class Job {
  /**
   * Constructor
   *
   * @param {Object} param param
   * @param {number} param.id Job id
   * @param {string} param.pattern pattern string
   * @param {Object} param.user Hubot user
   * @param {Object} param.meta Data for Job
   * @param {Function} [param.cb] callback
   */
  constructor({id, pattern, user, meta, cb}) {
    /**
     * Job id
     *
     * @type {number}
     */
    this.id = id;

    /**
     * pattern
     *
     * @type {string}
     */
    this.pattern = pattern;

    /**
     * Instance of node-schedule Job
     *
     * @type {Object|null}
     */
    this.job = null;

    /**
     * Object of serialized Hubot user
     *
     * @type {Object}
     */
    this.user = {};

    /**
     * Data for Job
     *
     * @type {Object}
     */
    this.meta = meta;

    /**
     * Callback
     *
     * @type {Function?}
     */
    this.cb = cb;

    Object.keys(user).forEach(k => {
      this.user[k] = user[k];
    });
  }

  /**
   * Execute Job
   *
   * @param {Object} robot Hubot robot
   */
  exec(robot) {  // eslint-disable-line no-unused-vars
    // ex.
    //
    // ```
    // envelope = @getEnvelope()
    // {message} = @meta
    // return -> robot.send envelope, message
    // ```
    throw new Error('NotImplemented');
  }

  /**
   * Get Hubot room id
   *
   * @return {string}
   */
  getRoom() {
    return this.user.room || this.user.reply_to;
  }

  /**
   * Get envelope for robot
   *
   * @return {Object}
   */
  getEnvelope() {
    return {user: this.user, room: this.getRoom()};
  }

  /**
   * Start Job
   *
   * @param {Object} robot Hubot robot
   */
  start(robot) {
    this.job = schedule.scheduleJob(this.pattern, () => {
      this.exec(robot);
      if (this.cb) {
        this.cb();
      }
    });
  }

  /**
   * Cancel Job
   */
  cancel() {
    if (this.job) {
      this.job.cancel();
    }
    if (this.cb) {
      this.cb();
    }
  }

  /**
   * Serialize Job data
   *
   * @return {Object}
   */
  serialize() {
    const {pattern, meta, user} = this;
    return {pattern, meta, user};
  }
}

export default Job;

import {difference, getPatternType} from './utils';
import {JobNotFound} from './errors';

const DEFAULT_JOB_MAX_COUNT = 10000;


/**
 * Scheduler
 */
class Scheduler {
  /**
   * Constructor
   *
   * @param {Object} params params
   * @param {Object} params.robot Hubot robot object
   * @param {string} params.storeKey key of Hubot brain
   * @param {Object} params.job Job class
   * @param {number} [params.jobMaxCount=10000] max number of jobs
   */
  constructor({robot, storeKey, job, jobMaxCount = DEFAULT_JOB_MAX_COUNT}) {
    /**
     * Job list
     *
     * @type {Object}
     */
    this.jobs = {};

    /**
     * Hubot robot object
     *
     * @type {Object}
     */
    this.robot = robot;

    /**
     * key of Hubot brain
     *
     * @type {string}
     */
    this.storeKey = storeKey;

    /**
     * Job class
     *
     * @type {Job}
     */
    this.JobCls = job;

    /**
     * Max number of jobs
     *
     * @type {number}
     */
    this.jobMaxCount = jobMaxCount;

    this.robot.brain.on('loaded', () => this.syncBrain());
    this.initBrain();
  }

  /**
   * Initialize Hubot brain
   */
  initBrain() {
    if (!this.robot.brain.get(this.storeKey)) {
      this.robot.brain.set(this.storeKey, {});
    }
  }

  /**
   * Cancel Job
   *
   * @param {number} id Job id
   */
  cancelJob(id) {
    const job = this.jobs[id];
    if (!job) {
      throw new JobNotFound();
    }
    job.cancel();
    delete this.jobs[id];
    delete this.robot.brain.get(this.storeKey)[id];
  }

  /**
   * Create new Job
   *
   * @param {Object} params params
   * @param {string} params.pattern Cron pattern or Date string
   * @param {Object} params.user Target Hubot user
   * @param {Object} params.meta data for using Job
   * @param {number} [params.id] Job id
   * @return {Job}
   */
  createJob({pattern, user, meta, id}) {
    const jobId = id || this.createId();
    const patternType = getPatternType(pattern);
    let job = null;
    if (patternType === 'cron') {
      job = this.createCronJob({pattern, user, meta, id: jobId});
    } else {
      job = this.createDateJob({pattern, user, meta, id: jobId});
    }
    job.start(this.robot);
    this.jobs[jobId] = job;
    this.storeJobToBrain(jobId, job);
    return job;
  }

  /**
   * Create Job id
   *
   * @return {number}
   */
  createId() {
    let id = null;
    while (!id || this.jobs[id]) {
      id = Math.floor(Math.random() * this.jobMaxCount);
    }
    return id;
  }

  /**
   * Create new CronJob
   *
   * @param {Object} params params
   * @param {string} params.pattern Cron pattern
   * @param {Object} params.user Target Hubot user
   * @param {Object} params.meta Data for using Job
   * @param {number} params.id Job id
   * @return {Job}
   */
  createCronJob({pattern, user, meta, id}) {
    return new this.JobCls({id, pattern, user, meta});
  }

  /**
   * Create new DateJob
   *
   * @param {Object} params params
   * @param {string} params.pattern Date string
   * @param {Object} params.user Target Hubot user
   * @param {Object} params.meta Data for using Job
   * @param {number} params.id Job id
   * @return {Job}
   */
  createDateJob({pattern, user, meta, id}) {
    return new this.JobCls({
      id,
      user,
      meta,
      pattern: new Date(pattern),
      cb: () => {
        delete this.jobs[id];
        delete this.robot.brain.get(this.storeKey)[id];
      }
    });
  }

  /**
   * Create new Job from brain
   *
   * @param {number} id Job id
   * @param {Object} data Date for Job
   * @returns {Job}
   */
  createJobFromBrain(id, data) {
    const {pattern, user, meta} = data;
    return this.createJob({pattern, user, meta, id});
  }

  /**
   * Store Job to brain
   *
   * @param {number} id Job id
   * @param {Job} job Job
   */
  storeJobToBrain(id, job) {
    this.robot.brain.get(this.storeKey)[id] = job.serialize();
  }

  /**
   * Sync Jobs from Brain
   */
  syncBrain() {
    this.initBrain();
    const nonCachedJobs = difference(this.robot.brain.get(this.storeKey), this.jobs);
    Object.getOwnPropertyNames(nonCachedJobs).forEach(id => {
      const jobData = nonCachedJobs[id];
      this.createJobFromBrain(id, jobData);
    });
    const nonStoredJobs = difference(this.jobs, this.robot.brain.get(this.storeKey));
    Object.getOwnPropertyNames(nonStoredJobs).forEach(id => {
      const job = nonStoredJobs[id];
      this.storeJobToBrain(id, job);
    });
  }

  /**
   * Update existes Job
   *
   * @param {number} id Job id
   * @param {Object} meta Data for Job
   */
  updateJob(id, meta) {
    const job = this.jobs[id];
    if (!job) {
      throw new JobNotFound();
    }
    job.meta = meta;
    this.robot.brain.get(this.storeKey)[id] = job.serialize();
  }
}

export default Scheduler;

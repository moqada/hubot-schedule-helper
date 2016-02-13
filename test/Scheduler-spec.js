import assert from 'power-assert';
import clearRequire from 'clear-require';
import sinon from 'sinon';
import {Job, Scheduler} from '../src';

/** @test {Scheduler} */
describe('Scheduler', () => {
  const storeKey = 'brain-key';
  const now = Date.parse('2016-02-10T12:00:00Z');
  const user = {name: 'moqada'};
  const meta = {message: 'we are!'};
  let robot = null;
  let sandbox = null;
  let DummyJob = null;
  let spies = null;
  let brainData = null;
  beforeEach(() => {
    clearRequire('node-schedule');
    sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers(now);
    brainData = {};
    spies = {exec: sandbox.spy()};
    DummyJob = class extends Job {
      exec(robot_) {
        spies.exec(robot_);
      }
    };
    robot = {
      brain: {
        get: sandbox.spy(() => brainData),
        on: sandbox.spy(),
        set: sandbox.spy()
      }
    };
  });
  afterEach(() => {
    sandbox.restore();
  });

  /** @test {Scheduler#constructor} */
  context('constructor()', () => {
    let scheduler = null;
    const job = DummyJob;
    beforeEach(() => {
      scheduler = new Scheduler({robot, storeKey, job});
    });

    it('instance', () => {
      assert(scheduler.robot === robot);
      assert(scheduler.storeKey === storeKey);
      assert(scheduler.JobCls === job);
      assert(scheduler.jobMaxCount === 10000);
    });

    it('set brain.loaded', () => {
      const {args} = robot.brain.on;
      assert(args.length === 1);
      assert(args[0][0] === 'loaded');
      assert(typeof args[0][1] === 'function');
    });
  });

  /** @test {Scheduler#createJob} */
  context('#createJob()', () => {
    let scheduler = null;
    beforeEach(() => {
      scheduler = new Scheduler({robot, storeKey, job: DummyJob});
    });

    it('pattern: * 0 * * *', () => {
      const pattern = '* 0 * * *';
      const job = scheduler.createJob({pattern, user, meta});
      const id = job.id;
      assert(typeof id === 'number');
      assert(scheduler.jobs[id] === job);
      assert.deepEqual(brainData[id], {
        pattern, meta, user
      });
    });

    it('pattern: 2016-02-20', () => {
      const pattern = '2016-02-20';
      const job = scheduler.createJob({pattern, user, meta});
      const id = job.id;
      assert(typeof id === 'number');
      assert(scheduler.jobs[id] === job);
      assert.deepEqual(brainData[id], {
        pattern: new Date(pattern), meta, user
      });
      assert(job.cb);
    });
  });

  /** @test {Scheduler#cancelJob} */
  context('#cancelJob()', () => {
    let scheduler = null;
    beforeEach(() => {
      scheduler = new Scheduler({robot, storeKey, job: DummyJob});
    });

    it('canceled', () => {
      const job = scheduler.createJob({user, meta, pattern: '* 0 * * *'});
      const id = job.id;
      scheduler.cancelJob(id);
      assert(scheduler.jobs[id] === undefined);
      assert(brainData[id] === undefined);
    });

    it('JobNotFound', () => {
      assert.throws(() => {
        scheduler.cancelJob(99999999);
      }, /^JobNotFound: Job ID does not exists.$/);
    });
  });

  /** @test {Scheduler#updateJob} */
  context('#updateJob()', () => {
    let scheduler = null;
    beforeEach(() => {
      scheduler = new Scheduler({robot, storeKey, job: DummyJob});
    });

    it('updated', () => {
      const initData = {user, meta, pattern: '* 0 * * *'};
      const job = scheduler.createJob(initData);
      const id = job.id;
      const data = {message: 'updated'};
      scheduler.updateJob(id, data);
      const updatedData = Object.assign({}, initData, {meta: data});
      assert(scheduler.jobs[id] === job);
      assert.deepEqual(brainData[id], updatedData);
    });

    it('JobNotFound', () => {
      assert.throws(() => {
        scheduler.updateJob(99999999);
      }, /^JobNotFound: Job ID does not exists.$/);
    });
  });

  /** @test {Scheduler#syncBrain} */
  context('#syncBrain()', () => {
    let scheduler = null;
    beforeEach(() => {
      scheduler = new Scheduler({robot, storeKey, job: DummyJob});
    });

    it('sync brain data', () => {
      const existsId = 9999999;
      const initData = {user, meta, pattern: '* 0 * * *'};
      const job = scheduler.createJob(initData);
      brainData = {[existsId]: {user, meta, pattern: '* 1 * * *'}};
      scheduler.syncBrain();
      assert.deepEqual(Object.keys(scheduler.jobs), [job.id, existsId]);
    });

    it('on brain.loaded', () => {
      const existsId = 9999999;
      const initData = {user, meta, pattern: '* 0 * * *'};
      const job = scheduler.createJob(initData);
      brainData = {[existsId]: {user, meta, pattern: '* 1 * * *'}};
      robot.brain.on.args[0][1]();
      assert.deepEqual(Object.keys(scheduler.jobs), [job.id, existsId]);
    });
  });
});

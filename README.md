# hubot-schedule-helper

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![DevDependency Status][daviddm-dev-image]][daviddm-dev-url]
[![License][license-image]][license-url]

Helper of Hubot Scripts for implementing schedule tasks.

You can implement scheduled tasks to your hubot scripts easily.
And, scheduled tasks are stored to "Hubot brain".


## Installation

```
npm install --save @moqada/hubot-schedule-helper
```


## Usage

See [example scripts](https://github.com/moqada/hubot-schedule-helper/blob/master/example/scripts/example.coffee).
More detail, see [API Document](https://moqada.github.io/hubot-schedule-helper/).

```coffee
{Scheduler, Job} = require '@moqada/hubot-schedule-helper'


# You must define your Job class extending Job

class AwesomeJob extends Job

  # You must implement exec method
  exec: (robot) ->
    envelope = @getEnvelope()
    {message} = @meta
    robot.send envelope, message


module.exports = (robot) ->
  scheduler = new Scheduler({robot, job: AwesomeJob})

  # Add scheduled job (send 'hello! hello!' at every 6 o'clock)
  robot.respond /add/i, (res) ->
    {user} = res.message
    meta = {message: 'hello! hello!'}
    pattern = '* 6 * * *'  # every 6 o'clock
    job = scheduler.createJob({pattern, user, meta})

  # Cancel target job
  robot.respond /cancel (\d+)$/i, (res) ->
    [id] = res.match.slice(1)
    scheduler.cancelJob(id)

  # List job
  robot.respond /list$/i, (res) ->
    msgs = []
    for job of scheduler.jobs
      msgs.push "#{job.id}: \"#{job.pattern}\" #{job.getRoom()} #{job.meta.message}"
    res.send msgs.join('\n')

  # Update target job
  robot.respond /update (\d+) (.+)$/i, (res) ->
    [id, message] = res.match.slice(1)
    meta = {message}
    scheduler.updateJob(id, meta)
```


## Related

This module's code is greatly inspired by [hubot-schdule](https://github.com/matsukaz/hubot-schedule).



[npm-url]: https://www.npmjs.com/package/@moqada/hubot-schedule-helper
[npm-image]: https://img.shields.io/npm/v/@moqada/hubot-schedule-helper.svg?style=flat-square
[travis-url]: https://travis-ci.org/moqada/hubot-schedule-helper
[travis-image]: https://img.shields.io/travis/moqada/hubot-schedule-helper.svg?style=flat-square
[daviddm-url]: https://david-dm.org/moqada/hubot-schedule-helper
[daviddm-image]: https://img.shields.io/david/moqada/hubot-schedule-helper.svg?style=flat-square
[daviddm-dev-url]: https://david-dm.org/moqada/hubot-schedule-helper#info=devDependencies
[daviddm-dev-image]: https://img.shields.io/david/dev/moqada/hubot-schedule-helper.svg?style=flat-square
[codecov-url]: https://codecov.io/github/moqada/hubot-schedule-helper
[codecov-image]: https://img.shields.io/codecov/c/github/moqada/hubot-schedule-helper.svg?style=flat-square
[license-url]: http://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/github/license/moqada/hubot-schedule-helper.svg?style=flat-square

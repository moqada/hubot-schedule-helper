# Description:
#   Example scripts for hubot-schedule-helper
#
# Commands:
#   hubot schedule add "<cron pattern>" <message> - Add Schedule
#   hubot schedule cancel <id> - Cancel Schedule
#   hubot schedule update <id> <message> - Update Schedule
#   hubot schedule list - List Schedule
{Scheduler, Job, JobNotFound, InvalidPattern} = require 'hubot-schedule-helper'

storeKey = 'hubot-schedule-helper-example:schedule'


class ExampleJob extends Job
  exec: (robot) ->
    robot.send @getEnvelope(), @meta.message



module.exports = (robot) ->
  scheduler = new Scheduler({robot, storeKey, job: ExampleJob})

  robot.respond /schedule add "(.+)" (.+)$/i, (res) ->
    [pattern, message] = res.match.slice(1)
    {user} = res.message
    try
      job = scheduler.createJob({pattern, user, meta: {message}})
      res.send "Created: #{job.id}"
    catch err
      if err.name is InvalidPattern.name
        return res.send 'invalid pattern!!!'
      res.send err.message

  robot.respond /schedule cancel (\d+)$/i, (res) ->
    [id] = res.match.slice(1)
    try
      scheduler.cancelJob id
      res.send "Canceled: #{id}"
    catch err
      if err.name is JobNotFound.name
        return res.send "Job not found: #{id}"
      res.send err

  robot.respond /schedule list$/i, (res) ->
    jobs = []
    for id, job of scheduler.jobs
      jobs.push "#{id}: \"#{job.pattern}\" ##{job.getRoom()} #{job.meta.message}"
    if jobs.length > 0
      return res.send jobs.join '\n'
    res.send 'No jobs'

  robot.respond /schedule update (\d+) (.+)$/i, (res) ->
    [id, message] = res.match.slice(1)
    try
      scheduler.updateJob id, {message}
      res.send "#{id}: Updated"
    catch err
      if err.name is JobNotFound.name
        return res.send "Job not found: #{id}"
      res.send err

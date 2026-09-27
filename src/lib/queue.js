import Bee from "bee-queue"
import redisConfig from "../config/redis.js"
import welcomeEmail from "../app/jobs/welcomeEmail.js"

const jobs = [welcomeEmail]

class Queue {
    constructor() {
        this.queues = {}

        this.init()
    }

    init() {
        jobs.forEach(({ key, handle }) => {
            this.queues[key] = {
                bee: new Bee(key, {
                    redis: redisConfig
                }),
                handle
            }
        })
    }

    add(queue, job) {
        return this.queues[queue].bee
            .createJob(job)
            .retries(3)
            .backoff("exponential", 5000)
            .save()
    }

    processQueue() {
        jobs.forEach(job => {
            const {bee, handle} = this.queues[job.key]

            bee
                .on("retrying", this.handleRetry)
                .on("failed", this.handleFailure)
                .process(handle)
        })
    }

    handleRetry(job, err) {
        console.warn(`Queue ${job.queue.name}: tentando de novo (${err.message})`)
    }

    handleFailure(job, err) {
        console.error(`Queue ${job.queue.name}: falha`, err)
    }
}

export default new Queue

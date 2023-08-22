import express from 'express'
import swaggerUi from 'swagger-ui-express'
import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet'
import { openAPI } from './openapi.js'
import { setupRouter } from './router.js'

/**
 * Get the origin resource policy
 * @param {string} origin
 * @returns {{ crossOriginResourcePolicy: { policy: string, directives: object } }}
 */
const getOriginResourcePolicy = (origin) => ({
  crossOriginResourcePolicy: {
    policy: origin === '*' ? 'cross-origin' : 'same-origin',
    directives: {
      // ...
      'require-trusted-types-for': ["'script'"]
    }
  }
})

/**
 * @typedef {import('express').Express} Express
 * @typedef {object} Controller
 * @property {object=} context
 * @property {object=} request
 * @property {object=} response
 * @property {object=} parameters
 * @property {object=} specification
 * @property {string=} url
 */

/**
 * Setup the server
 * @async
 * @param {object} params
 * @param {object} params.env
 * @param {object} params.openAPISpecification
 * @param {object} params.controllers
 * @param {string=} params.origin
 * @returns {Promise<{ app: Express; openAPISpecification: object }>}
 */
export const setupServer = async ({ env, openAPISpecification, controllers, origin = '*' }) => {
  const { api } = setupRouter({
    env,
    openAPISpecification,
    controllers
  })
  const corsOptions = {
    origin
  }
  api.init()
  const app = express()
  app.use(cors(corsOptions))
  app.use(compression())
  app.use(helmet(getOriginResourcePolicy(origin)))
  app.use(express.json())
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openAPISpecification))
  app.get('/api-docs', (_request, response) =>
    response.json(openAPISpecification)
  )
  app.use((request, response) =>
    api.handleRequest(request, request, response)
  )

  return { app, openAPISpecification }
}

export { openAPI }

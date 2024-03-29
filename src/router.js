import { OpenAPIBackend } from 'openapi-backend'
import addFormats from 'ajv-formats'
import { makeExpressCallback } from './express-callback.js'
import { operationIds } from './operation-ids.js'
import { notFound } from './handlers/not-found.js'
import { requestValidation } from './handlers/request-validation.js'
import { responseValidation } from './handlers/response-validation.js'
import { unauthorized } from './handlers/unauthorized.js'

/**
 * @typedef {import('./api.js').Logger} Logger
 * Setup the router
 * @param {object} params
 * @param {string=} params.secret
 * @param {object} params.openAPISpecification
 * @param {object} params.controllers
 * @param {string=} params.apiRoot
 * @param {boolean=} params.strictSpecification
 * @param {boolean=} params.errorDetails
 * @param {Logger=} params.logger
 * @param {object=} params.meta
 * @returns {{ api, openAPISpecification: object }}
 */
export const setupRouter = ({ secret, openAPISpecification, controllers, apiRoot, strictSpecification, errorDetails, logger, meta }) => {
  const api = new OpenAPIBackend({
    definition: openAPISpecification,
    apiRoot,
    strict: strictSpecification,
    customizeAjv: (originalAjv) => {
      addFormats(originalAjv)
      return originalAjv
    }
  })

  api.register({
    unauthorizedHandler: unauthorized,
    validationFail: requestValidation,
    notFound,
    postResponseHandler: responseValidation
  })

  operationIds({ specification: openAPISpecification }).forEach((operationId) => {
    if (!Object.hasOwn(controllers, operationId)) {
      return
    }
    api.register(
      operationId,
      makeExpressCallback({
        controller: controllers[operationId],
        specification: openAPISpecification,
        errorDetails,
        logger,
        meta
      })
    )
  })

  api.register('notImplemented', (context, request, response) => {
    const { mock } = context.api.mockResponseForOperation(
      context.operation.operationId
    )
    return mock
  })

  api.registerSecurityHandler(
    'apiKey',
    (context) => context.request.headers['x-api-key'] === secret
  )

  return { api, openAPISpecification }
}

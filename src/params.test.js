import test from 'node:test'
import assert from 'node:assert'
import { parseParams } from './params.js'

const TestCases = [
  {
    description: 'Parse params to the types defined in the spec',
    query: { page: '0', size: '10' },
    spec: [
      {
        name: 'size',
        required: false,
        in: 'query',
        example: 10,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 10000,
          default: 42
        }
      },
      {
        name: 'page',
        required: false,
        in: 'query',
        example: 0,
        schema: {
          type: 'integer',
          minimum: 0,
          default: 1
        }
      }
    ],
    expectedResult: {
      page: 0,
      size: 10
    }
  },
  {
    description: 'Get the default values from the schema if no query params are given',
    query: {},
    spec: [
      {
        name: 'size',
        required: false,
        in: 'query',
        example: 10,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 10000,
          default: 42
        }
      },
      {
        name: 'page',
        required: false,
        in: 'query',
        example: 0,
        schema: {
          type: 'integer',
          minimum: 0,
          default: 1
        }
      }
    ],
    expectedResult: {
      page: 1,
      size: 42
    }
  },
  {
    description: 'Get the example values from the schema if no query params are given',
    query: {},
    spec: [
      {
        name: 'size',
        required: false,
        in: 'query',
        example: 10,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 10000
        }
      },
      {
        name: 'page',
        required: false,
        in: 'query',
        example: 0,
        schema: {
          type: 'integer',
          minimum: 0
        }
      }
    ],
    expectedResult: {
      page: 0,
      size: 10
    }
  },
  {
    description: 'It should not throw if no query params are given',
    query: undefined,
    spec: [
      {
        name: 'size',
        required: false,
        in: 'query',
        example: 10,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 10000
        }
      },
      {
        name: 'page',
        required: false,
        in: 'query',
        example: 0,
        schema: {
          type: 'integer',
          minimum: 0
        }
      }
    ],
    expectedResult: {
      page: 0,
      size: 10
    }
  },
  {
    description: 'Parse mixed params to the types defined in the spec',
    query: { name: 'Pieter', ok: 'true' },
    spec: [
      {
        name: 'name',
        required: false,
        in: 'query',
        example: 10,
        schema: {
          type: 'string'
        }
      },
      {
        name: 'ok',
        required: false,
        in: 'query',
        example: 0,
        schema: {
          type: 'boolean'
        }
      }
    ],
    expectedResult: {
      name: 'Pieter',
      ok: true
    }
  }
]

test('Parse params', async (t) => {
  await Promise.all(
    TestCases.map(async ({ description, query, spec, expectedResult }) => {
      await t.test(description, () => {
        assert.deepEqual(
          parseParams({ query, spec }),
          expectedResult
        )
      })
    })
  )
})

/**
 * Centralized Swagger/OpenAPI schemas and helpers for consistent API documentation
 * This utility provides reusable schema definitions and response templates
 */

export const commonSchemas = {
  // Generic response schemas
  errorResponse: {
    type: "object",
    properties: {
      message: { type: "string", description: "Error message" },
      statusCode: { type: "integer", description: "HTTP status code" },
      timestamp: { type: "string", description: "Timestamp of error" },
    },
    required: ["message"],
  },

  successResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", description: "Operation success status" },
      message: { type: "string", description: "Success message" },
      data: { type: "object", description: "Response data" },
    },
  },

  // Authentication schemas
  email: {
    type: "string",
    format: "email",
    description: "User email address",
  },

  password: {
    type: "string",
    minLength: 8,
    description: "User password (minimum 8 characters)",
  },

  token: {
    type: "string",
    description: "JWT authentication token",
  },

  userId: {
    type: "string",
    description: "Unique user identifier",
  },

  // User object schema
  user: {
    type: "object",
    properties: {
      id: { type: "string" },
      email: { type: "string" },
      name: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  // Note object schema
  note: {
    type: "object",
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      content: { type: "string" },
      userId: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  // Pagination schema
  pagination: {
    type: "object",
    properties: {
      page: { type: "integer", minimum: 1 },
      limit: { type: "integer", minimum: 1 },
      total: { type: "integer" },
      pages: { type: "integer" },
    },
  },
};

export const commonResponses = {
  // 200 OK responses
  success200: {
    description: "Request successful",
    content: {
      "application/json": {
        schema: commonSchemas.successResponse,
      },
    },
  },

  // 201 Created response
  created201: {
    description: "Resource created successfully",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
  },

  // 400 Bad Request response
  badRequest400: {
    description: "Invalid input or bad request",
    content: {
      "application/json": {
        schema: commonSchemas.errorResponse,
      },
    },
  },

  // 401 Unauthorized response
  unauthorized401: {
    description: "Missing or invalid authentication token",
    content: {
      "application/json": {
        schema: commonSchemas.errorResponse,
      },
    },
  },

  // 403 Forbidden response
  forbidden403: {
    description: "Insufficient permissions",
    content: {
      "application/json": {
        schema: commonSchemas.errorResponse,
      },
    },
  },

  // 404 Not Found response
  notFound404: {
    description: "Resource not found",
    content: {
      "application/json": {
        schema: commonSchemas.errorResponse,
      },
    },
  },

  // 409 Conflict response
  conflict409: {
    description: "Resource conflict (e.g., already exists)",
    content: {
      "application/json": {
        schema: commonSchemas.errorResponse,
      },
    },
  },

  // 429 Too Many Requests
  tooManyRequests429: {
    description: "Too many requests, rate limit exceeded",
    content: {
      "application/json": {
        schema: commonSchemas.errorResponse,
      },
    },
  },

  // 500 Internal Server Error response
  internalServerError500: {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: commonSchemas.errorResponse,
      },
    },
  },
};

export const bearerSecurity = [
  {
    BearerAuth: [],
  },
];

export const noSecurity = [];

/**
 * Helper function to generate parameter schema for path IDs
 * @param {string} paramName - Parameter name
 * @param {string} description - Parameter description
 * @returns {object} Parameter schema
 */
export const pathParam = (paramName, description) => ({
  in: "path",
  name: paramName,
  required: true,
  schema: { type: "string" },
  description,
});

/**
 * Helper function to generate query parameter schema
 * @param {string} paramName - Parameter name
 * @param {string} type - Parameter type
 * @param {string} description - Parameter description
 * @param {boolean} required - Is parameter required
 * @returns {object} Parameter schema
 */
export const queryParam = (
  paramName,
  type = "string",
  description,
  required = false
) => ({
  in: "query",
  name: paramName,
  required,
  schema: { type },
  description,
});

/**
 * Helper function to create request body with schema
 * @param {object} schema - Schema object
 * @param {boolean} required - Is body required
 * @returns {object} Request body schema
 */
export const requestBody = (schema, required = true) => ({
  required,
  content: {
    "application/json": {
      schema,
    },
  },
});

/**
 * Helper to create response with data schema
 * @param {object} dataSchema - Data schema
 * @param {string} description - Response description
 * @returns {object} Response schema
 */
export const successResponseWithData = (
  dataSchema,
  description = "Success"
) => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          data: dataSchema,
        },
      },
    },
  },
});

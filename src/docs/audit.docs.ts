/**
 * @swagger
 * /audit/logs:
 *   get:
 *     summary: Retrieve all audit logs
 *     description: Fetches all audit logs from the database and returns them in a paginated response.
 *     tags:
 *       - Audit Logs
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *         example: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *         example: desc
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter audit logs
 *         example: "login"
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter logs by property ID
 *         example: "property_123"
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter logs by user ID
 *         example: "user_456"
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter logs by user role
 *         example: "admin"
 *     responses:
 *       200:
 *         description: Successfully retrieved audit logs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *             examples:
 *               success:
 *                 summary: Example response
 *                 value:
 *                   data:
 *                     - id: "log_1"
 *                       action: "login"
 *                       userId: "user_456"
 *                       propertyId: "property_123"
 *                       role: "admin"
 *                       createdAt: "2024-06-01T12:00:00Z"
 *                   metadata:
 *                     page: 1
 *                     size: 10
 *                     total: 100
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             examples:
 *               error:
 *                 summary: Error response
 *                 value:
 *                   message: "Internal server error."
 */

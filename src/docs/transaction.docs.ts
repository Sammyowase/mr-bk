/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Retrieve all transactions
 *     description: Fetches all transactions with optional pagination, sorting, search, and date/property filtering
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort the results by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sorting order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter transactions
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter by specific property ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions up to this date (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter transactions by status
 *       - in: query
 *         name: download
 *         schema:
 *           type: string
 *         description: Flag to trigger export/download (e.g. "csv")
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *             examples:
 *               success:
 *                 summary: Example success response
 *                 value:
 *                   data:
 *                     - id: "1"
 *                       amount: 100.0
 *                       type: "credit"
 *                       date: "2024-06-01"
 *                       description: "Payment received"
 *                     - id: "2"
 *                       amount: 50.0
 *                       type: "debit"
 *                       date: "2024-06-02"
 *                       description: "Purchase"
 *                   metadata:
 *                     totalItems: 2
 *                     totalPages: 1
 *                     currentPage: 1
 *                     pageSize: 10
 *       400:
 *         description: Bad request. Invalid parameters or filters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid query parameters
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * /houses/{id}:
 *   post:
 *     summary: Create a new house
 *     description: This endpoint allows the creation of a new house under a specific property.
 *     tags:
 *       - Houses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the property to which the house belongs.
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the house.
 *               type:
 *                 type: string
 *                 description: The type of the house. Must be one of the predefined house types.
 *               address:
 *                 type: string
 *                 description: The address of the house (optional).
 *     responses:
 *       200:
 *         description: House created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: House created successfully
 *                 data:
 *                   type: object
 *                   description: The newly created house object.
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Error message describing the issue.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * /houses/{id}/resident:
 *   get:
 *     summary: Retrieve residents of a specific house.
 *     description: Fetches all residents that belong to a house identified by the provided house ID.
 *     tags:
 *       - Houses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the house to fetch residents for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched house residents.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: House resident fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       houseId:
 *                         type: string
 *                         example: "123"
 *       400:
 *         description: House ID is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: House ID is required
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

/**
 * @swagger
 * /houses/{id}:
 *   get:
 *     summary: Retrieve houses associated with a specific property.
 *     description: Fetches all houses that belong to a property identified by the provided property ID.
 *     tags:
 *       - Houses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the property to fetch houses for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched houses.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Houses fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       name:
 *                         type: string
 *                         example: "House A"
 *                       propertyId:
 *                         type: string
 *                         example: "123"
 *       400:
 *         description: Property ID is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property ID is required
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

/**
 * @swagger
 * /houses/{houseId}:
 *   patch:
 *     summary: Update a house by ID
 *     description: Updates a house's details by its ID. Only accessible by super_admin and admin roles.
 *     tags:
 *       - Houses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: houseId
 *         required: true
 *         description: The ID of the house to update
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the house
 *               type:
 *                 type: string
 *                 description: The type of house
 *                 enum: [flat, duplex, bungalow, mansion, apartment]
 *               address:
 *                 type: string
 *                 description: The address of the house
 *     responses:
 *       200:
 *         description: House updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: House updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345"
 *                     name:
 *                       type: string
 *                       example: "Block A, Flat 2"
 *                     type:
 *                       type: string
 *                       example: "flat"
 *                     address:
 *                       type: string
 *                       example: "123 Main Street"
 *                     propertyId:
 *                       type: string
 *                       example: "67890"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       404:
 *         description: House not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: House not found
 *       409:
 *         description: Conflict - house name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: House with the name Block A, Flat 2 already exists
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */

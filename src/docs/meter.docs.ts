/**
 * @swagger
 * /meter/all:
 *   get:
 *     summary: Fetch all meters with their associated houses, properties, and owners.
 *     description: Retrieves all meters with their associated houses, properties, and owners. Only accessible by super_admin, admin, and manager roles.
 *     tags:
 *       - Meters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Meters fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Meters fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "12345"
 *                       number:
 *                         type: string
 *                         example: "987654321"
 *                       name:
 *                         type: string
 *                         example: "Main Meter"
 *                       House:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "house123"
 *                           name:
 *                             type: string
 *                             example: "Block A, Unit 101"
 *                           address:
 *                             type: string
 *                             example: "123 Main Street"
 *                       Property:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "property456"
 *                           name:
 *                             type: string
 *                             example: "Sunshine Estate"
 *                           type:
 *                             type: string
 *                             example: "estate"
 *                       Owner:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "user789"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           email:
 *                             type: string
 *                             example: "john.doe@example.com"
 *                           role:
 *                             type: string
 *                             example: "tenant"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /meter:
 *   get:
 *     summary: Fetch the meter number associated with the authenticated user.
 *     description: Retrieves the meter number for the user based on their ID. If no meter is found, a 404 response is returned.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Meter number fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Meter number fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345"
 *                     ownerId:
 *                       type: string
 *                       example: "67890"
 *                     meterNumber:
 *                       type: string
 *                       example: "987654321"
 *       404:
 *         description: Meter not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Meter not found
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
 * /meter/{meterId}:
 *   patch:
 *     summary: Update a meter by ID
 *     description: Updates a meter's details by its ID. Only accessible by super_admin, admin, and manager roles.
 *     tags:
 *       - Meters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meterId
 *         required: true
 *         description: The ID of the meter to update
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
 *               type:
 *                 type: string
 *                 description: The type of meter
 *                 enum: [three_dual, single_phase, three_phase]
 *               name:
 *                 type: string
 *                 description: The name of the meter
 *               price:
 *                 type: number
 *                 description: The price associated with the meter
 *               vat:
 *                 type: number
 *                 description: The VAT percentage for the meter
 *               status:
 *                 type: string
 *                 description: The status of the meter
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: Meter updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Meter updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345"
 *                     type:
 *                       type: string
 *                       example: "three_dual"
 *                     name:
 *                       type: string
 *                       example: "Main Meter"
 *                     number:
 *                       type: string
 *                       example: "987654321"
 *                     price:
 *                       type: number
 *                       example: 100.50
 *                     vat:
 *                       type: number
 *                       example: 7.5
 *                     status:
 *                       type: string
 *                       example: "active"
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
 *         description: Meter not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Meter not found
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /meter/property/{propertyId}:
 *   get:
 *     summary: Get all meters associated with a specific property
 *     description: Retrieves all meters associated with a specific property, including their house and owner details. Only accessible by super_admin, admin, and manager roles.
 *     tags:
 *       - Meters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         description: The ID of the property to get meters for
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Meters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Meters retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "12345"
 *                       number:
 *                         type: string
 *                         example: "987654321"
 *                       name:
 *                         type: string
 *                         example: "Main Meter"
 *                       type:
 *                         type: string
 *                         example: "three_dual"
 *                       price:
 *                         type: number
 *                         example: 100.50
 *                       vat:
 *                         type: number
 *                         example: 7.5
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       propertyId:
 *                         type: string
 *                         example: "property456"
 *                       House:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "house123"
 *                           name:
 *                             type: string
 *                             example: "Block A, Unit 101"
 *                           address:
 *                             type: string
 *                             example: "123 Main Street"
 *                       Owner:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "user789"
 *                           firstName:
 *                             type: string
 *                             example: "John"
 *                           lastName:
 *                             type: string
 *                             example: "Doe"
 *                           userName:
 *                             type: string
 *                             example: "johndoe"
 *                           email:
 *                             type: string
 *                             example: "john.doe@example.com"
 *                           phone:
 *                             type: string
 *                             example: "+1234567890"
 *       400:
 *         description: Bad request - Property ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property ID is required
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /meter/search:
 *   get:
 *     summary: Search for meters based on user, property, or house information
 *     description: Searches for meters based on a search term that can match user, property, or house information. Only accessible by super_admin, admin, and manager roles.
 *     tags:
 *       - Meters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: The search term to look for in meter, user, property, or house data
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Meters retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "12345"
 *                       number:
 *                         type: string
 *                         example: "987654321"
 *                       name:
 *                         type: string
 *                         example: "Main Meter"
 *                       type:
 *                         type: string
 *                         example: "three_dual"
 *                       price:
 *                         type: number
 *                         example: 100.50
 *                       vat:
 *                         type: number
 *                         example: 7.5
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       propertyId:
 *                         type: string
 *                         example: "property456"
 *                       House:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "house123"
 *                           name:
 *                             type: string
 *                             example: "Block A, Unit 101"
 *                           address:
 *                             type: string
 *                             example: "123 Main Street"
 *                       Property:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "property456"
 *                           name:
 *                             type: string
 *                             example: "Sunshine Estate"
 *                           address:
 *                             type: string
 *                             example: "456 Park Avenue"
 *                       Owner:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "user789"
 *                           firstName:
 *                             type: string
 *                             example: "John"
 *                           lastName:
 *                             type: string
 *                             example: "Doe"
 *                           userName:
 *                             type: string
 *                             example: "johndoe"
 *                           email:
 *                             type: string
 *                             example: "john.doe@example.com"
 *                           phone:
 *                             type: string
 *                             example: "+1234567890"
 *       400:
 *         description: Bad request - Search term is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Search term is required
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */

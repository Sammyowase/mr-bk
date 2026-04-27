/**
 * @swagger
 * /properties/managers:
 *   post:
 *     summary: Add a new property manager
 *     description: This endpoint allows an authenticated user to add a new property manager to a property. The user must provide the required fields such as `propertyId` and `managerId`.
 *     tags:
 *       - Properties
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - email
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: The ID of the property.
 *               email:
 *                 type: string
 *                 description: The email of the manager to be added.
 *     responses:
 *       200:
 *         description: Property manager added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property manager added successfully
 *                 data:
 *                   type: object
 *                   description: The details of the property manager assignment.
 *       400:
 *         description: Bad request. Missing required fields or manager already assigned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields
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
 * /properties:
 *   post:
 *     summary: Create a new property
 *     description: This endpoint allows an authenticated user to create a new property. The user must provide the required fields such as `name` and `address`. Optional fields include `type`, `city`, `state`, `country`, `tarrif`, and `tax`.
 *     tags:
 *       - Properties
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the property.
 *               type:
 *                 type: string
 *                 description: The type of the property (e.g., ESTATE, APARTMENT).
 *               address:
 *                 type: string
 *                 description: The address of the property.
 *               city:
 *                 type: string
 *                 description: The city where the property is located.
 *               state:
 *                 type: string
 *                 description: The state where the property is located.
 *               country:
 *                 type: string
 *                 description: The country where the property is located.
 *               tarrif:
 *                 type: number
 *                 description: The tariff rate for the property.
 *               tax:
 *                 type: number
 *                 description: The tax rate for the property.
 *     responses:
 *       200:
 *         description: Property created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property created successfully
 *                 data:
 *                   type: object
 *                   description: The newly created property details.
 *       400:
 *         description: Bad request. Missing required fields or property already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields
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
 * /properties/{id}:
 *   delete:
 *     summary: Delete a property by ID
 *     description: Deletes a property from the database using the provided property ID.
 *     tags:
 *       - Properties
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the property to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property deleted successfully
 *       400:
 *         description: Bad request. Property ID is missing or property not found.
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
 * /properties:
 *   get:
 *     summary: Retrieve all properties
 *     description: Fetches all properties, with optional pagination, sorting, and search.
 *     tags:
 *       - Properties
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
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter properties
 *     responses:
 *       200:
 *         description: Successfully retrieved properties.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /properties/{propertyId}/residents:
 *   get:
 *     summary: Retrieve residents of a property
 *     description: Fetches all residents associated with a specific property.
 *     tags:
 *       - Properties
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the property
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
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter residents
 *       - in: query
 *         name: download
 *         schema:
 *           type: string
 *         description: Download option for residents data
 *     responses:
 *       200:
 *         description: Successfully retrieved property residents.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resident'
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /properties/{propertyId}/residents/transactions:
 *   get:
 *     summary: Retrieve transactions of property residents
 *     description: Fetches all transactions associated with residents of a specific property.
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the property
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
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter transactions
 *     responses:
 *       200:
 *         description: Successfully retrieved property residents' transactions.
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
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /properties/{propertyId}/overview:
 *   get:
 *     summary: Retrieve property overview
 *     description: Fetches the overview of a specific property by its ID.
 *     tags:
 *       - Properties
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the property to retrieve the overview for.
 *     responses:
 *       200:
 *         description: Successfully retrieved property overview.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyOverview'
 *       404:
 *         description: Property not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /properties/overview/manager:
 *   get:
 *     summary: Retrieve property overview by manager ID
 *     description: Fetches the overview of properties managed by the authenticated manager.
 *     tags:
 *       - Properties
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved property overview for manager.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyOverview'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /properties/overview/security:
 *   get:
 *     summary: Retrieve property overview by security ID
 *     description: Fetches the overview of properties managed by the authenticated security.
 *     tags:
 *       - Properties
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved property overview for security.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyOverview'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /properties/{id}:
 *   patch:
 *     summary: Update an existing property
 *     description: Updates the details of a property by its ID. If a field is not provided in the request body, the existing value will be retained.
 *     tags:
 *       - Properties
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the property to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the property
 *               type:
 *                 type: string
 *                 description: The type of the property
 *               address:
 *                 type: string
 *                 description: The address of the property
 *               city:
 *                 type: string
 *                 description: The city where the property is located
 *               state:
 *                 type: string
 *                 description: The state where the property is located
 *               country:
 *                 type: string
 *                 description: The country where the property is located
 *               author:
 *                 type: string
 *                 description: The author or owner of the property
 *     responses:
 *       200:
 *         description: Property updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property updated successfully
 *                 data:
 *                   type: object
 *                   description: The updated property details
 *       400:
 *         description: Bad request, such as missing property ID or property not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Property ID is required
 *       500:
 *         description: Internal server error
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
 * components:
 *   schemas:
 *     ToggleVendingSuspensionRequest:
 *       type: object
 *       required:
 *         - isVendingSuspended
 *       properties:
 *         isVendingSuspended:
 *           type: boolean
 *           description: Whether to suspend vending (true) or allow it (false)
 *
 * /properties/{id}/toggle-vending-suspension:
 *   put:
 *     summary: Toggle vending suspension for an estate
 *     description: Suspends or resumes vending operations for a specific estate
 *     tags:
 *       - Properties
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToggleVendingSuspensionRequest'
 *     responses:
 *       200:
 *         description: Vending suspension status updated successfully
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
 *                   example: Vending has been suspended for this estate
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/Property'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     PaginationMetadata:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: The current page number
 *         size:
 *           type: integer
 *           description: The number of items per page
 *         total:
 *           type: integer
 *           description: The total number of items available
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Response:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: The status of the response (success or error)
 *         message:
 *           type: string
 *           description: A message providing additional information about the response
 *         error:
 *           type: boolean
 *           description: Indicates if there was an error in the request
 *         data:
 *           type: object
 *           description: The data returned from the request, if any
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PropertyOverview:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the property
 *         name:
 *           type: string
 *           description: Name of the property
 *         type:
 *           type: string
 *           description: Type of the property
 *         address:
 *           type: string
 *           description: Address of the property
 *         city:
 *           type: string
 *           description: City of the property
 *         state:
 *           type: string
 *           description: State of the property
 *         country:
 *           type: string
 *           description: Country of the property
 *         tarrif:
 *           type: number
 *           description: Tarrif of the property
 *         tax:
 *           type: number
 *           description: Tax of the property
 *         managerId:
 *           type: string
 *           description: Unique identifier of the property manager
 *         minVend:
 *           type: number
 *           description: Minimum vend of the property
 *         maxVend:
 *           type: number
 *           description: Maximum vend of the property
 *         authorId:
 *           type: string
 *           description: Unique identifier of the user who created the property
 *         auditRef:
 *           type: string
 *           description: Audit reference of the property
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time the property was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time the property was last updated
 *         totalUnits:
 *           type: number
 *           description: Total units of the property
 *         totalMeters:
 *           type: number
 *           description: Total meters of the property
 *         totalOccupiedUnits:
 *           type: number
 *           description: Total occupied units of the property
 *         totalActiveMeters:
 *           type: number
 *           description: Total active meters of the property
 *         totalActiveUsers:
 *           type: number
 *           description: Total active users of the property
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the transaction
 *         userId:
 *           type: string
 *           description: Unique identifier of the user who made the transaction
 *         propertyId:
 *           type: string
 *           description: Unique identifier of the property where the transaction was made
 *         houseId:
 *           type: string
 *           description: Unique identifier of the house where the transaction was made
 *         meterNumber:
 *           type: string
 *           description: Meter number of the transaction
 *         amount:
 *           type: number
 *           description: Amount of the transaction
 *         token:
 *           type: string
 *           description: Token of the transaction
 *         units:
 *           type: string
 *           description: Units of the transaction
 *         trxnRef:
 *           type: string
 *           description: Transaction reference of the transaction
 *         trxnPayload:
 *           type: string
 *           description: Transaction payload of the transaction
 *         tokenPayload:
 *           type: string
 *           description: Token payload of the transaction
 *         status:
 *           type: string
 *           description: Status of the transaction
 *         channel:
 *           type: string
 *           description: Channel of the transaction
 *         type:
 *           type: string
 *           description: Type of the transaction
 *         category:
 *           type: string
 *           description: Category of the transaction
 *         remark:
 *           type: string
 *           description: Remark of the transaction
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time the transaction was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time the transaction was last updated
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Resident:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the resident
 *         firstName:
 *           type: string
 *           description: First name of the resident
 *         lastName:
 *           type: string
 *           description: Last name of the resident
 *         userName:
 *           type: string
 *           description: Username of the resident
 *         password:
 *           type: string
 *           description: Password of the resident
 *         email:
 *           type: string
 *           description: Email of the resident
 *         phone:
 *           type: string
 *           description: Phone of the resident
 *         role:
 *           type: string
 *           description: Role of the resident
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time the resident was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time the resident was last updated
 */

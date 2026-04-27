/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the user
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         userName:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone:
 *           type: string
 *           description: User's phone number
 *         role:
 *           type: string
 *           enum: [security, admin, manager, user, houseowner, super_admin]
 *           description: User's role in the system
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: User creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: User last update timestamp
 *     Users:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the user
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         userName:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone:
 *           type: string
 *           description: User's phone number
 *         role:
 *           type: string
 *           enum: [security, admin, manager, user, houseowner, super_admin]
 *           description: User's role in the system
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: User creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: User last update timestamp
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
 *         totalPages:
 *           type: integer
 *           description: The total number of pages
 *         hasNextPage:
 *           type: boolean
 *           description: Whether there are more pages available
 *
 * /users/add-meter:
 *   post:
 *     summary: Add a new meter to a user
 *     description: This endpoint allows adding a new meter to a user by providing the property ID, house ID, email, and meter number.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - houseId
 *               - number
 *               - email
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: The ID of the property.
 *               houseId:
 *                 type: string
 *                 description: The ID of the house.
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *               number:
 *                 type: string
 *                 description: The meter number.
 *     responses:
 *       200:
 *         description: Successfully created a new meter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Creating new meter
 *                 data:
 *                   type: object
 *                   description: The created meter data.
 *       400:
 *         description: Bad request due to missing required fields or other validation errors.
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
 * /users/transactions:
 *   get:
 *     summary: Retrieve all transactions for the authenticated user
 *     description: Fetches all transactions associated with the authenticated user's ID.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transactions fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "12345"
 *                       amount:
 *                         type: number
 *                         example: 100.50
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T12:00:00Z"
 *                       description:
 *                         type: string
 *                         example: "Payment for services"
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
 * /users/{id}:
 *   patch:
 *     summary: Update user details.
 *     description: Update the details of an existing user by user ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               userName:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User details updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User details updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
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
 *   get:
 *     summary: Get user details.
 *     description: Get the details of an existing user by user ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID.
 *     responses:
 *       200:
 *         description: User details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User details retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
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
 *   delete:
 *     summary: Delete user account.
 *     description: Delete user account by user ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID.
 *     responses:
 *       200:
 *         description: User account deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User account deleted successfully
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
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
 * /users/resident/{userId}:
 *   get:
 *     summary: Get comprehensive resident details
 *     description: Retrieves detailed information about a resident including user details, property, house, and meter information.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The resident user ID
 *     responses:
 *       200:
 *         description: Resident details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Resident details retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     property:
 *                       type: object
 *                       nullable: true
 *                       description: Property details if available
 *                     house:
 *                       type: object
 *                       nullable: true
 *                       description: House details if available
 *                     meter:
 *                       type: object
 *                       nullable: true
 *                       description: Meter details if available
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
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
 *
 * /users/resident:
 *   get:
 *     summary: Get comprehensive resident details by query parameter
 *     description: Retrieves detailed information about a resident including user details, property, house, and meter information using residentId as a query parameter. The residentId should be the Owner.id value from the /properties/{propertyId}/residents endpoint response.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: residentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The resident ID (Owner.id from the property residents endpoint response)
 *     responses:
 *       200:
 *         description: Resident details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Resident details retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     property:
 *                       type: object
 *                       nullable: true
 *                       description: Property details if available
 *                     house:
 *                       type: object
 *                       nullable: true
 *                       description: House details if available
 *                     meter:
 *                       type: object
 *                       nullable: true
 *                       description: Meter details if available
 *       400:
 *         description: Bad request - Missing or invalid resident ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Resident ID is required as a query parameter
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Resident not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error retrieving resident details
 *
 * /users/profile/me:
 *   patch:
 *     summary: Update user details.
 *     description: Update the details of an existing user by user ID.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User details updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User details updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
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
 * /users/restore/{id}:
 *   patch:
 *     summary: Restore user account (Admin).
 *     description: Restore user account by user ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID.
 *     responses:
 *       200:
 *         description: User account restored successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User account restored successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
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
 * /users/login:
 *   post:
 *     summary: User login
 *     description: Allows users to log in using their phone number, email, or username.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Phone number, email, or username of the user.
 *               password:
 *                 type: string
 *                 description: Password of the user.
 *     responses:
 *       200:
 *         description: Login successful.
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid credentials.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user and send an OTP for email verification.
 *     description: This endpoint registers a new user by validating the required fields, generating an OTP, and sending it to the user's email for verification.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - password
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the user.
 *               lastName:
 *                 type: string
 *                 description: The last name of the user.
 *               userName:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password for the user account.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               phone:
 *                 type: string
 *                 description: The phone number of the user.
 *               role:
 *                 type: string
 *                 description: The role of the user (e.g., admin, user).
 *     responses:
 *       200:
 *         description: OTP sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *       400:
 *         description: Missing required fields or invalid input.
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
 * /users/verify-otp:
 *   post:
 *     summary: Verify OTP and create a new user
 *     description: This endpoint verifies the OTP sent to the user's email. If the OTP is valid and not expired, a new user is created in the system.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - email
 *             properties:
 *               otp:
 *                 type: string
 *                 description: The OTP sent to the user's email.
 *               email:
 *                 type: string
 *                 description: The email address associated with the OTP.
 *     responses:
 *       200:
 *         description: OTP verified successfully and user created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *                 data:
 *                   type: object
 *                   description: The newly created user object.
 *       400:
 *         description: Bad request due to missing fields, incorrect OTP, or expired OTP.
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
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     description: Fetches all users, with optional pagination, sorting, and search.
 *     tags:
 *       - Users
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
 *         description: Search term to filter users
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users up to this date (YYYY-MM-DD)
 *       - in: query
 *         name: download
 *         schema:
 *           type: boolean
 *         description: If true, returns data as a downloadable file
 *     responses:
 *       200:
 *         description: Successfully retrieved users.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Users'
 *                     metadata:
 *                       $ref: '#/components/schemas/PaginationMetadata'
 *                 - type: array
 *                   description: Direct array of users when download=true
 *                   items:
 *                     $ref: '#/components/schemas/Users'
 *       500:
 *         description: Internal server error.
 */

//  * /users/role:
//  *   patch:
//  *     summary: Assign security role to a user
//  *     description: Assigns a security role to a user for access control management.
//  *     tags:
//  *       - Users
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - userId
//  *             properties:
//  *               userId:
//  *                 type: string
//  *                 format: uuid
//  *                 description: ID of the user to assign security role
//  *               propertyId:
//  *                 type: string
//  *                 format: uuid
//  *                 description: ID of the property (optional)
//  *               houseId:
//  *                 type: string
//  *                 format: uuid
//  *                 description: ID of the house (optional)
//  *     responses:
//  *       200:
//  *         description: Security role assigned successfully.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 message:
//  *                   type: string
//  *                   example: Security role assigned successfully
//  *                 error:
//  *                   type: boolean
//  *                   example: false
//  *                 data:
//  *                   $ref: '#/components/schemas/User'
//  *       400:
//  *         description: Bad request - Validation errors.
//  *       401:
//  *         description: Unauthorized - Invalid or missing token.
//  *       403:
//  *         description: Forbidden - Only admins and super admins can assign security roles.
//  *       404:
//  *         description: Not found - User, property, or house not found.
//  *       500:
//  *         description: Internal server error.
//  *

/**
 * @swagger
 * /users/invite:
 *   post:
 *     summary: Invite user
 *     description: Invite a user to register and assign a security role.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - propertyId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user to invite
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the property
 *     responses:
 *       200:
 *         description: Invitation sent successfully.
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
 *                   example: Invitation sent successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Bad request - Validation errors.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       403:
 *         description: Forbidden - Only facility manager, admins and super admins can invite users.
 *       404:
 *         description: Not found - Property not found.
 *       500:
 *         description: Internal server error.
 *
 * /users/complete-registration:
 *   post:
 *     summary: Complete registration
 *     description: Complete registration by providing the verification code sent to the user's email.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - firstName
 *               - lastName
 *               - phone
 *               - token
 *             properties:
 *               password:
 *                 type: string
 *                 description: Password of the user to complete registration
 *               firstName:
 *                 type: string
 *                 description: First name of the user to complete registration
 *               lastName:
 *                 type: string
 *                 description: Last name of the user to complete registration
 *               phone:
 *                 type: string
 *                 description: Phone number of the user to complete registration
 *               token:
 *                 type: string
 *                 description: Verification token sent to the user's email
 *     responses:
 *       200:
 *         description: Registration completed successfully.
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
 *                   example: Registration completed successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Validation errors.
 *       500:
 *         description: Internal server error.
 */

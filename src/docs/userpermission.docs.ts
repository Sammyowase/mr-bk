/**
 * @swagger
 * /user-permissions/restricted-users:
 *   get:
 *     summary: Retrieve all restricted users
 *     description: Fetches all restricted users, with optional pagination, sorting, search, restrictionId, and userId.
 *     tags:
 *       - Permissions
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
 *         name: restrictionId
 *         schema:
 *           type: string
 *         description: Restriction ID to filter users
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID to filter users
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Property ID to filter users
 *     responses:
 *       200:
 *         description: Successfully retrieved restricted users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RestrictedUser'
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /user-permissions/restrictions:
 *   get:
 *     summary: Retrieve all restrictions
 *     tags:
 *       - Permissions
 *     responses:
 *       200:
 *         description: All restrictions retrieved successfully
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
 *                   example: All restrictions retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Restriction object
 */

/**
 * @swagger
 * /user-permissions/remove-restriction:
 *   post:
 *     summary: Remove a restriction from a user
 *     description: Removes a specific restriction type from a user by userId. Requires authentication.
 *     tags:
 *       - Permissions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - restrictionType
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to remove the restriction from.
 *               restrictionType:
 *                 type: string
 *                 description: The type of restriction to remove.
 *     responses:
 *       200:
 *         description: Restriction removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restriction removed successfully
 *                 data:
 *                   type: object
 *                   description: The updated user permission details.
 *       400:
 *         description: Bad request. Missing required fields or invalid restriction type.
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
 * /user-permissions/restrictions/{restrictionId}:
 *   delete:
 *     summary: Remove a restriction from a user permission
 *     description: This endpoint allows an authenticated user i.e admin to remove a specific restriction by its ID from user permissions.
 *     tags:
 *       - Permissions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restrictionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the restriction to remove.
 *     responses:
 *       200:
 *         description: Restrictions removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Restrictions removed successfully
 *       400:
 *         description: Bad request. Invalid restriction ID or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid restriction ID
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
 * /user-permissions/{userId}/remove-restrictions:
 *   delete:
 *     summary: Remove all restrictions from a user
 *     description: Removes all permission restrictions for the specified user.
 *     tags:
 *       - Permissions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose restrictions are to be removed.
 *     responses:
 *       200:
 *         description: All user restrictions removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All user restrictions removed successfully
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid user ID
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
 * /user-permissions/restrict:
 *   post:
 *     summary: Restrict a user
 *     description: Restrict a user's permissions or access within the system.
 *     tags:
 *       - Permissions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RestrictUserDto'
 *     responses:
 *       200:
 *         description: User restricted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User restricted successfully
 *                 data:
 *                   type: object
 *                   description: The result of the restriction operation.
 *       400:
 *         description: Bad request. Invalid input or user cannot be restricted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input
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

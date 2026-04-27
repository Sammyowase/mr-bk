/**
 * @swagger
 * components:
 *   schemas:
 *     EngagementType:
 *       type: string
 *       enum: [discussion, poll, announcement]
 *       description: Type of engagement post
 *
 *     InteractionType:
 *       type: string
 *       enum: [comment, vote]
 *       description: Type of interaction on an engagement post
 *
 *     EngagementPost:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the engagement post
 *         title:
 *           type: string
 *           description: Title of the engagement post
 *         content:
 *           type: string
 *           description: Content/body of the post
 *         type:
 *           $ref: '#/components/schemas/EngagementType'
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Options when the post type is a poll
 *         audienceType:
 *           type: string
 *           enum: [all, building, property, unit, house, user, role]
 *           description: Target audience type
 *         audienceIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: IDs of targeted audience
 *         createdBy:
 *           type: string
 *           format: uuid
 *           description: ID of the user who created the post
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     EngagementWithInteractions:
 *       allOf:
 *         - $ref: '#/components/schemas/EngagementPost'
 *         - type: object
 *           properties:
 *             interactionCount:
 *               type: integer
 *               description: Number of interactions on this post
 *             userInteracted:
 *               type: boolean
 *               description: Whether the current user has interacted with this post
 *
 *     CreateEngagementDto:
 *       type: object
 *       required: [title, content, type, audienceType, audienceIds]
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 150
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 2000
 *         type:
 *           $ref: '#/components/schemas/EngagementType'
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Options when type is poll
 *         audienceType:
 *           type: string
 *           enum: [all, building, property, unit, house, user, role]
 *         audienceIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     UpdateEngagementDto:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     EngagementInteraction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         postId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         interactionType:
 *           $ref: '#/components/schemas/InteractionType'
 *         content:
 *           type: string
 *           description: Comment content or selected option
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     CreateInteractionDto:
 *       type: object
 *       required: [interactionType]
 *       properties:
 *         interactionType:
 *           $ref: '#/components/schemas/InteractionType'
 *         content:
 *           type: string
 *           description: Comment text or selected option (for poll)
 *
 * tags:
 *   - name: Engagement
 *     description: Engagement posts and interactions management endpoints
 *
 * /engagement:
 *   get:
 *     summary: Get engagement posts for the current user
 *     description: Retrieves engagement posts available to the authenticated admin/manager user with interaction metadata.
 *     tags:
 *       - Engagement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of posts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of posts to skip for pagination
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
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
 *                   example: Engagement posts retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EngagementWithInteractions'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new engagement post
 *     description: Creates a new engagement post (admin and manager roles only).
 *     tags:
 *       - Engagement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEngagementDto'
 *     responses:
 *       201:
 *         description: Engagement post created successfully
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
 *                   example: Engagement post created successfully
 *                 data:
 *                   $ref: '#/components/schemas/EngagementPost'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 * /engagement/{id}:
 *   get:
 *     summary: Get a specific engagement post by ID
 *     tags:
 *       - Engagement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Engagement post retrieved successfully
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
 *                   example: Engagement post retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/EngagementPost'
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update an existing engagement post
 *     tags:
 *       - Engagement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEngagementDto'
 *     responses:
 *       200:
 *         description: Engagement post updated successfully
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
 *                   example: Engagement post updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/EngagementPost'
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete an engagement post
 *     tags:
 *       - Engagement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Engagement post deleted successfully
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 * /engagement/{id}/interactions:
 *   get:
 *     summary: Get interactions for a specific engagement post
 *     tags:
 *       - Engagement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Interactions retrieved successfully
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
 *                   example: Engagement interactions retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EngagementInteraction'
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new interaction for a specific engagement post
 *     tags:
 *       - Engagement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInteractionDto'
 *     responses:
 *       201:
 *         description: Engagement interaction created successfully
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
 *                   example: Engagement interaction created successfully
 *                 data:
 *                   $ref: '#/components/schemas/EngagementInteraction'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

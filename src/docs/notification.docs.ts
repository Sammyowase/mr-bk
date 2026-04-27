/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationPreferenceWithUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the notification preference
 *         userId:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the User
 *         email:
 *           type: boolean
 *         sms:
 *           type: boolean
 *         push:
 *           type: boolean
 *         inApp:
 *           type: boolean
 *         newsletter:
 *           type: boolean
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Notification preference last update timestamp
 *         User:
 *           $ref: '#/components/schemas/User'
 *
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the notification
 *         title:
 *           type: string
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message
 *         type:
 *           type: array
 *           description: Notification type
 *           items:
 *             type: string
 *             enum: [email, inapp, whatsapp, sms, push]
 *         data:
 *           type: object
 *         recipientIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *             description: Unique identifier of the User
 *         status:
 *           type: string
 *           enum: [send, pending, failed]
 *           description: Notification status
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           description: Notification scheduled timestamp
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: Notification read timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Notification creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Notification last update timestamp
 *
 * /notifications/{id}:
 *   patch:
 *     summary: Update notification read time.
 *     description: Update the notification read time for a particular notification.
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               readAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: User notification updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User notification  updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
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
 *         description: Notification not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification not found
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
 *
 * /notifications/preference:
 *   patch:
 *     summary: Update user notification preference.
 *     description: Update the notification preference of an existing user.
 *     tags:
 *       - Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: boolean
 *               sms:
 *                 type: boolean
 *               push:
 *                 type: boolean
 *               inapp:
 *                 type: boolean
 *               whatsapp:
 *                 type: boolean
 *               newsletter:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User notification preference updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User notification preference updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreferenceWithUser'
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
 *
 *   get:
 *     summary: Get user notification preference.
 *     description: Get the notification preference of an existing user.
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: User notification preference retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User details retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreferenceWithUser'
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
 *
 * /notifications/me:
 *   get:
 *     summary: Get user notifications.
 *     description: Get the notifications of an existing user.
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: User notifications retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User details retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Alert:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the alert
 *         title:
 *           type: string
 *           description: Alert title
 *         body:
 *           type: string
 *           description: Alert content
 *         category:
 *           type: string
 *           enum: [maintenance, emergency, security, community, general]
 *           description: Category of the alert
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Priority level of the alert
 *         audienceType:
 *           type: string
 *           enum: [all, building, property, unit, user, role]
 *           description: Type of audience for the alert
 *         audienceIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: IDs of the targeted audience
 *         createdBy:
 *           type: string
 *           format: uuid
 *           description: ID of the user who created the alert
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Alert creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Alert last update timestamp
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Alert expiration timestamp
 *
 *     AlertWithReadStatus:
 *       allOf:
 *         - $ref: '#/components/schemas/Alert'
 *         - type: object
 *           properties:
 *             isRead:
 *               type: boolean
 *               description: Whether the alert has been read by the current user
 *
 *     CreateAlertDto:
 *       type: object
 *       required:
 *         - title
 *         - body
 *         - category
 *         - priority
 *         - audienceType
 *         - audienceIds
 *       properties:
 *         title:
 *           type: string
 *           description: Alert title
 *           minLength: 3
 *           maxLength: 100
 *         body:
 *           type: string
 *           description: Alert content
 *           minLength: 5
 *           maxLength: 1000
 *         category:
 *           type: string
 *           enum: [maintenance, emergency, security, community, general]
 *           description: Category of the alert
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Priority level of the alert
 *         audienceType:
 *           type: string
 *           enum: [all, building, property, unit, user, role]
 *           description: Type of audience for the alert
 *         audienceIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: IDs of the targeted audience
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Alert expiration timestamp
 *
 *     UpdateAlertDto:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Alert title
 *           minLength: 3
 *           maxLength: 100
 *         body:
 *           type: string
 *           description: Alert content
 *           minLength: 5
 *           maxLength: 1000
 *         category:
 *           type: string
 *           enum: [maintenance, emergency, security, community, general]
 *           description: Category of the alert
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Priority level of the alert
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Alert expiration timestamp
 *           nullable: true
 *
 *     Event:
 *       type: object
 *       required:
 *         - eventId
 *         - title
 *         - startsAt
 *         - audienceType
 *         - audienceIds
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Database ID of the event
 *         eventId:
 *           type: string
 *           description: Unique identifier for the event
 *         title:
 *           type: string
 *           description: Title of the event
 *         description:
 *           type: string
 *           description: Detailed description of the event
 *         startsAt:
 *           type: string
 *           format: date-time
 *           description: When the event starts
 *         endsAt:
 *           type: string
 *           format: date-time
 *           description: When the event ends
 *         location:
 *           type: string
 *           description: Location of the event
 *         audienceType:
 *           type: string
 *           enum: [all, building, property, unit, user, role]
 *           description: Type of audience for the event
 *         audienceIds:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of the audience members
 *         status:
 *           type: string
 *           enum: [active, cancelled, completed]
 *           description: Current status of the event
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the event
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the event was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the event was last updated
 *
 *     SystemEventType:
 *       type: string
 *       enum:
 *         - payment.failed
 *         - payment.successful
 *         - payment.overdue
 *         - payment.low_balance
 *         - security.breach
 *         - security.unauthorized_access
 *         - security.suspicious_activity
 *         - maintenance.scheduled
 *         - maintenance.completed
 *         - maintenance.delayed
 *         - property.damage
 *         - property.inspection
 *         - meter.disconnected
 *         - meter.low_units
 *         - meter.tampered
 *         - system.upgrade
 *         - system.downtime
 *         - user.registered
 *         - user.profile_incomplete
 *         - event.created
 *         - event.updated
 *         - event.cancelled
 *         - event.reminder
 *       description: Type of system event that can trigger an alert
 *
 *     PaymentEvent:
 *       type: object
 *       required:
 *         - type
 *         - userId
 *         - amount
 *         - currency
 *       properties:
 *         type:
 *           type: string
 *           enum: [payment.failed, payment.successful, payment.overdue, payment.low_balance]
 *           description: Type of payment event
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user associated with the payment
 *         amount:
 *           type: number
 *           description: Payment amount
 *         currency:
 *           type: string
 *           description: Currency code (e.g., NGN, USD)
 *         paymentId:
 *           type: string
 *           description: ID of the payment
 *         propertyId:
 *           type: string
 *           format: uuid
 *           description: ID of the property associated with the payment
 *         houseId:
 *           type: string
 *           format: uuid
 *           description: ID of the house associated with the payment
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Event timestamp
 *
 *     SecurityEvent:
 *       type: object
 *       required:
 *         - type
 *         - propertyId
 *         - details
 *       properties:
 *         type:
 *           type: string
 *           enum: [security.breach, security.unauthorized_access, security.suspicious_activity]
 *           description: Type of security event
 *         propertyId:
 *           type: string
 *           format: uuid
 *           description: ID of the property where the security event occurred
 *         location:
 *           type: string
 *           description: Specific location of the security event
 *         deviceId:
 *           type: string
 *           description: ID of the device that detected the security event
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user associated with the security event
 *         ipAddress:
 *           type: string
 *           description: IP address associated with the security event
 *         details:
 *           type: string
 *           description: Details of the security event
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Event timestamp
 *
 * tags:
 *   - name: Alerts
 *     description: Alert management endpoints
 *   - name: Events
 *     description: Event calendar management endpoints
 *
 * /alerts:
 *   get:
 *     summary: Get all alerts for the current user
 *     description: Retrieves all alerts for the authenticated user with read status
 *     tags:
 *       - Alerts
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of alerts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of alerts to skip for pagination
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
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
 *                   example: Alerts retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AlertWithReadStatus'
 *       401:
 *         description: Unauthorized
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
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error
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
 *
 *   post:
 *     summary: Create a new alert
 *     description: Creates a new alert (admin and manager roles only)
 *     tags:
 *       - Alerts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAlertDto'
 *     responses:
 *       201:
 *         description: Alert created successfully
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
 *                   example: Alert created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Alert'
 *       400:
 *         description: Invalid input
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
 *                   example: Invalid input
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: Unauthorized
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
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden
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
 *                   example: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
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
 *
 * /alerts/{id}:
 *   get:
 *     summary: Get alert by ID
 *     description: Retrieves a specific alert by its ID
 *     tags:
 *       - Alerts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert retrieved successfully
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
 *                   example: Alert retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Alert'
 *       401:
 *         description: Unauthorized
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
 *                   example: Unauthorized
 *       404:
 *         description: Alert not found
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
 *                   example: Alert not found
 *       500:
 *         description: Internal server error
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
 *
 *   patch:
 *     summary: Update an alert
 *     description: Updates an existing alert (admin and manager roles only)
 *     tags:
 *       - Alerts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Alert ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAlertDto'
 *     responses:
 *       200:
 *         description: Alert updated successfully
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
 *                   example: Alert updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Alert'
 *       400:
 *         description: Invalid input
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
 *                   example: Invalid input
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: Unauthorized
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
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden
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
 *                   example: Forbidden - Insufficient permissions
 *       404:
 *         description: Alert not found
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
 *                   example: Alert not found
 *       500:
 *         description: Internal server error
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
 *
 *   delete:
 *     summary: Delete an alert
 *     description: Deletes an existing alert (admin and manager roles only)
 *     tags:
 *       - Alerts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert deleted successfully
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
 *                   example: Alert deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Alert'
 *       401:
 *         description: Unauthorized
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
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden
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
 *                   example: Forbidden - Insufficient permissions
 *       404:
 *         description: Alert not found
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
 *                   example: Alert not found
 *       500:
 *         description: Internal server error
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
 *
 * /alerts/{id}/read:
 *   post:
 *     summary: Mark an alert as read
 *     description: Marks a specific alert as read for the current user
 *     tags:
 *       - Alerts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert marked as read successfully
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
 *                   example: Alert marked as read successfully
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized
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
 *                   example: Unauthorized
 *       404:
 *         description: Alert not found
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
 *                   example: Alert not found
 *       500:
 *         description: Internal server error
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
 *
 * /alerts/system-event:
 *   post:
 *     summary: Trigger a system event
 *     description: Triggers a system event that will automatically create an alert (admin role only)
 *     tags:
 *       - Alerts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - type
 *                   - userId
 *                   - amount
 *                   - currency
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [payment.failed, payment.successful, payment.overdue, payment.low_balance]
 *                     description: Type of payment event
 *                   userId:
 *                     type: string
 *                     format: uuid
 *                     description: ID of the user associated with the payment
 *                   amount:
 *                     type: number
 *                     description: Payment amount
 *                   currency:
 *                     type: string
 *                     description: Currency code (e.g., NGN, USD)
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: Event timestamp
 *               - type: object
 *                 required:
 *                   - type
 *                   - propertyId
 *                   - details
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [security.breach, security.unauthorized_access, security.suspicious_activity]
 *                     description: Type of security event
 *                   propertyId:
 *                     type: string
 *                     format: uuid
 *                     description: ID of the property where the security event occurred
 *                   details:
 *                     type: string
 *                     description: Details of the security event
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: Event timestamp
 *             discriminator:
 *               propertyName: type
 *     responses:
 *       200:
 *         description: System event triggered successfully
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
 *                   example: System event triggered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventType:
 *                       type: string
 *                       example: payment.failed
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
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
 *                   example: Invalid input
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: Unauthorized
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
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden
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
 *                   example: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
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
 *
 * /alerts/events:
 *   post:
 *     summary: Create a new calendar event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
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
 *                   example: Event calendar event created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     startsAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin or manager role
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update an existing calendar event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated successfully
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
 *                   example: Event calendar event updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     startsAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin or manager role
 *       500:
 *         description: Server error
 *
 * /alerts/events/{eventId}:
 *   delete:
 *     summary: Cancel an existing calendar event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event to cancel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - audienceType
 *               - audienceIds
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               audienceType:
 *                 type: string
 *                 enum: [all, building, property, unit, user, role]
 *               audienceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Event cancelled successfully
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
 *                   example: Event calendar event cancelled successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     title:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin or manager role
 *       500:
 *         description: Server error
 *
 *   get:
 *     summary: Get event details by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event to retrieve
 *     responses:
 *       200:
 *         description: Event details
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
 *                   example: Event retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 *
 * /alerts/events/upcoming:
 *   get:
 *     summary: Get upcoming events for the authenticated user
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of events to return
 *     responses:
 *       200:
 *         description: List of upcoming events
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
 *                   example: Upcoming events retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

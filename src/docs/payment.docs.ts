/**
 * @swagger
 * /payments/fee:
 *   post:
 *     summary: Create a new payment fee.
 *     description: Adds a new payment fee to the system.
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFeeDto'
 *     responses:
 *       200:
 *         description: Payment fee created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment fee created successfully
 *                 data:
 *                   type: object
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
 * /payments/split:
 *   post:
 *     summary: Create a new payment split.
 *     description: Adds a new payment split to the system.
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentSplitDto'
 *     responses:
 *       200:
 *         description: Payment split created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment split created successfully
 *                 data:
 *                   type: object
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
 * /payments/fees:
 *   get:
 *     summary: Retrieve all payment fees.
 *     description: Returns a list of all payment fees configured in the system.
 *     tags:
 *       - Payments
 *     responses:
 *       200:
 *         description: All payment fees retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All payment fees retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
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
 * /payments/resolve-pending:
 *   post:
 *     summary: Resolve all pending payment transactions.
 *     description: Triggers the resolution process for all pending payment transactions in the system i.e more than 1 hour ago.
 *     tags:
 *       - Payments
 *     responses:
 *       200:
 *         description: Successfully resolved pending transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request completed
 *                 data:
 *                   type: object
 *                   example: {}
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
 * /payments/split/{id}:
 *   patch:
 *     summary: Update an existing payment split.
 *     description: Updates the details of an existing payment split by ID.
 *     tags:
 *       - Payments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment split to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentSplitDto'
 *     responses:
 *       200:
 *         description: Payment split updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment split updated successfully
 *                 data:
 *                   type: object
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
 * /payments/fee/{id}:
 *   patch:
 *     summary: Update an existing payment fee.
 *     description: Updates the fee details of an existing payment by ID.
 *     tags:
 *       - Payments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment to update the fee for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFeeDto'
 *     responses:
 *       200:
 *         description: Payment fee updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment fee updated successfully
 *                 data:
 *                   type: object
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
 * /paystack/webhook:
 *   post:
 *     summary: Paystack webhook handler
 *     description: This endpoint handles Paystack webhook events for processing transactions.
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: The type of event sent by Paystack.
 *               data:
 *                 type: object
 *                 description: The payload containing transaction details.
 *     responses:
 *       200:
 *         description: Webhook received successfully.
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
 *                   example: Webhook received
 *       400:
 *         description: Bad request. Invalid or missing data.
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
 *                   example: Transaction not found
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

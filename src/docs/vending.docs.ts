/**
 * @swagger
 * /vend/pay:
 *   post:
 *     summary: Initiates a payment process for a meter.
 *     tags:
 *       - Vending
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to be paid.
 *                 example: 5000
 *               meterNumber:
 *                 type: string
 *                 description: The meter number to which the payment is being made.
 *                 example: "1234567890"
 *               channel:
 *                 type: string
 *                 description: The payment channel (e.g., card, bank, etc.).
 *                 example: "card"
 *               callback_url:
 *                 type: string
 *                 description: The URL to redirect to after payment.
 *                 example: "https://example.com/callback"
 *     responses:
 *       200:
 *         description: Payment link successfully generated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Payment link generated"
 *                 data:
 *                   type: object
 *                   description: The payment data returned from the payment gateway.
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Meter not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /vend/token:
 *   post:
 *     summary: Purchase a token for a meter using a transaction reference.
 *     tags:
 *       - Vending
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trxnRef:
 *                 type: string
 *                 description: The transaction reference for the purchase.
 *                 example: "TRXN123456789"
 *               channel:
 *                 type: string
 *                 description: The channel through which the transaction is made.
 *                 example: "web"
 *     responses:
 *       200:
 *         description: Token purchased successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Token purchased successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: The purchased token.
 *                       example: "1234567890123456"
 *                     meterNumber:
 *                       type: string
 *                       description: The meter number associated with the token.
 *                       example: "1234567890"
 *                     amount:
 *                       type: number
 *                       description: The amount used to purchase the token.
 *                       example: 5000
 *                     Date:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time of the transaction.
 *                       example: "2023-03-15T12:00:00Z"
 *                     units:
 *                       type: string
 *                       description: The total units purchased.
 *                       example: "50 kwh"
 *       400:
 *         description: Bad request or transaction not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Transaction not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

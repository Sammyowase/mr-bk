/**
 * @swagger
 * /wallets/withdrawal-banks:
 *   post:
 *     summary: Save withdrawal bank details
 *     description: This endpoint allows an authenticated user to save their withdrawal bank details. The user must provide the required fields such as `account_name`, `account_number`, `bank_code`, and `bank_name`.
 *     tags:
 *       - Withdrawal Banks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_name
 *               - account_number
 *               - bank_code
 *               - bank_name
 *             properties:
 *               account_name:
 *                 type: string
 *                 description: The name of the account holder.
 *               account_number:
 *                 type: string
 *                 description: The account number of the bank account.
 *               bank_code:
 *                 type: string
 *                 description: The code of the bank.
 *               bank_name:
 *                 type: string
 *                 description: The name of the bank.
 *     responses:
 *       200:
 *         description: Bank withdrawal details saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bank withdrawal details saved successfully.
 *                 data:
 *                   type: object
 *                   description: The saved bank details.
 *       400:
 *         description: Bad request. Missing required fields or bank already exists.
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
 * /wallets/withdrawal-banks:
 *   get:
 *     summary: Retrieve all saved withdrawal banks
 *     description: Fetches all saved withdrawal banks from the database and returns them in the response.
 *     tags:
 *       - Withdrawal Banks
 *     responses:
 *       200:
 *         description: Successfully retrieved saved withdrawal banks.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WithdrawalBank'
 *       500:
 *         description: Internal server error.
 */

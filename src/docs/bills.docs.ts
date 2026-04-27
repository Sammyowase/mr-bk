/**
 * @swagger
 * /bills/balance:
 *   get:
 *     summary: Get BP Balance
 *     description: Retrieves the current balance of the BP account.
 *     tags:
 *       - Bills
 *     responses:
 *       200:
 *         description: Balance retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   example: 100.00
 *       500:
 *         description: Internal server error.
 *
 * /bills/requery/{orderId}:
 *   get:
 *     summary: Requery BP Transaction
 *     description: Requeries the status of a BP transaction by its order ID.
 *     tags:
 *       - Bills
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           example: '1234567890'
 *     responses:
 *       200:
 *         description: Transaction status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequeryTxnResponseData'
 *       404:
 *         description: Transaction not found.
 *       500:
 *         description: Internal server error.
 *
 * /bills/history:
 *   get:
 *     summary: Get BP Transaction History
 *     description: Retrieves the history of BP transactions.
 *     tags:
 *       - Bills
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BPTxnHistory'
 *       500:
 *         description: Internal server error.
 *
 * /bills/discos:
 *   get:
 *     summary: Get Discos
 *     description: Retrieves the status of discos.
 *     tags:
 *       - Bills
 *     responses:
 *       200:
 *         description: Discos retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BPCheckDiscos'
 *       500:
 *         description: Internal server error.
 *
 * /bills/meter/status:
 *   get:
 *     summary: Check Meter Status
 *     description: Checks the status of a meter.
 *     tags:
 *       - Bills
 *     parameters:
 *       - in: query
 *         name: meterNumber
 *         required: true
 *         schema:
 *           type: string
 *           example: '1234567890'
 *       - in: query
 *         name: disco
 *         required: true
 *         schema:
 *           type: string
 *           example: 'ABUJA'
 *       - in: query
 *         name: vendType
 *         required: true
 *         schema:
 *           type: string
 *           $ref: '#/components/schemas/VendType'
 *           example: 'PREPAID'
 *       - in: query
 *         name: vertical
 *         required: true
 *         schema:
 *           type: string
 *           $ref: '#/components/schemas/VendCategory'
 *           example: 'ELECTRICITY'
 *     responses:
 *       200:
 *         description: Meter status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BPMeterStatus'
 *       500:
 *         description: Internal server error.
 *
 * /bills/products:
 *   get:
 *     summary: Get Product Price List
 *     description: Retrieves the list of prices for a given vertical and provider.
 *     tags:
 *       - Bills
 *     parameters:
 *       - in: query
 *         name: vertical
 *         required: true
 *         schema:
 *           type: string
 *           example: 'electricity'
 *       - in: query
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           example: 'provider1'
 *     responses:
 *       200:
 *         description: Price list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BPPriceList'
 *       500:
 *         description: Internal server error.
 *
 * /bills/pay:
 *   post:
 *     summary: Make Bill Payment
 *     description: Makes a payment for a bill.
 *     tags:
 *       - Bills
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InitBillPaymentDto'
 *     responses:
 *       200:
 *         description: Payment made successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendResponseData'
 *       400:
 *         description: Bad request - Validation errors.
 *       500:
 *         description: Internal server error.
 *
 * components:
 *   schemas:
 *     PaymentType:
 *       type: string
 *       enum:
 *         - USSD
 *         - ONLINE
 *         - BIZ
 *     VendType:
 *       type: string
 *       enum:
 *         - PREPAID
 *         - POSTPAID
 *     VendCategory:
 *       type: string
 *       enum:
 *         - VTU
 *         - TV
 *         - DATA
 *     BPPriceList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               desc:
 *                 type: string
 *               price:
 *                 type: number
 *     BPTxnHistory:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               order_id:
 *                 type: string
 *               phone:
 *                 type: string
 *               name:
 *                 type: string
 *               meter_no:
 *                 type: string
 *               amount:
 *                 type: string
 *               vend_type:
 *                 $ref: '#/components/schemas/VendType'
 *               vertical_type:
 *                 $ref: '#/components/schemas/VendCategory'
 *               disco_code:
 *                 type: string
 *               payment_status:
 *                 type: string
 *               vend_status:
 *                 type: string
 *               order_status:
 *                 type: string
 *               created_at:
 *                 type: string
 *               vendResponse:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   payment_reference:
 *                     type: string
 *                   token:
 *                     type: string
 *                   order_id:
 *                     type: number
 *                   rct_num:
 *                     type: string
 *                   response_message:
 *                     type: null
 *                   meter_category:
 *                     type: string
 *                   amt_electricity:
 *                     type: null
 *                   debt_rem:
 *                     type: string
 *               walletTransactions:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       ref:
 *                         type: string
 *                       amount:
 *                         type: string
 *                       operation:
 *                         type: string
 *                       type:
 *                         type: string
 *                       balance_before:
 *                         type: string
 *                       balance_after:
 *                         type: string
 *                       created_at:
 *                         type: string
 *     RequeryTxnResponseData:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         amountGenerated:
 *           type: string
 *         disco:
 *           type: string
 *         debtAmount:
 *           type: string
 *         debtRemaining:
 *           type: string
 *         orderId:
 *           type: string
 *         receiptNo:
 *           type: string
 *         tax:
 *           type: string
 *         vendTime:
 *           type: string
 *         token:
 *           type: string
 *         totalAmountPaid:
 *           type: number
 *         units:
 *           type: string
 *         vendAmount:
 *           type: string
 *         vendRef:
 *           type: string
 *         responseCode:
 *           type: number
 *         responseMessage:
 *           type: string
 *     InitBillPaymentDto:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           example: 'ord1234567890'
 *         meter:
 *           type: string
 *           example: '1234567890'
 *         disco:
 *           type: string
 *           example: 'MTN'
 *         phone:
 *           type: string
 *           example: '0801234567'
 *         paymentType:
 *           $ref: '#/components/schemas/PaymentType'
 *           type: string
 *           example: 'BIZ'
 *         vendType:
 *           $ref: '#/components/schemas/VendType'
 *           type: string
 *           example: 'PREPAID'
 *         vertical:
 *           $ref: '#/components/schemas/VendCategory'
 *           type: string
 *           example: 'VTU'
 *         amount:
 *           type: string
 *           example: '5000'
 *         email:
 *           type: string
 *           example: 'user@example.com'
 *         name:
 *           type: string
 *           example: 'John Doe'
 *         tariffClass:
 *           type: string
 *           description: Can be obtained from the product list
 *           example: 'Residential'
 *     BPCheckDiscos:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             additionalProperties:
 *               type: boolean
 *     VendResponseData:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1234567890
 *         amountGenerated:
 *           type: number
 *           example: 5000
 *         tariff:
 *           type: string
 *           example: null
 *         debtAmount:
 *           type: number
 *           example: 0
 *         debtRemaining:
 *           type: number
 *           example: 0
 *         disco:
 *           type: string
 *           example: 'MTN'
 *         freeUnits:
 *           type: number
 *           example: 0
 *         orderId:
 *           type: string
 *           example: 'ord1234567890'
 *         receiptNo:
 *           type: string
 *           example: '1234567890'
 *         tax:
 *           type: number
 *           example: 0
 *         vendTime:
 *           type: string
 *           example: '2023-03-15T12:00:00Z'
 *         token:
 *           type: string
 *           example: null
 *         totalAmountPaid:
 *           type: number
 *           example: 5000
 *         units:
 *           type: number
 *           example: 50
 *         vendAmount:
 *           type: number
 *           example: 5000
 *         vendRef:
 *           type: string
 *           example: '1234567890'
 *         responseCode:
 *           type: number
 *           example: 200
 *         responseMessage:
 *           type: string
 *           example: 'Payment made successfully'
 */

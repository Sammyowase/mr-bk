/**
 * @swagger
 * /start-cron:
 *   get:
 *     summary: Start the CRON JOBS
 *     description: CAUTION - Should be triggered only on first deploy or job erased
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Cron job started successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cron started successfully
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

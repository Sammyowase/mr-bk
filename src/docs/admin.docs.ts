/**
 * @swagger
 * /admin/overview:
 *   get:
 *     summary: Retrieve admin overview
 *     description: Fetches the overall statistics and summary for the admin dashboard.
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Successfully retrieved admin overview.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin overview fetched successfully
 *                 data:
 *                   type: object
 *                   example:
 *                     totalUsers: 1200
 *                     activeUsers: 1100
 *                     totalRevenue: 50000
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
 * /admin/login:
 *   post:
 *     summary: Admin login endpoint
 *     description: Allows an admin to log in using their email, phone, or username along with their password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email, phone, or username of the admin.
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 description: Password of the admin.
 *                 example: securepassword123
 *           example:
 *             identifier: admin@example.com
 *             password: securepassword123
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   description: Admin user details.
 *                   example:
 *                     id: 123e4567-e89b-12d3-a456-426614174000
 *                     email: admin@example.com
 *                     role: admin
 *                     firstName: John
 *                     lastName: Doe
 *                     userName: johndoe
 *                     phone: "+2348123456789"
 *       400:
 *         description: Bad request. Admin not found or incorrect password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin not found
 *             example:
 *               message: Admin not found
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
 *             example:
 *               message: Internal server error
 */

/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: Register a new admin
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongpassword123
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               userName:
 *                 type: string
 *                 example: johndoe
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *           example:
 *             email: admin@example.com
 *             password: strongpassword123
 *             firstName: John
 *             lastName: Doe
 *             userName: johndoe
 *             phone: "+1234567890"
 *     responses:
 *       200:
 *         description: Admin registered successfully
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
 *                   example: Admin registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     email:
 *                       type: string
 *                       example: admin@example.com
 *                     role:
 *                       type: string
 *                       example: admin
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     userName:
 *                       type: string
 *                       example: johndoe
 *                     phone:
 *                       type: string
 *                       example: "+2348123456789"
 *             example:
 *               status: success
 *               message: Admin registered successfully
 *               data:
 *                 id: 123e4567-e89b-12d3-a456-426614174000
 *                 email: admin@example.com
 *                 role: admin
 *                 firstName: John
 *                 lastName: Doe
 *                 userName: johndoe
 *                 phone: "+2348123456789"
 *       400:
 *         description: Bad request
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
 *                 error:
 *                   type: boolean
 *                   example: true
 *             example:
 *               status: error
 *               message: Invalid input
 *               error: true
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
 *                   example: An error occurred while registering admin
 *                 error:
 *                   type: boolean
 *                   example: true
 *             example:
 *               status: error
 *               message: An error occurred while registering admin
 *               error: true
 */

/**
 * @swagger
 * /admin/send-update-mail:
 *   post:
 *     summary: Send feature update email to users
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendUpdateEmailDto'
 *           example:
 *             subject: "New Feature Release"
 *             message: "We have released a new feature. Check it out!"
 *             recipients:
 *               - user1@example.com
 *               - user2@example.com
 *     responses:
 *       200:
 *         description: Feature update email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Feature update email sent successfully
 *             example:
 *               message: Feature update email sent successfully
 */

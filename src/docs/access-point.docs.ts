/**
 * @swagger
 * components:
 *   schemas:
 *     AccessPoint:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the access point
 *         name:
 *           type: string
 *           description: Name of the access point
 *         description:
 *           type: string
 *           description: Description of the access point
 *         type:
 *           type: string
 *           enum: [main_gate, pedestrian_gate, service_gate, parking_entry, parking_exit, reception_door, apartment_door, elevator, clubhouse, gym_entrance, pool_area, playground, utility_room, security_room, back_exit, rooftop_access, basement_entry, visitor_kiosk, bike_locker, ev_charging_station]
 *           description: Type of access point
 *         propertyId:
 *           type: string
 *           format: uuid
 *           description: ID of the property this access point belongs to
 *         houseId:
 *           type: string
 *           format: uuid
 *           description: ID of the house this access point belongs to
 *         isActive:
 *           type: boolean
 *           description: Whether the access point is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         Property:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *         House:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *     AccessToken:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the access token
 *         code:
 *           type: string
 *           description: Access code
 *         type:
 *           type: string
 *           enum: [qr, numeric]
 *           description: Type of access token
 *         status:
 *           type: string
 *           enum: [active, used, revoked, expired]
 *           description: Status of the access token
 *         guestName:
 *           type: string
 *           description: Name of the guest
 *         guestPhotoUrl:
 *           type: string
 *           format: uri
 *           description: URL of the guest's photo
 *         validFrom:
 *           type: string
 *           format: date-time
 *           description: Start of validity period
 *         validUntil:
 *           type: string
 *           format: date-time
 *           description: End of validity period
 *         accesspointId:
 *           type: string
 *           format: uuid
 *           description: ID of the access point
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         issuedBy:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *         AccessPoint:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             type:
 *               type: string
 *     CreateAccessPointRequest:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Name of the access point
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Description of the access point
 *         type:
 *           type: string
 *           enum: [main_gate, pedestrian_gate, service_gate, parking_entry, parking_exit, reception_door, apartment_door, elevator, clubhouse, gym_entrance, pool_area, playground, utility_room, security_room, back_exit, rooftop_access, basement_entry, visitor_kiosk, bike_locker, ev_charging_station]
 *           description: Type of access point
 *         propertyId:
 *           type: string
 *           format: uuid
 *           description: ID of the property (required if houseId not provided)
 *         houseId:
 *           type: string
 *           format: uuid
 *           description: ID of the house (required if propertyId not provided)
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the access point is active
 *     UpdateAccessPointRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Name of the access point
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Description of the access point
 *         type:
 *           type: string
 *           enum: [main_gate, pedestrian_gate, service_gate, parking_entry, parking_exit, reception_door, apartment_door, elevator, clubhouse, gym_entrance, pool_area, playground, utility_room, security_room, back_exit, rooftop_access, basement_entry, visitor_kiosk, bike_locker, ev_charging_station]
 *           description: Type of access point
 *         isActive:
 *           type: boolean
 *           description: Whether the access point is active
 *     GenerateAccessCodeRequest:
 *       type: object
 *       required:
 *         - accesspointId
 *         - type
 *         - guestName
 *         - validFrom
 *         - validUntil
 *       properties:
 *         accesspointId:
 *           type: string
 *           format: uuid
 *           description: ID of the access point
 *         type:
 *           type: string
 *           enum: [qr, numeric]
 *           description: Type of access code
 *         guestName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Name of the guest
 *         guestPhotoUrl:
 *           type: string
 *           format: uri
 *           description: URL of the guest's photo
 *         validFrom:
 *           type: string
 *           format: date-time
 *           description: Start of validity period
 *         validUntil:
 *           type: string
 *           format: date-time
 *           description: End of validity period
 *     GenerateQRCodeRequest:
 *       type: object
 *       required:
 *         - accesspointId
 *         - guestName
 *         - validFrom
 *         - validUntil
 *       properties:
 *         accesspointId:
 *           type: string
 *           format: uuid
 *           description: ID of the access point
 *         guestName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Name of the guest
 *         guestPhotoUrl:
 *           type: string
 *           format: uri
 *           description: URL of the guest's photo
 *         validFrom:
 *           type: string
 *           format: date-time
 *           description: Start of validity period
 *         validUntil:
 *           type: string
 *           format: date-time
 *           description: End of validity period
 *     AssignSecurityRoleRequest:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user to assign security role
 *         propertyId:
 *           type: string
 *           format: uuid
 *           description: ID of the property
 *         houseId:
 *           type: string
 *           format: uuid
 *           description: ID of the house
 *     GuestEntryRequest:
 *       type: object
 *       required:
 *         - code
 *         - accessStatus
 *       properties:
 *          code:
 *             type: string
 *             description: The access token
 *          accessStatus:
 *             type: string
 *             description: Access decision
 *          guestItems:
 *             type: string
 *             description: A comma separated list of items
 *          photoCapturedUrl:
 *             type: string
 *             description: A URL of the captured guest image
 *     GuestExitRequest:
 *       type: object
 *       required:
 *         - exitTime
 *         - checked
 *       properties:
 *          exitTime:
 *             type: string
 *             format: date-time
 *             description: Guest exit time
 *          checked:
 *             type: boolean
 *             description: A boolean that signifies a guest is checked before exit
 *     AllGuestLogs:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the guest log
 *         accessTokenId:
 *           type: string
 *           format: uuid
 *           description: ID of the access token used to enter the property
 *         accessToken:
 *           $ref: '#/components/schemas/AccessToken'
 *           description: Access token used to enter the property
 *         guestName:
 *           type: string
 *           description: Name of the guest
 *         guestItems:
 *           type: string
 *           nullable: true
 *           description: Items brought by the guest
 *         securityId:
 *           type: string
 *           format: uuid
 *           description: ID of the security personnel who verified the guest
 *         security:
 *           $ref: '#/components/schemas/User'
 *           description: Security personnel who verified the guest
 *         accessPointId:
 *           type: string
 *           format: uuid
 *           description: ID of the access point used to enter the property
 *         accessPoint:
 *           $ref: '#/components/schemas/AccessPoint'
 *           description: Access point used to enter the property
 *         photoCapturedUrl:
 *           type: string
 *           nullable: true
 *           format: uri
 *           description: URL of the photo captured at the access point
 *         entryTime:
 *           type: string
 *           format: date-time
 *           description: Time the guest entered the property
 *         exitTime:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           description: Time the guest exited the property
 *         accessStatus:
 *           type: string
 *           enum: [granted, denied, pending]
 *           default: pending
 *           description: Status of the guest's access
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *
 * /access-points:
 *   get:
 *     summary: Retrieve all access points
 *     description: Fetches all access points, with optional pagination, sorting, and search.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, description, type, isActive, createdAt]
 *           default: name
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (asc or desc)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter access points
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional property ID to filter access points by property
 *     responses:
 *       200:
 *         description: Successfully retrieved access points.
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
 *                   example: All access points retrieved successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AccessPoint'
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *       400:
 *         description: Bad request - Invalid sort field or parameters.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       500:
 *         description: Internal server error.
 *   post:
 *     summary: Create a new access point
 *     description: Creates a new access point for a property or house.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccessPointRequest'
 *     responses:
 *       201:
 *         description: Access point created successfully.
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
 *                   example: Access point created successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/AccessPoint'
 *       400:
 *         description: Bad request - Validation errors.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: Not found - Property or house not found.
 *       409:
 *         description: Conflict - Access point with same name already exists.
 *       500:
 *         description: Internal server error.
 *
 * /access-points/code:
 *   post:
 *     summary: Generate an access code
 *     description: Generates a new access code for a specific access point.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateAccessCodeRequest'
 *     responses:
 *       201:
 *         description: Access code generated successfully.
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
 *                   example: Access code generated successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/AccessToken'
 *       400:
 *         description: Bad request - Validation errors or unable to generate unique code.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       403:
 *         description: Forbidden - No permission to generate codes for this access point.
 *       404:
 *         description: Not found - Access point not found.
 *       500:
 *         description: Internal server error.
 *   get:
 *     summary: Get all access codes for an access point
 *     description: Retrieves all access codes created for a specific access point.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accesspointId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the access point
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [code, guestName, status, validFrom, validUntil, createdAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (asc or desc)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter access codes
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, used, revoked, expired]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Access codes retrieved successfully.
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
 *                   example: Access codes retrieved successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AccessToken'
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *       400:
 *         description: Bad request - Invalid parameters.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       403:
 *         description: Forbidden - No permission to view codes for this access point.
 *       404:
 *         description: Not found - Access point not found.
 *       500:
 *         description: Internal server error.
 *
 * /access-points/{accesspointId}:
 *   patch:
 *     summary: Update an access point
 *     description: Updates an existing access point.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accesspointId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the access point to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAccessPointRequest'
 *     responses:
 *       200:
 *         description: Access point updated successfully.
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
 *                   example: Access point updated successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/AccessPoint'
 *       400:
 *         description: Bad request - Validation errors.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       403:
 *         description: Forbidden - No permission to update this access point.
 *       404:
 *         description: Not found - Access point not found.
 *       500:
 *         description: Internal server error.
 *   delete:
 *     summary: Delete an access point
 *     description: Deletes an existing access point.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accesspointId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the access point to delete
 *     responses:
 *       200:
 *         description: Access point deleted successfully.
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
 *                   example: Access point deleted successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       403:
 *         description: Forbidden - No permission to delete this access point.
 *       404:
 *         description: Not found - Access point not found.
 *       500:
 *         description: Internal server error.
 *
 * /access-points/code/{accesscodeId}:
 *   delete:
 *     summary: Delete an access code
 *     description: Deletes an existing access code.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accesscodeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the access code to delete
 *     responses:
 *       200:
 *         description: Access code deleted successfully.
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
 *                   example: Access code deleted successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       403:
 *         description: Forbidden - No permission to delete this access code.
 *       404:
 *         description: Not found - Access code not found.
 *       500:
 *         description: Internal server error.
 *   patch:
 *     summary: Revoke an access code
 *     description: Revokes an existing access code, making it invalid.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accesscodeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the access code to revoke
 *     responses:
 *       200:
 *         description: Access code revoked successfully.
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
 *                   example: Access code revoked successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/AccessToken'
 *       400:
 *         description: Bad request - Access code already revoked.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       403:
 *         description: Forbidden - No permission to revoke this access code.
 *       404:
 *         description: Not found - Access code not found.
 *       500:
 *         description: Internal server error.
 *
 * /access-points/{houseId}/codes:
 *   get:
 *     summary: Get access codes by house ID
 *     description: Retrieves all access code associated with a specific house.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: houseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the house to retrieve access points for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Access codes retrieved successfully.
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
 *                   example: Access codes retrieved successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AccessToken'
 *       400:
 *         description: Bad request - Invalid parameters.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: Not found - House not found.
 *
 * /access-points/property/{propertyId}/codes:
 *   get:
 *     summary: Get access codes by property ID
 *     description: Retrieves all access codes associated with a specific property.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the property to retrieve access codes for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Property access codes retrieved successfully.
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
 *                   example: Property access codes retrieved successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AccessToken'
 *       400:
 *         description: Bad request - Invalid parameters.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: Not found - House not found.
 *       500:
 *         description: Internal server error.
 *
 * /access-points/house/{houseId}:
 *   get:
 *     summary: Get access points by house ID
 *     description: Retrieves all access point associated with a specific house.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: houseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the house to retrieve access points for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Access points retrieved successfully.
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
 *                   example: Access points retrieved successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AccessPoint'
 *       400:
 *         description: Bad request - Invalid parameters.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: Not found - House not found.
 *       500:
 *         description: Internal server error.
 *
 * /access-points/qr:
 *   post:
 *     summary: Generate a QR code for access
 *     description: Generates a QR code for access to a specific access point.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateQRCodeRequest'
 *     responses:
 *       201:
 *         description: QR code generated successfully.
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
 *                   example: QR code generated successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/AccessToken'
 *                     - type: object
 *                       properties:
 *                         qrData:
 *                           type: string
 *                           description: JSON string containing QR code data
 *       400:
 *         description: Bad request - Validation errors.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       403:
 *         description: Forbidden - No permission to generate QR codes for this access point.
 *       404:
 *         description: Not found - Access point not found.
 *       500:
 *         description: Internal server error.
 *
 *
 * /access-points/code/{token}:
 *   get:
 *     summary: Get a single access code details
 *     description: Retrieves a single access code details.
 *     tags:
 *       - Access Control
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Access code token
 *     responses:
 *       200:
 *         description: Access code retrieved successfully.
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
 *                   example: Access code retrieved successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/AccessToken'
 *       400:
 *         description: Bad request - Invalid parameters.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       404:
 *         description: Not found - Access code not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /access-points/guest/logs:
 *   get:
 *     summary: Retrieve all guest entry logs
 *     description: Fetches all guest entry logs from the database and returns them in a paginated response. Supports filtering by property, date range, status, and search term. Can also export logs to Excel.
 *     tags:
 *       - GuestLogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter logs by property ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter by guest name or code
 *         example: "John Doe"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs created on or after this date (ISO format)
 *         example: "2023-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs created on or before this date (ISO format)
 *         example: "2023-12-31"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [granted, denied, pending]
 *         description: Filter logs by access status
 *         example: "granted"
 *       - in: query
 *         name: download
 *         schema:
 *           type: boolean
 *         description: Set to 'true' to download logs as Excel file
 *         example: false
 *     responses:
 *       200:
 *         description: Guest entry logs retrieved successfully
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
 *                   example: Guest entry logs retrieved successfully
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/AllGuestLogs'
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *       '200 (download=true)':
 *         description: Excel file containing guest logs
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @swagger
 * /access-points/guest/logs/{id}:
 *   get:
 *     summary: Retrieve a guest log by ID
 *     description: Retrieve detailed information about a guest log entry using its unique identifier.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - GuestLogs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the guest log
 *     responses:
 *       200:
 *         description: Guest log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AllGuestLogs'
 *       404:
 *         description: Guest log not found
 */

/**
 * @swagger
 * /access-points/guest/entry:
 *   post:
 *     summary: Create a new guest entry log
 *     description: Log the entry of a guest into the system.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - GuestLogs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GuestEntryRequest'
 *     responses:
 *       201:
 *         description: Guest entry logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AllGuestLogs'
 */

/**
 * @swagger
 * /access-points/guest/exit/{id}:
 *   patch:
 *     summary: Update a guest log with exit information
 *     description: Log the exit of a guest by updating their guest log entry.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - GuestLogs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the guest log to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GuestExitRequest'
 *     responses:
 *       200:
 *         description: Guest exit logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Guest exit logged successfully
 */

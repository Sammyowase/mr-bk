import { HttpException } from "./httpException";

export class BadRequestException extends HttpException {
  constructor(message = "Bad Request") {
    super(400, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Not Found") {
    super(404, message);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Conflict") {
    super(409, message);
  }
}

export class UnprocessableEntityException extends HttpException {
  constructor(message = "Unprocessable Entity") {
    super(422, message);
  }
}

export class NotImplementedException extends HttpException {
  constructor(message = "Not Implemented") {
    super(501, message);
  }
}

export class InternalServerException extends HttpException {
  constructor(message = "Internal Server Error") {
    super(500, message);
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message = "Service Unavailable") {
    super(503, message);
  }
}
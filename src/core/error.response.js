'use strict'

const StatusCode = {
    FORBIDDEN: 403,
    CONFLICT: 409,
    BAD_REQUEST: 400, // Thêm mã trạng thái cho Bad Request
}

const ReasonStatusCode = { // Sửa lỗi chính tả
    FORBIDDEN: 'Forbidden',
    CONFLICT: 'Conflict',
    BAD_REQUEST: 'Bad Request', // Thêm thông báo cho Bad Request
}

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

class ConflictError extends ErrorResponse {
    constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.CONFLICT) { // Sửa mã trạng thái
        super(message, statusCode);
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.BAD_REQUEST, statusCode = StatusCode.BAD_REQUEST) { // Sửa mã trạng thái và thông báo
        super(message, statusCode);
    }
}

module.exports = { ErrorResponse, ConflictError, BadRequestError };
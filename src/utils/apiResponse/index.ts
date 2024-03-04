export class ApiResponse {

    [x: string]: any

    constructor(statusCode: number, result: any, message: string = "Success") {

        this.statusCode = statusCode;
        this.result = result;
        this.message = message;
        this.success = statusCode < 400

    }
}
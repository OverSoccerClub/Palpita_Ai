import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
        };

        // LOG COMPLETO DO ERRO PARA O CONSOLE DO EASYPANEL
        console.error('--- EXCEPTION DETECTED ---');
        console.error('Path:', responseBody.path);
        console.error('Status:', httpStatus);
        console.error('Error Details:', exception);
        if (exception instanceof Error) {
            console.error('Stack:', exception.stack);
        }
        console.error('--------------------------');

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}

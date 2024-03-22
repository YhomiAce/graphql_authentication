import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { GqlArgumentsHost, GqlExceptionFilter } from "@nestjs/graphql";

@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    
    const ctx = gqlHost.getContext();
    console.log(ctx);
    
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || 'Internal server error';

    const response = {
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: ctx.req ? ctx.req.url : null,
    };

    ctx.res.status(status).json(response);
  }
}

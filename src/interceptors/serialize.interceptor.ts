import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { plainToClass } from 'class-transformer';

export class SerializeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    handler: CallHandler<any>,
  ): Observable<any> {
    //Run something before a request is handled by the request handler
    console.log('Im running before the handler', context);
    
    return handler.handle().pipe(
      map((data: any) => {
        //run something before the response is sent out
        console.log('Im running before the response is sent out', data);
      }),
    );
  }
}
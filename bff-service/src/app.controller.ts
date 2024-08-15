import {
  All,
  Controller,
  Get,
  HttpStatus,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(['', 'ping'])
  healthCheck(): any {
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  @All(['/:recipientServiceName', '/:recipientServiceName/*'])
  async handleRequest(
    @Req() request: Request,
    @Res() response: Response,
    @Param('recipientServiceName') recipientServiceName: string
  ) {
    console.log('handleRequest', { recipientServiceName });

    const recipientServiceResponse =
      await this.appService.getRecipientServiceResponse(
        recipientServiceName,
        request
      );

    const { headers, status, data } = recipientServiceResponse;
    console.log('answer', { headers, status });

    return response.set(headers).status(status).send(data);
  }
}

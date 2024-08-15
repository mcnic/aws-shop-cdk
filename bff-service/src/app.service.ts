import {
  BadGatewayException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Request } from 'express';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getRecipientServiceResponse(
    recipientServiceName: string,
    request: Request
  ): Promise<AxiosResponse> {
    const recipientUrl = process.env[recipientServiceName];
    console.log('getRecipientServiceResponse', { recipientServiceName, recipientUrl });

    if (!recipientUrl) {
      throw new BadGatewayException('Cannot process request');
    }

    const { headers, method, body, originalUrl } = request;
    const recipientPath = originalUrl.slice(`/${recipientServiceName}`.length);
    // const url = `${recipientUrl}${recipientPath}`;
    const url = `${recipientUrl}`;

    const isResponseCacheable =
      method === 'GET' && recipientPath === '/products';

    if (isResponseCacheable) {
      const cache = (await this.cacheManager.get(originalUrl)) as AxiosResponse;

      if (cache) {
        return cache;
      }
    }

    try {
      const serviceRequestConfig: AxiosRequestConfig<Record<string, string>> = {
        url,
        method,
        headers: {},
      };

      if (headers['authorization'] && serviceRequestConfig.headers) {
        serviceRequestConfig.headers['Authorization'] =
          headers['authorization'];
      }

      if (Object.keys(body).length) {
        serviceRequestConfig.data = body;
      }

      const serviceResponse = await axios.request(serviceRequestConfig);

      if (isResponseCacheable) {
        await this.cacheManager.set(originalUrl, serviceResponse);
      }

      return serviceResponse;
    } catch (e: any) {
      if (e.response) {
        return e.response;
      }

      throw new InternalServerErrorException(e.message);
    }
  }
}

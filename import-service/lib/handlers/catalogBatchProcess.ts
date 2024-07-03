import { Context, SQSEvent, SQSHandler } from 'aws-lambda';
import { Product, ProductSchema } from '../types';

export const handler: SQSHandler = async function (
  event: SQSEvent,
  context: Context
): Promise<void> {
  const products: Product[] = [];

  for (const message of event.Records) {
    try {
      const parsedData = JSON.parse(message.body);
      for (const item of parsedData) {
        const product = ProductSchema.parse(item) as Product;
        products.push(product);
      }
    } catch (error) {
      console.error(error);
    }
  }

  console.log({ products });
};

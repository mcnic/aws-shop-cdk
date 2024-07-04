import { SQSEvent, SQSHandler } from 'aws-lambda';
import { Product, NewProductSchema, NewProduct } from '../types';
import { addNewProductsToDB } from '../helpers/db';

export const handler: SQSHandler = async function (event: SQSEvent) {
  const products: NewProduct[] = [];

  for (const message of event.Records) {
    try {
      const parsedData = JSON.parse(message.body);
      for (const item of parsedData) {
        const product = NewProductSchema.parse(item) as Product;
        products.push(product);
      }
    } catch (error) {
      console.error(error);
    }
  }

  await addNewProductsToDB(products);
};

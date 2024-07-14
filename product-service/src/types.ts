import { z } from 'zod';

export type queryStringParameters = { queryStringParameters: { name: string } };

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
};

export type NewProduct = Omit<Product, 'id'>;

export const NewProductSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().min(0)
  ),
  count: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().min(0)
  ),
});

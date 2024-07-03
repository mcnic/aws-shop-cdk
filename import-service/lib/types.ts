import { z } from 'zod';

export type queryStringParameters = { queryStringParameters: { name: string } };

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
};

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number().min(0),
  count: z.number().min(0),
});

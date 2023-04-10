import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import getProductCardById from '../../utils/getProductCardById';
import { ProductNotFoundError } from '@errors/productNotFoundError';

import schema from './schema';

const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const { pathParameters: { id } } = event;
    console.log('product id for search - ', id);
    const product = await getProductCardById(id);
    if (!product) throw new ProductNotFoundError(); 
    return formatJSONResponse({ product }); 
  } catch (error) {
    const isProductNotFoundError = error instanceof ProductNotFoundError;
    const errorMessage = isProductNotFoundError ? error.message : 'Unknown error';
    const errorStatusCode = isProductNotFoundError ? 404 : 500;
    console.log(errorMessage || 'can not get product by id');
    return formatJSONResponse({ message: errorMessage }, errorStatusCode);
  }
};

export const main = middyfy(getProductById);

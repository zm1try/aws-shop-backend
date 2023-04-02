import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import getProducts from '../../utils/getProducts';
import { ProductNotFoundError } from '../../errors/productNotFoundError';

import schema from './schema';

const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const productsList = await getProducts();
    const { pathParameters: { id: productId } } = event;
    const product = productsList.find(item => item.id === productId);
    if (!product) throw new ProductNotFoundError(); 
    return formatJSONResponse({ product }); 
  } catch (error) {
    const isProductNotFoundError = error instanceof ProductNotFoundError;
    const errorMessage = isProductNotFoundError ? error.message : 'Unknown error';
    const errorStatusCode = isProductNotFoundError ? 404 : 500;
    return formatJSONResponse({ message: errorMessage }, errorStatusCode);
  }
  
};

export const main = middyfy(getProductById);

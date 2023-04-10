import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import getProducts from '../../utils/getProducts';

import schema from './schema';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  try {
    const productsList = await getProducts();
    return formatJSONResponse({ productsList }); 
  } catch (error) {
    return formatJSONResponse({ message: 'Unknown error.' }, 500);
  }
  
};

export const main = middyfy(getProductsList);

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import createProductCard from '../../utils/createProductCard';
import { ProductDataInvalid } from '@errors/productDataInvalid';
import schema from './schema';

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const { body: data } = event;
    console.log('product data for creation - ', data);
    if (isDataValid(data)) {
      const isProductCreated = await createProductCard(data);
      if (!isProductCreated) {
        throw new Error();
      } else {
        return formatJSONResponse({ message: 'Product created' }, 201); 
      }
    } else {
      throw new ProductDataInvalid();
    }
    
  } catch (error) {
    const isProductDataInvalid = error instanceof ProductDataInvalid;
    const errorMessage = isProductDataInvalid ? error.message : 'Unknown error';
    const errorStatusCode = isProductDataInvalid ? 400 : 500;
    console.log(errorMessage || 'product not created');
    return formatJSONResponse({ message: errorMessage }, errorStatusCode);
  }
};

const isDataValid = (data): boolean => {
  const { title, description, price, count } = data;
  const isTitleValid = title && typeof title === 'string';
  const isDescriptionValid = !description || typeof description === 'string';
  const isPriceValid = price >= 0 && typeof price === 'number';
  const isCountValid = count >= 0 && typeof count === 'number';
  return isTitleValid && isDescriptionValid && isPriceValid && isCountValid;
}

export const main = middyfy(createProduct);

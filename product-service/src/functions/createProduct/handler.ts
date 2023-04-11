import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import createProductCard from '../../utils/createProductCard';
import { ProductDataInvalid } from '@errors/productDataInvalid';
import schema from './schema';
// import { v4 as uuidv4 } from 'uuid';
// import createClient from '../../utils/createClient';

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  // const client = createClient();
  // client.connet();

  try {
    const { body: data } = event;
    console.log('product data for creation - ', data);
    if (isDataValid(data)) {
      
      // await client.query('BEGIN');

      // const { title, description, price, count } = data;
      // const id = uuidv4();
      // const productsQueryText = 'INSERT INTO products(id, title, description, price) VALUES($1, $2, $3, $4)';
      // await client.query(productsQueryText, [id, title, description, price]);
      // const stocksQueryText = 'INSERT INTO stocks(product_id, count) VALUES($1, $2)';
      // await client.query(stocksQueryText, [id, title, description, price]);

      const isProductCreated = await createProductCard(data);
      if (!isProductCreated) {
        throw new Error();
      } else {
        // await client.query('COMMIT');
        return formatJSONResponse({ message: 'Product created' }, 201); 
      }
    } else {
      throw new ProductDataInvalid();
    } 
    // finally {
    //   client.end();
    // }
    
  } catch (error) {
    // await client.query('ROLLBACK');
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

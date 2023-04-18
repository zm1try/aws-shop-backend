import { ProductCardInterface } from "../models/productCardDTO";
import { ProductInterface } from "../models/productDTO";
import { StockInterface } from "../models/stockDTO";
import joinProductsCard from "./joinProductsCard";

const joinProductsCards = (products: ProductInterface[], stocks: StockInterface[]): ProductCardInterface[] => {
    const result: ProductCardInterface[] = [];
    products.forEach(product => {
        const { id: productId } = product;
        const stock: StockInterface = stocks.find((el: StockInterface) => el.product_id === productId);
        const productCard = joinProductsCard(product, stock);
        if (productCard) {
            result.push(productCard);
        }
    });
    console.log('joinProductsCards');
    return result;
}

export default joinProductsCards;
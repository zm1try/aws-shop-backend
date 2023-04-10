import { ProductCardInterface } from "../models/productCardDTO";
import { ProductInterface } from "../models/productDTO";
import { StockInterface } from "../models/stockDTO";

const joinProductsCard = (product: ProductInterface, stock: StockInterface): ProductCardInterface => {
    console.log('joinProductsCard');
    if (product && stock && product.id === stock.product_id) {
        return { ...product, count: stock.count };
    } else {
        return null;
    }
}

export default joinProductsCard;
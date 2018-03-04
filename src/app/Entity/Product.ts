import {User} from "./User";
import {Category} from "./Category";

export class Product {
    constructor(public id: number,
                public author: User = null,
                public name: string,
                public description: string,
                public price: number,
                public priceType: number,
                public quantity: number,
                public validFrom: Date,
                public validUntil: Date,
                public photos?: any,
                public mainPhoto?: string,
                public category: Category = null,
                public qtyType = 1) {
        this.photos = photos ? photos : [];
    }
}
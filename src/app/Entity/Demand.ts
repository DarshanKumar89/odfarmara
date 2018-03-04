import {Product} from "./Product";
import {User} from "./User";
import {Message} from "./Message";

export class Demand {
    constructor(
        public product: Product,
        public user: User,
        public quantity: number,
        public lastMessage: Message,
        public id: number = 0
    ) {

    }
}
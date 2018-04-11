import {User} from "./User";
import {Demand} from "./Demand";

export class Message {
    constructor(
        public id: number,
        public userFrom: User,
        public userTo: User,
        public body: string,
        public created: Date,
        public seen:boolean = false,
        public demand?: Demand
    ) {
        this.seen = !seen ? false : seen;
    }

    setBody(body) {
        this.body = body;
        return this;
    }
}
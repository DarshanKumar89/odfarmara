export class Category {
    constructor(public id,
                public name,
                public icon,
                public parent: Category = null,
                public children = []) {
    }
}
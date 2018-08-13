export class User {
    constructor(
        public id: number,
        public avatar: string,
        public poster: string,
        public name: string,
        public region: number,
        public description: string,
        public person: string,
        public company: string,
        public street: string,
        public zip: string,
        public city: string,
        public country: string,
        public rating: number,
        public email: string,
        public farmer: boolean = true,
        public slug: string = '',
        public scopeId: number = 0,
        public scopeExtra: any = {},
        public isFirstLogin?: boolean
    ) {
    }
}

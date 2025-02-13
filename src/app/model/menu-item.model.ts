export class MenuItem {
    constructor(
        public title?: string,
        public path?: string,
        public icon?: string,
        public child?: MenuItem[],
        public role?: string[],
        public active: boolean = false
    ) {}
}
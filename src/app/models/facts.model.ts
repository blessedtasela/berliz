export class facts {
    constructor(
        public id: number,
        public name: string,
        public iconUrl: string,
        public value: number,
        public counterValue: number
    ) {

    }
    getValue() {
        return this.value;
    }
}
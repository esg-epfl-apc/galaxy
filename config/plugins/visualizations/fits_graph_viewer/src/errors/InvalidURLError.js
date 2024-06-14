export class InvalidURLError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidURLError";
    }
}
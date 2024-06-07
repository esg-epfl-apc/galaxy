export class UnsupportedTimeFormatError extends Error {
    constructor(message) {
        super(message);
        this.name = "UnsupportedTimeFormatError";
    }
}
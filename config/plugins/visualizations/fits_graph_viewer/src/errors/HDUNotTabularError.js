export class HDUNotTabularError extends Error {
    constructor(message) {
        super(message);
        this.name = "HDUNotTabularError";
    }
}
export class NoEventToDispatchError extends Error {
    constructor(message) {
        super(message);
        this.name = "NoEventToDispatch";
    }
}
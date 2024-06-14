export class EventNotFoundInRegistryError extends Error {
    constructor(message) {
        super(message);
        this.name = "EventNotFoundInRegistryError";
    }
}
import {NoEventToDispatchError} from "../errors/NoEventToDispatchError";

export class SettingsChangedEvent {

    static defaultOptions = {
        bubbles: true,
        composed: false,
        cancelable: true
    };

    static name = "settings-changed";

    event = null;

    constructor(settings_object, detail = {}, options = {}) {

        this.detail = { ...detail, ...{'settings_object': settings_object}};
        this.options = { ...SettingsChangedEvent.defaultOptions, ...options };

        this.event = new CustomEvent(SettingsChangedEvent.name, {
            detail: this.detail,
            ...this.options
        });
    }

    dispatch() {
        if(this.event !== null) {
            document.dispatchEvent(this.event);
        } else {
            throw new NoEventToDispatchError("No event to dispatch");
        }
    }
}

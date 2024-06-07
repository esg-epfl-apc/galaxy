import {RegistryContainer} from "../containers/RegistryContainer";

export class FileLoadedEvent {

    static defaultOptions = {
        bubbles: true,
        composed: false
    };

    static name = "file-loaded";
    static main_root_id = 'jsvis-main';
    static main_root_element = null;

    event = null;

    constructor(detail = {}, options = {}) {

        this.detail = { ...detail };
        this.options = { ...FileLoadedEvent.defaultOptions, ...options };

        this.event = new CustomEvent(FileLoadedEvent.name, {
            detail: this.detail,
            ...this.options
        });
    }

    dispatchToTarget(target) {
        target.dispatchEvent(this.event);
    }

    dispatchToMainRoot() {
        if(FileLoadedEvent.main_root_element === null) {
            FileLoadedEvent.main_root_element = document.getElementById(FileLoadedEvent.main_root_id);
        }

        document.dispatchEvent(this.event);
    }

    dispatchToSubscribers() {
        let esr = RegistryContainer.getRegistryContainer().getEventSubscribersRegistry();
        let subscribers_id = esr.getSubscribersForEvent(FileLoadedEvent.name)

        let subscriber_element = null;
        subscribers_id.forEach((subscriber_id) => {
            subscriber_element = document.getElementById(subscriber_id);
            subscriber_element.dispatchEvent(this.event);
        })
    }
}

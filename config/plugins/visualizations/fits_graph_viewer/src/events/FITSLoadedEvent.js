import {RegistryContainer} from "../containers/RegistryContainer";

export class FITSLoadedEvent {

    static defaultOptions = {
        bubbles: true,
        composed: false
    };

    static name = "fits-loaded";
    static main_root_id = 'jsvis-main';
    static main_root_element = null;

    event = null;

    constructor(fits_reader_wrapper, detail = {}, options = {}) {

        this.detail = { ...detail, ...{'fits_reader_wrapper': fits_reader_wrapper}};
        this.options = { ...FITSLoadedEvent.defaultOptions, ...options };

        this.event = new CustomEvent(FITSLoadedEvent.name, {
            detail: this.detail,
            ...this.options
        });
    }

    dispatchToTarget(target) {
        target.dispatchEvent(this.event);
    }

    dispatchToMainRoot() {
        if(FITSLoadedEvent.main_root_element === null) {
            FITSLoadedEvent.main_root_element = document.getElementById(FITSLoadedEvent.main_root_id);
        }

        document.dispatchEvent(this.event);
    }

    dispatchToSubscribers() {
        let esr = RegistryContainer.getRegistryContainer().getEventSubscribersRegistry();
        let subscribers_id = esr.getSubscribersForEvent(FITSLoadedEvent.name)

        let subscriber_element = null;
        subscribers_id.forEach((subscriber_id) => {
            subscriber_element = document.getElementById(subscriber_id);
            subscriber_element.dispatchEvent(this.event);
        })
    }
}

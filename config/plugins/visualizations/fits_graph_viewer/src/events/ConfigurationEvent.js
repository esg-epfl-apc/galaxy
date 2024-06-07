import {RegistryContainer} from "../containers/RegistryContainer";

export class ConfigurationEvent {

    static defaultOptions = {
        bubbles: true,
        composed: false,
        cancelable: true
    };

    static name = "configuration";

    event = null;

    constructor(configuration_object, detail = {}, options = {}) {

        this.detail = { ...detail, ...{'configuration_object': configuration_object}};
        this.options = { ...ConfigurationEvent.defaultOptions, ...options };

        this.event = new CustomEvent(ConfigurationEvent.name, {
            detail: this.detail,
            ...this.options
        });
    }

    dispatchToSubscribers() {
        let esr = RegistryContainer.getRegistryContainer().getEventSubscribersRegistry();
        let subscribers_id = esr.getSubscribersForEvent(ConfigurationEvent.name)

        let subscriber_element = null;
        subscribers_id.forEach((subscriber_id) => {
            subscriber_element = document.getElementById(subscriber_id);
            subscriber_element.dispatchEvent(this.event);
        })
    }
}

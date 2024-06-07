import {EventNotFoundInRegistryError} from "../errors/EventNotFoundInRegistryError";

export class EventSubscribersRegistry {

    static events_subscribers = {
        'fits-loaded': ['settings-component', 'file-component'],
        'configuration': ['settings-component'],
        'file-loaded': ['file-component'],
        'file-selected': ['settings-component'],
        'file-registry-change': ['settings-component', 'file-component']
    }

    constructor() {

    }

    getSubscribersForEvent(event_name) {
        if(EventSubscribersRegistry.events_subscribers.hasOwnProperty(event_name)) {
            return EventSubscribersRegistry.events_subscribers[event_name];
        } else {
            throw new EventNotFoundInRegistryError("Event not found : " + event_name);
        }
    }

}
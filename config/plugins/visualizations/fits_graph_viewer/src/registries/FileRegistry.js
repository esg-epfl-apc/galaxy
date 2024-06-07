import {FileRegistryChangeEvent} from "../events/FileRegistryChangeEvent";
import {StringUtils} from "../utils/StringUtils";

export class FileRegistry {

    static available_files = [];

    static current_files = [];

    static file_counter = 0;

    constructor() {

    }

    static getAvailableFilesList() {
        FileRegistry.available_files = FileRegistry.available_files.filter(obj => obj !== undefined);
        return FileRegistry.available_files;
    }

    static getCurrentFilesList() {
        FileRegistry.current_files = FileRegistry.current_files.filter(obj => obj !== undefined);
        return FileRegistry.current_files;
    }

    static addToAvailableFiles(file_to_add) {
        let file = { ...file_to_add,
            id: FileRegistry.file_counter,
            file_name: StringUtils.cleanFileName(file_to_add.file_name)
        };

        FileRegistry.available_files.push(file);

        FileRegistry.file_counter++;
    }

    static moveToAvailableFiles(file) {
        FileRegistry.available_files.push(file);
    }

    static removeFromAvailableFiles(file_id) {
        FileRegistry.available_files = FileRegistry.available_files.filter(file => file.id !== parseInt(file_id));
    }

    static addToCurrentFiles(file) {
        FileRegistry.current_files.push(file);
        FileRegistry.removeFromAvailableFiles(file.id);
    }

    static removeFromCurrentFiles(file_id) {
        let file = FileRegistry.current_files.find(file => file.id === parseInt(file_id));

        FileRegistry.current_files = FileRegistry.current_files.filter(file => file.id !== parseInt(file_id));
        FileRegistry.moveToAvailableFiles(file);
    }

    static getFileById(file_id) {
        let file_array = [...FileRegistry.available_files, ...FileRegistry.current_files];

        let file = file_array.find(file => file.id === parseInt(file_id));
        return file;
    }

    static getFileByName(file_name) {
        let file_array = [...FileRegistry.available_files, ...FileRegistry.current_files];

        let file = file_array.find(file => file.file_name === file_name);
        return file;
    }

    static isFileCurrent(file_id) {
        let is_current = false;

        if(FileRegistry.current_files.some(file => file.id === parseInt(file_id))) {
            is_current = true;
        }

        return is_current;
    }

    static sendRegistryChangeEvent() {
        let frce = new FileRegistryChangeEvent();
        frce.dispatchToSubscribers();
    }

}
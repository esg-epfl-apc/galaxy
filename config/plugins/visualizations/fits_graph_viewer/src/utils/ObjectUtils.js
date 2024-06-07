export class ObjectUtils {

    static deep_merge(base_object, merging_object) {
        let merged_object = {};

        for (let key in base_object) {
            if (base_object.hasOwnProperty(key)) {
                merged_object[key] = base_object[key];
            }
        }

        for (let key in merging_object) {
            if (merging_object.hasOwnProperty(key)) {
                if(Array.isArray(merging_object[key])) {

                } else if (merged_object.hasOwnProperty(key) && typeof merging_object[key] === 'object') {
                    merged_object[key] = ObjectUtils.deep_merge(merged_object[key], merging_object[key]);
                } else {
                    merged_object[key] = merging_object[key];
                }
            }
        }

        return merged_object;
    }

}
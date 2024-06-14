export class StringUtils {

    static cleanFileName(str) {
        if (str.startsWith('.') || str.startsWith('/')) {
            str = str.substring(1);

            return StringUtils.cleanFileName(str);
        } else {
            return str;
        }
    }

}
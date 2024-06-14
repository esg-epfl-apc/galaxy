import {UnsupportedTimeFormatError} from "../errors/UnsupportedTimeFormatError";

export class TimeHelper {

    static time_types = {
        'JD': 'jd',
        'MJD': 'mjd',
        'MJD-51540': 'mjd-51540',
        'MJD-51544': 'mjd-51544'
    }

    static jd_epoch_start_date = new Date('January 1, 4713 BCE UTC');
    static mjd_epoch_start_date = new Date('November 17, 1858 UTC');
    static mjd_51540_epoch_start_date = new Date('January 1, 2000 UTC');
    static mjd_51544_epoch_start_date = new Date('January 5, 2000 UTC');

    jdToMjd(jd_value) {
        return jd_value - TimeHelper.offset_jd_mjd_days;
    }

    mjdToJd(mjd_value) {
        return mjd_value + TimeHelper.offset_jd_mjd_days;
    }

    astronomicalTimeToDecimalYear(time, time_type) {
        switch(time_type) {

            case TimeHelper.time_types['JD']:

                break;

            case TimeHelper.time_types['MJD']:

                break;

            case TimeHelper.time_types['MJD-51540']:

                break;

            case TimeHelper.time_types['MJD-51544']:

                break;

            default:
                throw new UnsupportedTimeFormatError("Time format not supported");
        }
    }

}
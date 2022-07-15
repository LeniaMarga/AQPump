import GlobalState from "./GlobalState";
import axios from "axios";

const apiBase = 'https://api.usb.urbanobservatory.ac.uk/api/v2.0a/sensors/timeseries';
const getUrlCurrent = (room, sensor) => [apiBase, room, sensor, 'raw'].join('/');
const getUrlHistory = (room, sensor) => getUrlCurrent(room, sensor) + '/historic?outputAs=json';

class UsbRoom extends GlobalState {
    constructor(id) {
        super(id);
    }
    
    getStateValue = (sensor) => this.get(sensor.key);
    getStateValueHistory = (sensor) => this.get(sensor.historyKey);

    getValueAsync = (sensor) => {
        let url = getUrlCurrent(this.id, sensor.id);
        return axios(url).then(result => this.set(sensor.key, result.data.latest.value));
    }

    getValueHistoryAsync = (sensor) => {
        let url = getUrlHistory(this.id, sensor.id);
        return axios(url).then(result => this.set(sensor.historyKey, result.data.historic.values));
    }
}

export default UsbRoom;
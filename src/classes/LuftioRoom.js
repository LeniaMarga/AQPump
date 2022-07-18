import GlobalState from "./GlobalState";
import axios from "axios";

const apiBase = 'https://app.luftio.com/tb/api/plugins/telemetry/DEVICE';

// Luftio seems to measure every ~40 s, USB history returns 1 day with every 15 minutes
const historySpanMs = 1000 * 86400; // 1 day
const historyAggregationMs = 1000 * 60 * 15 // 15 minutes
const now = (delta = 0) => new Date().getTime() + delta;

const getUrlDevice = (deviceGuid) => [apiBase, deviceGuid, 'values/timeseries'].join('/');
const getUrlCurrent = (deviceGuid, sensor) => getUrlDevice(deviceGuid) + '?keys=' + sensor.id;
const getUrlHistory = (deviceGuid, sensor) => getUrlCurrent(deviceGuid, sensor) + '&' +['startTs=' + now(-historySpanMs), 'endTs=' + now(), 'interval=' + historyAggregationMs, 'agg=AVG'].join('&');

var withToken = {
    headers: {
        'X-Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsZW5pYS5tYXJnYXJpdGlAZ21haWwuY29tIiwic2NvcGVzIjpbIkNVU1RPTUVSX1VTRVIiXSwidXNlcklkIjoiNGM5Y2NjNTAtNWNmNS0xMWVjLWFmMTUtNWZkNzUzZGE4YTE0IiwiZmlyc3ROYW1lIjoiTGVuaWEiLCJsYXN0TmFtZSI6Ik1hcmdhcml0aSIsImVuYWJsZWQiOnRydWUsImlzUHVibGljIjpmYWxzZSwidGVuYW50SWQiOiI1MWI3NGU0MC0zMjY3LTExZWItYmNmZS0yNzBlZTk0MTRmMWEiLCJjdXN0b21lcklkIjoiMThkMGFhNjAtNDg0ZS0xMWVjLWFmMTUtNWZkNzUzZGE4YTE0IiwiaXNzIjoidGhpbmdzYm9hcmQuaW8iLCJpYXQiOjE2NTQxNzM3MzIsImV4cCI6MTcwMjU1NzczMn0.o1hCtYTpfH9Gs15mNgrCSYD7DFV4g9Iu0ZtqRVO1UikuaDWX53lYFD7-BIXIgt6nHSNx8dOl6xVKAaZPt_e77A'
    }
};

class LuftioRoom extends GlobalState {
    constructor(id, deviceGuid) {
        super(id);
        this.deviceGuid = deviceGuid;        
    }
    
    getStateValue = (sensor) => this.get(sensor.key);
    getStateValueHistory = (sensor) => this.get(sensor.historyKey);

    getValueAsync = (sensor) => {
        let url = getUrlCurrent(this.deviceGuid, sensor);
        return axios(url, withToken).then(result => this.set(sensor.key, result.data[sensor.id][0].value));
    }

    getValueHistoryAsync = (sensor) => {
        let url = getUrlHistory(this.deviceGuid, sensor);
        return axios(url, withToken).then(result => this.set(sensor.historyKey, result.data[sensor.id]));
    }
}

export default LuftioRoom;
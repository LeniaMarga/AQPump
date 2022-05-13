import GlobalState from "./GlobalState";
import axios from "axios";
import global from "../global.js";

class Arduino extends GlobalState {
    constructor(id, base) {
        super(id);
        this.base = base;
        
        this.room = null;
        this.sensor = null;
        this.value = 0;
        this.lastValue = 0;
        
        this.action = "";
        this.actionStatus = "";
        this.actionRemaining = 0;

        this.actionResolve = null;
        this.actionInterval = null;
        this.actionTimeout = null;
    }

    getValueDelta = () => this.value - this.lastValue;
    getValueSource = () => this.get("valueSource");
    setValueSource = (room, sensor) => {
        this.room = room;
        this.sensor = sensor;
        if (room && sensor)
            this.set("valueSource", room.key + "/" + sensor.key);
    }

    updateValueAsync = async (value, sensor) => {
        this.lastValue = this.value;
        this.value = value;
        this.invalidate();

        let delta = Math.abs(this.getValueDelta());
        if (delta === 0) return;

        let duration = delta * global.deltams;
        this.actionTimeoutTime = Date.now() + duration;

        return new Promise(async (resolve, reject) => {
            let color = (sensor ?? this.sensor).getSensorValueColor(this.value);
            if (this.value > this.lastValue)
                await this.inflateAsync(duration, color);
            else
                await this.deflateAsync(duration, color);
                                
            let timeout = setTimeout(async () => {
                if (timeout === this.actionTimeout)
                    await this.stopAsync();
                resolve();
            }, duration);

            this.actionTimeout = timeout;
            this.actionInterval = setInterval(this.onActionInterval, 100); // countdown display
        });
    };

    stopAsync = () => this.executeAsync('/stop');
    inflateAsync = (duration, color) => this.executeWithColorAsync('/inflate', duration, color);
    deflateAsync = (duration, color) => this.executeWithColorAsync('/deflate', duration, color);

    executeWithColorAsync = (action, duration, color) => {
        if (color) action += "?r=" + Math.round(color[0]) + "&g=" + Math.round(color[1]) + "&b=" + Math.round(color[2]);        
        return this.executeAsync(action, duration);
    };
    executeAsync = (action, duration) => {
        return new Promise((resolve, reject) => {
            this.action = action;
            this.actionStatus = "...";
            this.invalidate();
            axios.get(this.base + action).then(res => {
                this.action = action;
                this.actionStatus = res.statusText;
                this.invalidate();
                resolve();
            }).catch(err => {
                this.action = action;
                this.actionStatus = err.message;
                this.invalidate();
                reject();
            });
        });
    };

    onActionInterval = () => {
        if (this.actionTimeout) {
            let remaining = this.actionTimeoutTime - Date.now();
            if (remaining <= 0) {
                remaining = 0;
                clearInterval(this.actionInterval);
            }
            this.actionRemaining = remaining;
            this.invalidate();
        }
    };
}

export default Arduino;
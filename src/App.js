import React, { Component } from 'react';
import axios from "axios";
import { setIntervalAsync } from 'set-interval-async/dynamic';
import './App.css';
import { clearIntervalAsync } from 'set-interval-async';

const deltams = 20;
const arduinoBase = 'https://airqualitytest.free.beeceptor.com/192.168.183.1';
const apiBase = 'https://api.usb.urbanobservatory.ac.uk/api/v2.0a/sensors/timeseries';

const getUrlCurrent = (room, sensor) => [apiBase, room, sensor, 'raw'].join('/');
const getUrlHistory = (room, sensor) => getUrlCurrent(room, sensor) + '/historic?outputAs=json';

const rooms = ['room-1-024-zone-3', 'room-1-024-zone-4', 'room-1-024-zone-5'];
const sensors = ['co2', 'relative-humidity', 'temperature'];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedValue: 0, selectedDelta: 0, selectedRoomSensor: "", activeAction: "", actionError: "" };
    this.downloadValues = this.downloadValues.bind(this);
    this.onSourceChange = this.onSourceChange.bind(this);
    this.updateActionTimer = this.updateActionTimer.bind(this);
  }

  downloadValues() {
    rooms.forEach(room => {
      sensors.forEach(sensor => axios(getUrlCurrent(room, sensor)).then(result => {
        let state = {};
        state[room + "/" + sensor] = result.data.latest;
        this.setState(state);
      }));
    });
  }

  getStateValue(room, sensor) {
    var entry = this.state[room + "/" + sensor];
    if (entry) return entry.value;
    return "...";
  }

  onSourceChange(event) {
    this.setState({ selectedRoomSensor: event.target.value });
  }

  arduinoStop = () => {
    this.arduinoExecute('/stop');
  }

  arduinoExecute = (action) => {
    return new Promise((resolve, reject) => {
      this.setState({ activeAction: action + "...", actionError: "" });

      axios.get(arduinoBase + action).then(res => {
        this.setState({ activeAction: action + " " + res.statusText });
        resolve();
      }).catch(err => {
        this.setState({ activeAction: action, actionError: err.message });
        reject();
      });
    })
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.selectedRoomSensor != this.state.selectedRoomSensor
      || prevState[this.state.selectedRoomSensor] != this.state[this.state.selectedRoomSensor]) {
      var currentValue = this.state.selectedValue;
      var entry = this.state[this.state.selectedRoomSensor];
      if (entry) {
        var delta = entry.value - currentValue;

        var action = '/inflate'
        if (delta < 0) action = '/deflate'
        if (delta != 0) {
          this.setState({ selectedDelta: delta, selectedValue: entry.value });

          this.arduinoExecute(action).then(() => {
            this.actionIntervalAsync = setIntervalAsync(this.updateActionTimer, 100);
            this.actionTimeoutTime = Date.now() + delta * deltams;
            this.actionTimeout = setTimeout(this.arduinoStop, delta * deltams);
          });
        }
      }
    }
  }

  updateActionTimer() {
    if (this.actionTimeout) {
      var remaining = this.actionTimeoutTime - Date.now();
      if (remaining > 0)
        this.setState({ actionRemaining: "(" + (remaining / 1000).toFixed(1) + "s remaining)" });
      else {
        this.setState({ actionRemaining: "" });
        clearIntervalAsync(this.actionIntervalAsync);
      }
    }
  }

  componentDidMount() {
    this.downloadValues();
    this.downloadIntervalAsync = setIntervalAsync(this.downloadValues, 20000);
  }

  componentWillUnmount() {
    clearInterval(this.downloadIntervalAsync);
    clearTimeout(this.actionTimeout);
  }

  render() {

    return (
      <>
        <h1>Air Quality now</h1>
        <table>
          {rooms.map((room, index) => (
            <tbody key={room}>
              <tr><th>{room}</th><th>value</th></tr>
              {sensors.map((sensor, index) => (
                <tr key={sensor}><td><label><input name="source" type="radio" value={room + "/" + sensor} onChange={this.onSourceChange} />{sensor}</label></td>
                  <td>{this.getStateValue(room, sensor)}</td>
                </tr>
              ))}
            </tbody>))}
        </table>
        <p>Selected value: {this.state.selectedValue} ({this.state.selectedDelta.toFixed(2)} since last)</p>
        <p>Output: {this.state.activeAction} {this.state.actionRemaining} <span className="error">{this.state.actionError}</span></p>
      </>
    )
  }
}
export default App;

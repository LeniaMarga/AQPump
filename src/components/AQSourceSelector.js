import React, { Component } from 'react';
import { ReferenceLine, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';
import { setIntervalAsync } from 'set-interval-async/dynamic';

import global from '../global.js';
const { arduinos, sensors, rooms } = global;

class AQSourceSelector extends Component {
  constructor(props) {
    super(props);
    this.continueScript = false;
    this.script = {}

    this.downloadValues = this.downloadValues.bind(this);
    this.onValueSourceChange = this.onValueSourceChange.bind(this);
  }

  // is called every 20sec and fetches data for the above rooms & data sources
  downloadValues() {
    rooms.forEach(room => sensors.forEach(sensor => room.getValueAsync(sensor)));
  }

  // is called every 1min and fetches data for the above rooms & data historic sources
  downloadHistory() {
    rooms.forEach(room => sensors.forEach(sensor => room.getValueHistoryAsync(sensor)));
  }

  // rendering current values
  getStateValue = (room, sensor) => room.getStateValue(sensor) ?? "..."
  
  // user selects values
  onValueSourceChange(arduino, room, sensor) {
    arduino.setValueSource(room, sensor);
  }

  onScriptChanged = (room, sensor, ids) => {
    if (ids)
      this.script[room.key + "/" + sensor.key] = { room, sensor, ids };
  }
  onScriptPlay = async () => {
    // cache history
    let errors = "";
    for (let key in this.script) {
      let script = this.script[key];
      script.index = -1;
      script.indexTime = NaN;
      script.history = script.room.getStateValueHistory(script.sensor);
      script.arduinos = [];
      let ids = script.ids.split('');
      for (let i = 0; i < ids.length; i++) {
        let arduino = arduinos.find(a => a.id === ids[i]);
        if (arduino) {
          script.arduinos.push(arduino);
          arduino.setValueSource(null, null);
          document.getElementsByName("realtime-" + arduino.key).forEach(radio => radio.checked = false);
        }
        else
          errors += ids[i] + " for " + script.sensor.id + " in " + script.room.id + "\n";
      }
    }
    if (errors) {
      alert("The following arduino ids are not valid:\n\n" + errors);
      return;
    }
    
    this.continueScript = true;

    // play
    let index = 0;
    while (this.continueScript) {
      let promises = [];
      for (let key in this.script) {
        let script = this.script[key];
        if (!script || !script.history) continue;
        
        let times = [];
        for (let a = 0; a < script.arduinos.length; a++) {
          let i = index - a;
          if (i >= 0 && i < script.history.length) {
            times.push(script.history[i].time);
            let value = script.history[i].value;
            promises.push(script.arduinos[a].updateValueAsync(value, script.sensor));
          }
        }
        
        if (times.length < 1)
          script.indexTime = NaN;
        else
          script.indexTime = times[0];
      }
      
      if (promises.length < 1)
        break;
      
      await Promise.allSettled(promises);
      index++;
    }
  }
  onScriptStop = () => {
    this.continueScript = false;
  }
  onScriptClear = () => {
    document.getElementsByName("script").forEach(input => input.value = '');
    this.script = {};
  }
  
  getHistoryPlayIndex = (room, sensor) => {
    let indexTime = this.script[room.key + "/" + sensor.key]?.indexTime;
    if (!indexTime) return NaN;
    return new Date(indexTime).getTime();
  }

  // find first start and last end time of all history charts
  getHistoryTimespan() {
    var globalStartTime = Number.NaN;
    var globalEndTime = Number.NaN;
    
    rooms.forEach(room => {
      sensors.forEach(sensor => {
        var values = room.getStateValueHistory(sensor);
        if (values) {
          var startTime = new Date(values[values.length - 1]).getTime();
          var endTime = new Date(values[0]).getTime();
          if (Number.isNaN(globalStartTime) || startTime < globalStartTime) globalStartTime = startTime;
          if (Number.isNaN(globalEndTime) || endTime > globalEndTime) globalEndTime = endTime;
        }
      })
    });

    return [globalStartTime, globalEndTime];
  }

  // rendering history chart
  getHistoryData(room, sensor) {
    var data = [];

    var values = room.getStateValueHistory(sensor);
    if (values) {
      values.forEach(value => {
        var time = new Date(value.time).getTime();
        data.push({ "x": time, "y": value.value });
      });
    }

    return data;
  }

  componentDidMount() {
    this.downloadValues();
    this.downloadHistory();
    this.downloadValuesIntervalAsync = setIntervalAsync(this.downloadValues, 20000);
    this.downloadHistoryIntervalAsync = setIntervalAsync(this.downloadHistory, 60000);
  }

  componentWillUnmount() {
    clearInterval(this.downloadValuesIntervalAsync);
    clearInterval(this.downloadHistoryIntervalAsync);
  }

  render() {
    return (
      <>
        <table>
          {sensors.map((sensor, index) => (
            <tbody key={sensor.key}>
              <tr>
                {arduinos.map((arduino, index) => (
                  <th key={arduino.key} title={arduino.base}>{arduino.id}</th>
                ))}
                <th>room</th><th>{sensor.id}</th><th>history</th><th>play on</th>
              </tr>
              {rooms.map((room, index) => (
                <tr key={room.key}>
                  {arduinos.map((arduino, index) => (
                    <td key={room.key + '/' + arduino.key}><input name={`realtime-${arduino.key}`} type="radio" onChange={() => this.onValueSourceChange(arduino, room, sensor)} /></td>
                  ))}
                  <td>{room.id}</td><td>{this.getStateValue(room, sensor)}</td>
                  <td>
                    <ScatterChart width={200} height={32}>
                      <XAxis dataKey="x" hide domain={this.getHistoryTimespan()} />
                      <YAxis dataKey="y" hide domain={['dataMin', 'dataMax']} />
                      <ReferenceLine x={this.getHistoryPlayIndex(room, sensor)} stroke="red" />
                      <Scatter data={this.getHistoryData(room, sensor)} line={{ stroke: 'black' }} fill='transparent' />
                    </ScatterChart>
                  </td>
                  <td><input name="script" width={arduinos.length} type="text" onChange={(event) => this.onScriptChanged(room, sensor, event.target.value)}></input></td>
                </tr>
              ))}
            </tbody>))}
        </table>
        
        <div id="scriptButtons">
          <button onClick={this.onScriptPlay}>Play</button>
          <button onClick={this.onScriptStop}>Stop</button>
          <button onClick={this.onScriptClear}>Clear</button>
        </div>
      </>
    )
  }
}

export default AQSourceSelector;
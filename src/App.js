import React, {Component} from 'react';
import ReactDOM from "react-dom";
import axios from 'axios';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';

const googleApis = 'https://texttospeech.googleapis.com/v1/text:synthesize?fields=audioContent';
const apiKey = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const url = googleApis + '&key=' + apiKey;

const optionLanguage = [
  { value: 'en-US', label: 'English (United States)' },
  { value: 'en-AU', label: 'English (Australia)' },
  { value: 'en-GB', label: 'English (Great Britain)' },
  { value: 'ja-JP', label: '日本語 (日本)' },
  { value: 'de-DE', label: 'Deutsch (Deutschland)' },
  { value: 'fr-FR', label: 'Français (France)' },
  { value: 'it-IT', label: 'Italiano (Italia)' },
  { value: 'es-ES', label: 'Español (España)' }
];

const optionWakeword = [
  { value: 'Alexa,', label: 'Alexa'},
  { value: 'OK Google,', label: 'OK Google'},
  { value: 'Hey Google,', label: 'Hey Google'},
  { value: 'ねえ、 グーグル、', label: 'ねぇ グーグル'}
];

const defaultPostData = {
  "audioConfig":{
    "audioEncoding":"MP3",
    "pitch":0,
    "speakingRate":0.8
  },
  "input":{
    "text":""
  },
  "voice":{
    "languageCode":""
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language : 'en-US',
      wakeword : 'Alexa,',
      interval : '60',
      utterances : 'Turn on TV.\nVolume up TV.\nChange channel to BBC one.\nChange channel to BBC two.',
      ui : {
        textarea_description_1 : "発話するテキストを入力します。",
        textarea_description_2 : "複数ある場合は改行で区切ってください。",
        textarea_description_3 : "テンプレートから選ぶ",
        button : "SPEAK ALL",
        button_speak : "SPEAK All",
        button_pause : "PAUSE",
      }

    }
    this.utteranceCount = 0;
  }

  sendPost(url, data) {
    ReactDOM.render(
      <div />,
      document.getElementById("Audio"),
    );

    axios.post(url, data).then((res)=>{
      const audioData = res.data.audioContent;
      const src = 'data:audio/mp3;base64,'+audioData;
      ReactDOM.render(
          <audio preload="auto" autoPlay><source src={src}></source></audio>,
        document.getElementById("Audio"),
      );
    }).catch(console.error);
  }

  speechText(self) {
    if (self.utteranceArray[self.utteranceCount] === undefined) {
      return;
    }
    const inputText = self.state.wakeword + self.utteranceArray[self.utteranceCount];
    console.log("inputText "+inputText);
    var data = defaultPostData;
    data.input.text = inputText;
    data.voice.languageCode = self.state.language;
    self.sendPost(url, data);
    var utterances_date_element = document.getElementsByClassName('Utterances-date')[self.utteranceCount];
    if (utterances_date_element) {
      let d = new Date();
      let month  = (d.getUTCMonth()+1 < 10 ? " " + (d.getUTCMonth()+1) : d.getUTCMonth()+1);
      let date   = (d.getUTCDate()    < 10 ? " " + d.getUTCDate()      : d.getUTCDate());
      let hour   = (d.getUTCHours()   < 10 ? " " + d.getUTCHours()     : d.getUTCHours());
      let minute = (d.getUTCMinutes() < 10 ? "0" + d.getUTCMinutes()   : d.getUTCMinutes());
      let sec    = (d.getUTCSeconds() < 10 ? "0" + d.getUTCSeconds()   : d.getUTCSeconds());
      ReactDOM.render(month+"/"+date+" "+hour+":"+minute+":"+sec+" UTC", utterances_date_element);
    }
    self.utteranceCount++;
    if (self.utteranceArray.length <= self.utteranceCount) {
      console.log("clearInterval!!");
      self.utteranceCount = 0;
      var ui = self.state.ui;
      ui.button = ui.button_speak;
      self.setState({ui: ui});
      ReactDOM.render(<div />, document.getElementById("Curcle-speaking"));
      clearInterval(self.interval);
    }
  }

  speakClick = event => {
    var ui = this.state.ui;

    if (ui.button !== ui.button_pause) {
      ui.button = ui.button_pause;
      const intervalTime = Number(this.state.interval)*1000;
      this.utteranceArray = this.state.utterances.split(/\r\n|\n/);
      this.speechText(this);
      if (this.utteranceArray.length > 1) {
        this.interval = setInterval(this.speechText, intervalTime, this);
      }
      ReactDOM.render(<CircularProgress disableShrink />, document.getElementById("Curcle-speaking"));
    } else {
      ui.button = ui.button_speak;
      ReactDOM.render(<div />, document.getElementById("Curcle-speaking"));
      clearInterval(this.interval);
    }
    this.setState({ui: ui});
  }

  onChangeLanguage = event => {
    this.setState({language: event.target.value});
  }

  onChangeWakeword = event=> {
    this.setState({wakeword: event.target.value});
  }

  onChangeInterval = event => {
    this.setState({interval: event.target.value});
  }

  onChangeUtterances = event => {
    this.setState({utterances: event.target.value});

    this.utteranceArray = event.target.value.split(/\r\n|\n/);
    const listItems = this.utteranceArray.map(utterances =>
      <div className="Utterances-line">
        <Button onClick={this.listClick}>
          <ListItem>
            <ListItemText primary={this.state.wakeword + utterances} />
          </ListItem>
        </Button>
        <span className="Utterances-date"></span>
        <hr className="Utterances-under-line" />
      </div>
    );

    ReactDOM.render(
      <div className="Utterances-inner">
        <List>{listItems}</List>
      </div>,
    document.getElementById("utterances")
   );
  }

  listClick = event => {
    var data = defaultPostData;
    data.input.text = event.target.innerText;
    data.voice.languageCode = this.state.language;
    this.sendPost(url, data);
  }

  render() {
    const { language } = this.state;
    const { wakeword } = this.state;
    const { interval } = this.state;
    const { utterances } = this.state;
    const { ui } = this.state;

    return (
      <div>
        <div className="Settings">
          <div className="Settings-inner">
            <div className="Settings-line">
              <TextField select label="select Language / locale" value={language} onChange={this.onChangeLanguage} className="Settings-text">
                {
                  optionLanguage.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))
                }
              </TextField>
            </div>

            <div className="Settings-line">
              <TextField select label="wake word" value={wakeword} onChange={this.onChangeWakeword} className="Settings-text">
                {
                  optionWakeword.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                     {option.label}
                    </MenuItem>
                  ))
                }
              </TextField>
            </div>

            <div className="Settings-line">
              <TextField label="interval (sec)" value={interval} onChange={this.onChangeInterval} className="Settings-text">
                {
                  optionWakeword.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))
                }
              </TextField>
            </div>

            <div className="Settings-line">
              <label className="Settings-label">{ui.textarea_description_1}</label>
              <label className="Settings-label">{ui.textarea_description_2}</label>
              <Button variant="outlined" /*onClick={this.speakClick}*/>{ui.textarea_description_3}</Button>

            </div>
            <div className="Settings-line">
              <TextField multiline="true" className="Settings-textarea" value={this.state.utterances} onChange={this.onChangeUtterances} />
            </div>

            <div className="Settings-line">
              <Button variant="outlined" color="primary" onClick={this.speakClick}>{ui.button}</Button>
            </div>

            <div className="Settings-line">
              <div className="Circular-progress" id="Curcle-speaking">
              </div>
            </div>

          </div>
        </div>

        <div className="Utterances" id="utterances">
          <div className="Utterances-inner">
            <List>
              {
                utterances.split(/\r\n|\n/).map(utterance => (
                  <div className="Utterances-line">
                    <Button onClick={this.listClick}>
                      <ListItem>
                        <ListItemText primary={wakeword + utterance} />
                      </ListItem>
                    </Button>
                    <span className="Utterances-date"></span>
                    <hr className="Utterances-under-line" />
                  </div>
                ))
              }
            </List>
          </div>
        </div>
        <div id="Audio" />
      </div>
    );
  }
}

export default App;

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  View,
  Text,
  StatusBar,
} from 'react-native';

import NfcManager, {NfcEvents, Ndef, NfcTech} from 'react-native-nfc-manager';



function buildUrlPayload(valueToWrite) {
    return Ndef.encodeMessage([
        Ndef.uriRecord(valueToWrite),
    ]);
}


class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: null,

    }
  }

  componentDidMount() {
    NfcManager.start();
   this._enableReader();  
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      this.readNameFromNFC(tag);
      NfcManager.setAlertMessageIOS('I got your tag!');
      //NfcManager.unregisterTagEvent().catch(() => 0);
    });
  }

  componentWillUnmount() {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    this._disableReader();
    this._cleanUpWriter(); 
  }

  _disableReader = () => {
    NfcManager.unregisterTagEvent().catch(() => 0);
  }

  _enableReader = async () => {
    try {
      await NfcManager.registerTagEvent();
    } catch (ex) {
      console.warn('ex', ex);
      NfcManager.unregisterTagEvent().catch(() => 0);
    }
  }



  writeNameToNFC = async () => {

      let {name} = this.state;

      try {

        let resp = await NfcManager.requestTechnology(NfcTech.Ndef, {
          alertMessage: 'Ready to write some NFC tags!'
        });

        let ndef = await NfcManager.getNdefMessage();
        
        let bytes = buildUrlPayload(name);
       
        await NfcManager.writeNdefMessage(bytes);
       
        alert('Name saved to Tag successfully');
        
        await NfcManager.setAlertMessageIOS('I got your tag!');

        this._cleanUpWriter();
        
      } catch (ex) {
        console.warn('ex', ex);
        this._cleanUpWriter();
      }
  }

  _cleanUpWriter = () => {
      NfcManager.cancelTechnologyRequest().catch(() => 0);
  }


  readNameFromNFC= (tag) => {
    this.setState({name: Ndef.uri.decodePayload(tag.ndefMessage[0].payload)});
  }


  render() {

    const {name} = this.state;

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{
          flex: 1,
          padding: 30
        }}>
          <View style={{marginBottom: 30}}>
              <Text>
                Enter your name
              </Text>
              <TextInput 
                value={name || ''}
                style={{height: 45, borderColor: '#E2E2E2', borderWidth: 2, borderRadius: 5, paddingVertical: 15}}
                onChangeText={text => this.setState({name: text})}
              />
          </View>
          {/*<TouchableOpacity 
            onPress={this._enable}
            style={{marginBottom: 10, backgroundColor: 'violet', padding: 10, alignItems: 'center', borderRadius: 5}}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>READ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={this._disable}
            style={{marginBottom: 10, backgroundColor: 'red', padding: 10, alignItems: 'center', borderRadius: 5}}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>DISABLE</Text>
          </TouchableOpacity>*/}
          <TouchableOpacity 
            onPress={this.writeNameToNFC}
            style={{marginBottom: 10, backgroundColor: 'orange', padding: 10, alignItems: 'center', borderRadius: 5}}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>WRITE</Text>
          </TouchableOpacity>


          <TouchableOpacity 
            onPress={() => this.setState({name: ''})}
            style={{marginBottom: 10, backgroundColor: 'gray', padding: 10, alignItems: 'center', borderRadius: 5}}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>CLEAR ALL</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </>
    );
  }
};


export default App;

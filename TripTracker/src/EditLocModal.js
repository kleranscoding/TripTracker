import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, 
    TouchableHighlight, Alert, TouchableOpacity, Picker, Dimensions, } from 'react-native';
import { Appbar, Button, TextInput, } from  'react-native-paper';
import ModalDatePicker from 'react-native-datepicker-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CalendarPicker from 'react-native-calendar-picker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { serverURL, tokenName, regexWhitespaceOnly, } from './config/envConst';
import { GOOGLAPI } from '../envAPI.js';

/**
 * STYLESHEETS
 */

const styles = StyleSheet.create({
    appbarHeader:{
        backgroundColor: 'rgb(36,152,219)',
    },
    contentTitle: {
        fontSize: 24, fontFamily: 'Avenir',
    },
})

const modalStyles = StyleSheet.create({
    newLocGreeting: {
        textAlign: 'center', 
        fontSize: 24, fontFamily: 'Avenir', color: 'rgb(255,255,255)',
    },
    closeModalText: {
        marginRight: 5, 
        textAlign: 'right', fontSize: 18, color: 'rgb(255,255,255)',
    },
    modalHeader: {
        marginBottom: 20, 
        paddingBottom: 20, paddingTop: 35, backgroundColor: 'rgb(36,152,219)' 
    },
    datepicker: {
        justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center',
        borderColor: 'silver', borderWidth: 1, margin: 10,
    },
    "create_btn": {
        marginTop: 25, marginLeft:'25%', 
        borderRadius: 25,
        backgroundColor: 'rgba(36,152,219,0.75)',
        width: '50%',
    },
    "create_btn_text": {
        padding: 10, 
        textAlign: 'center', fontSize: 20, color: 'rgb(255,255,255)'
    },
})

/**
 * FUNCTIONS AND CONSTANTs 
 */
function validateWhtieSpaceOnly(text) { return regexWhitespaceOnly.test(text) }

function padZero(num) { return (num>=0 && num<=9)? `0${num}`:`${num}`; }

function dateToString(selectedDate) {
    let date= new Date(selectedDate)
    return `${date.getFullYear()}-${padZero(date.getMonth()+1)}-${padZero(date.getDate())}`
}

_getToken = async() => { return await AsyncStorage.getItem(tokenName) }


export default class EditLocModal extends Component {
    constructor(props) {
        super(props)
        this.location= props.selectOnEdit.location
        this.formatAddr= props.selectOnEdit.formatAddr
        this.geocode = props.selectOnEdit.geocode
        this.state = {
            dateStart: props.selectOnEdit.startDate, 
            dateEnd: props.selectOnEdit.endDate,
            openCalendar: false,
        }
    }

    submitEditLocInfo = () => {
        let refLoc = this.refs["location"].state.text, stateLoc = this.location
        let formatAddr = this.formatAddr, geocode = this.geocode
        let startDate = this.state.dateStart, endDate = this.state.dateEnd

        // use ref.state[location] if state[location] does not match ref.state[location]
        let location = stateLoc
        if (refLoc!==stateLoc) {
            location= refLoc
            formatAddr= '' 
            geocode= { "lat": '', "lng": '' }
        } 
        // check errors
        let errLoc= true, errDateStart= true, errDateEnd= true
        let errMsgLoc= '', errDates= '' 
        console.log(location);console.log(formatAddr);console.log(geocode);console.log(startDate, endDate)
        if (!location || validateWhtieSpaceOnly(location) ) {
            errMsgLoc = '\n- Please enter a location'
        } else {
            errLoc= false
        }
        if (!(startDate && endDate)) {
            errDates = "\n- Please select dates"
        } else if (startDate.localeCompare(endDate)>0) {
            errDates = "\n- Dates are invalid"
        } else {
            errDateStart= false
            errDateEnd= false
        }
        console.log(errLoc, errDateStart, errDateEnd)
        if (errLoc || errDateStart || errDateEnd) {
            Alert.alert("Hang on!"+errMsgLoc+errDates)
            return
        }
        //console.log("ok?");return
        _getToken().then(token=>{
            
            fetch(serverURL+'/api/locations/edit/'+this.props.selectOnEdit.id,{
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "location": location.trim(), "startDate": startDate, "endDate": endDate,
                    "formatAddress": formatAddr, "geocode": geocode,
                }),
            }).then(res=>{
                if (res.status===200) {
                    res.json().then(data=>{
                        //console.log("edit locs: ")
                        //console.log(data)
                        this.props.editLoc(data)
                    })
                }
            }).catch(err=>{ console.log(err) })
        }).catch(error=>{
            console.log("get token error:",error)
        })
    }

    onDateChange = (date, type) => {
        console.log(type)
        console.log(dateToString(date))
        if (type === 'END_DATE') {
          this.setState({ dateEnd: dateToString(date),})
        } else {
          this.setState({ dateStart: dateToString(date),dateEnd: ''})
        }
    }

    render() {
        return (
    <React.Fragment>
        
      <Appbar.Header statusBarHeight={20} style={styles.appbarHeader}>
        <Appbar.Content title="Edit Location Info" titleStyle={styles.contentTitle} />
        <Button onPress={()=>this.props.setModalEdit(false,"modalEditLoc","")}
            style={{alignItems: 'center', alignContent: 'flex-end'}}>
            <Text style={{color: "rgb(255,255,255)"}}>Close</Text>
        </Button> 
      </Appbar.Header>

      <KeyboardAwareScrollView>
        
        <GooglePlacesAutocomplete 
        ref="location" query={{ key: GOOGLAPI, types: ['geocode', 'cities'] }}
        style={{margin: 20, borderRadius: 5, fontSize: 18, }}
        placeholder='Enter Location' minLength={2} autoFocus={false} returnKeyType={'next'}
        fetchDetails={true} currentLocation={true} debounce={200} 
        renderDescription={row => row.description} 
        getDefaultValue={() => this.location}
        onPress={(data, details = null) => { 
            //console.log(data.description);console.log(details["formatted_address"]);console.log(details.geometry.location)
            this.location= data.description
            console.log(details["formatted_address"])
            this.formatAddr= details["formatted_address"]
            this.geocode= details.geometry.location
        }}/>


      {/* <View >
        <CalendarPicker
          startFromMonday={true}
          allowRangeSelection={true}
          todayBackgroundColor="#f2e6ff"
          selectedDayColor="#7300e6"
          selectedDayTextColor="#FFFFFF"
          onDateChange={this.onDateChange}
        />
 
        <View>
          <Text>SELECTED START DATE:{ this.state.dateStart || 'no selection' }</Text>
          <Text>SELECTED END DATE:{ this.state.dateEnd || 'no selection' }</Text>
        </View>
      </View> */}

        <View style={{margin: 10}}>
            <Text style={{margin: 10, fontSize: 16, fontFamily: 'Avenir', color: 'rgb(49,90,158)'}}>
                START DATE:{' '+this.state.dateStart }
            </Text>
            <Text style={{margin: 10, fontSize: 16, fontFamily: 'Avenir', color: 'rgb(49,90,158)'}}>
                END DATE:{ ' '+this.state.dateEnd }
            </Text>
        </View>

        <TouchableOpacity style={{
                width:'50%', marginLeft: 10, backgroundColor: 'rgb(36,152,219)',
                borderColor: 'silver', borderWidth: 1, borderRadius: 10, padding: 5
            }}
            onPress={()=>this.setState({openCalendar: !this.state.openCalendar})}>
            <Text style={{
                textAlign: 'center', fontSize: 20, fontFamily: 'Avenir', color: 'rgb(255,255,255)'}}
            >
                {this.state.openCalendar? 'Close ' : 'Open '} Calendar
            </Text>
        </TouchableOpacity>
        
        {this.state.openCalendar && 
        <View style={{borderColor: 'silver', borderWidth: 1, margin: 10, borderRadius: 10}}>
            <CalendarPicker
                startFromMonday={true}
                allowRangeSelection={true}
                todayBackgroundColor="rgb(49,90,158)"
                selectedDayColor="rgb(49,90,158)"
                selectedDayTextColor="rgb(255,255,255)"
                onDateChange={this.onDateChange}
            />
        </View>}

        {/* <TouchableOpacity onPress={this.submitEditLocInfo} style={modalStyles["create_btn"]}>
            <Text style={modalStyles["create_btn_text"]}>
                Update Location
            </Text>
        </TouchableOpacity> */}

        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 100}}>
            <Button onPress={()=>this.props.setModalEdit(false,"modalEditLoc","")} 
                style={{marginLeft: 10, marginRight: 10, borderColor: 'silver', borderWidth: 1, borderRadius: 10}}
            >
                <Text>Cancel</Text>
            </Button>
            <Button onPress={this.submitLocInfo} 
                style={{backgroundColor: 'rgb(49,90,158)', borderRadius: 10, marginLeft: 10, marginRight: 10 }}>
                <Text style={{color: 'white'}}>Update Location</Text>
            </Button>
        </View>
        
      </KeyboardAwareScrollView>
        
    </React.Fragment>
        )
    }
}
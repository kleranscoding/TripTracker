import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, 
    TouchableHighlight, Alert, TouchableOpacity, Picker, Dimensions, } from 'react-native';
import { Appbar, Button, TextInput, } from  'react-native-paper';
import ModalDatePicker from 'react-native-datepicker-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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

_getToken = async() => { return await AsyncStorage.getItem(tokenName) }


export default class EditLocModal extends Component {
    constructor(props) {
        super(props)
        this.location= props.selectOnEdit.location
        this.formatAddr= props.selectOnEdit.formatAddr
        this.geocode = props.selectOnEdit.geocode
        this.state = {
            dateStart: props.selectOnEdit.startDate, dateEnd: props.selectOnEdit.endDate,
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
            errMsgLoc = '- Please enter a location'
        } else {
            errLoc= false
        }
        if (!(startDate && endDate)) {
            errDates = "- Please select dates"
        } else if (startDate.localeCompare(endDate)>0) {
            errDates = "- Dates are invalid"
        } else {
            errDateStart= false
            errDateEnd= false
        }
        console.log(errLoc, errDateStart, errDateEnd)
        if (errLoc || errDateStart || errDateEnd) {
            Alert.alert("Hang on!\n"+errMsgLoc+'\n'+errDates)
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

    setDate = (newDate)=> { this.setState({chosenDate: newDate}); }

    updateDate = (name,date) => { this.setState({ [name]: date }) }

    render() {
        return (
    <React.Fragment>
        
      <Appbar.Header statusBarHeight={20} style={styles.appbarHeader}>
        <Appbar.Content title="New Location Info" titleStyle={styles.contentTitle} />
        <Button onPress={()=>this.props.setModalEdit(false,"modalEditLoc","")}
            style={{alignItems: 'center', alignContent: 'flex-end'}}>
            <Text style={{color: "rgb(255,255,255)"}}>Close</Text>
        </Button> 
      </Appbar.Header>

      <ScrollView>
        
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

        <View style={{margin: 25 }}>
            {/* <View style={modalStyles.datepicker}> */}
                <Text style={{fontSize: 18, margin: 10}}>Start Date: </Text>
                <ModalDatePicker startDate={new Date(this.state.startDate)}
                    renderDate={({ year, month, day, date }) => {
                        let selectedDate = "Click here to select a start date"
                        if (date) { 
                            selectedDate = `${year}-${month}-${day}` 
                        } else {
                            selectedDate = this.props.selectOnEdit.startDate
                        }
                        return <Text style={{fontSize: 18}}>{selectedDate}</Text>
                    }}
                    onDateChanged={({ year, month, day, date }) => {
                        if (date) {
                            this.updateDate("dateStart",`${year}-${month}-${day}`)
                        }
                    }}
                />
            {/* </View> */}
            {/* <View style={modalStyles.datepicker}> */}
                <Text style={{fontSize: 18, margin: 10}}>End Date: </Text>
                <ModalDatePicker startDate={new Date(this.state.endDate)}
                    renderDate={({ year, month, day, date }) => {
                        let selectedDate = "Click here to select an end date"
                        if (date) { 
                            selectedDate = `${year}-${month}-${day}` 
                        } else {
                            selectedDate = this.props.selectOnEdit.endDate
                        }
                        return <Text style={{fontSize: 18}}>{selectedDate}</Text>
                    }}
                    onDateChanged={({ year, month, day, date }) => {
                        if (date) {
                            this.updateDate("dateEnd",`${year}-${month}-${day}`)
                        }
                    }}
                />
            {/* </View> */}
        </View>
        

        <TouchableOpacity onPress={this.submitEditLocInfo} style={modalStyles["create_btn"]}>
            <Text style={modalStyles["create_btn_text"]}>
                Update Location
            </Text>
        </TouchableOpacity>
        
      </ScrollView>
        
    </React.Fragment>
        )
    }
}
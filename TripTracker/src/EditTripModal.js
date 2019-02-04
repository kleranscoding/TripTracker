import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, 
    TouchableHighlight, Alert, TouchableOpacity, Picker, Dimensions, } from 'react-native';
import { Appbar, Button, TextInput, } from  'react-native-paper';
import ModalDatePicker from 'react-native-datepicker-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CalendarPicker from 'react-native-calendar-picker';

import { serverURL, tokenName, regexWhitespaceOnly, } from './config/envConst';


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


export default class EditTripModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tripTitle: props.selectOnEdit.title,
            dateStart: props.selectOnEdit.startDate, 
            dateEnd: props.selectOnEdit.endDate,
            errTripTitle: false,
            openCalendar: false,
        }
    }

    submitEditTripInfo = () => {
        let title = this.state.tripTitle
        let startDate = this.state.dateStart, endDate = this.state.dateEnd
        
        // check errors
        let errTitle= true, errDateStart= true, errDateEnd= true
        let errMsgTitle= '', errMsgDates= '' 
        console.log(title);console.log(startDate, endDate)
        if (!title || validateWhtieSpaceOnly(title) ) {
            errMsgTitle = '\n- Please enter a trip name'
        } else {
            errTitle= false
        }
        if (!(startDate && endDate)) {
            errDates = "\n- Please select start and end date"
        } else if (startDate.localeCompare(endDate)>0) {
            errDates = "\n- Dates are invalid"
        } else {
            errDateStart= false
            errDateEnd= false
        }
        console.log(errTitle, errDateStart, errDateEnd)
        if (errTitle || errDateStart || errDateEnd) {
            Alert.alert("Hang on!"+errMsgTitle+errMsgDates)
            return
        }
        //console.log("ok?");return
        _getToken().then(token=>{
            
            fetch(serverURL+'/api/trips/edit/'+this.props.selectOnEdit.id,{
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "title": title.trim(), "startDate": startDate, "endDate": endDate,
                }),
            }).then(res=>{
                if (res.status===200) {
                    res.json().then(data=>{
                        console.log("edit trips: ")
                        console.log(data)
                        this.props.editTrip(data)
                    })
                }
            }).catch(err=>{ console.log(err) })
        }).catch(error=>{
            console.log("get token error:",error)
        })
    }

    onFocus = () => { this.setState({errTripTitle: false}) }

    onBlur = (evt) => {
        if (!evt.nativeEvent.text) {
            this.setState({errTripTitle: true})
            return
        }
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
        <Appbar.Content title="Edit Trip Info" titleStyle={styles.contentTitle} />
        <Button onPress={()=>this.props.setModalEdit(false,"modalEditTrip","")}
            style={{alignItems: 'center', alignContent: 'flex-end'}}>
            <Text style={{color: "rgb(255,255,255)"}}>Close</Text>
        </Button> 
      </Appbar.Header>

      <KeyboardAwareScrollView>
        
        <TextInput label='Enter Trip Name' mode="outlined" value={this.state.tripTitle}
            defaultValue={this.state.tripTitle}
            onChangeText={text => this.setState({ tripTitle: text })}
            onBlur={this.onBlur} onFocus={this.onFocus}
            style={{margin: 20, borderRadius: 5, backgroundColor: 'rgb(255,255,255)' }} 
            error={this.state.errTripTitle}
        />

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

        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 100, marginBottom: 100}}>
            <Button onPress={()=>this.props.setModalEdit(false,"modalEditTrip","")} 
                style={{marginLeft: 10, marginRight: 10, borderColor: 'silver', borderWidth: 1, borderRadius: 10}}
            >
                <Text>Cancel</Text>
            </Button>
            <Button onPress={this.submitEditTripInfo} 
                style={{backgroundColor: 'rgb(49,90,158)', borderRadius: 10, marginLeft: 10, marginRight: 10 }}>
                <Text style={{color: 'white'}}>Update Trip Info</Text>
            </Button>
        </View>

        {/* <TouchableOpacity onPress={this.submitEditTripInfo} style={modalStyles["create_btn"]}>
            <Text style={modalStyles["create_btn_text"]}>
                Update Trip Info
            </Text>
        </TouchableOpacity> */}
        
      </KeyboardAwareScrollView>
        
    </React.Fragment>
        )
    }
}
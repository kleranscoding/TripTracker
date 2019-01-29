import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, 
    TouchableHighlight, Modal, Alert, TouchableOpacity } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar, Button, TextInput } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import ModalDatePicker from 'react-native-datepicker-modal'

import { serverURL, tokenName,regexWhitespace } from './config/envConst';


const styles = StyleSheet.create({
    appbarHeader:{
        backgroundColor: 'rgb(36,152,216)',
    },
    contentTitle: {
        fontSize: 24, fontFamily: 'Avenir',
    },
    tripInfo: {
        textAlign: 'center',
        fontSize: 20, fontFamily: 'Avenir',
    },
    newTripGreeting: {
        textAlign: 'center', 
        fontSize: 24, fontFamily: 'Avenir', color: 'rgb(255,255,255)',
    },
    closeModalText: {
        marginRight: 5, 
        textAlign: 'right', fontSize: 18, color: 'rgb(255,255,255)',
    },
    datepicker: {
        justifyContent: 'center', flexDirection: 'row', alignItems: 'center',
    },
    "datepicker_err": {
        borderColor: 'rgb(255,0,0)', borderWidth: 1, borderRadius: 5,
    },
    "create_btn": {
        marginTop: 25,
        borderRadius: 25,
        backgroundColor: 'rgba(36,152,219,0.75)',
        marginLeft:'25%', width: '50%',
    },
})

function validateWhtieSpaceOnly(text) {
    return regexWhitespace.test(text)
}

class NewTripModal extends Component {
    
    state= {
        tripTitle: '',
        dateStart: '', dateEnd: '',
        errTripTitle: false,
        errDateStartStyle: {fontSize: 18}, errDateEndStyle: {fontSize: 18},
    }

    setDate = (newDate)=> {
        this.setState({chosenDate: newDate});
    }

    onFocus = () => {
        this.setState({errTripTitle: false})
    }

    onBlur = (evt) => {
        if (!evt.nativeEvent.text) {
            this.setState({errTripTitle: true})
            return
        }
    }

    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    submitTripInfo = () => {
        
        let tripTitle = this.state.tripTitle
        let startDate = this.state.dateStart, endDate = this.state.dateEnd
        let errTitle= true, errDateStart= true, errDateEnd= true
        console.log(tripTitle, startDate, endDate)
        if (!tripTitle || validateWhtieSpaceOnly(tripTitle) ) {
            this.setState({errTripTitle: true})
        } else {
            errTitle= false
        }
        if (!(startDate && endDate && startDate.localeCompare(endDate)<=0) ) {
            if (startDate.localeCompare(endDate)>0) Alert.alert("invalid dates")
        } else {
            errDateStart= false
            errDateEnd= false
        }
        console.log(errTitle, errDateStart, errDateEnd)
        if (errTitle || errDateStart || errDateEnd) return

        this._getToken().then(token=>{
            
            fetch(serverURL+'/api/trips/new',{
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "title": tripTitle, "startDate": startDate, "endDate": endDate,
                }),
            }).then(res=>{
                if (res.status===200) {
                  res.json().then(data=>{
                    this.props.setModalVisible(false)
                    this.props.addTrips(data)
                  })
                }
            }).catch(err=>{ console.log(err) })
        }).catch(error=>{
            console.log("get token error:",error)
        })
    }


    updateDate = (name,date) => {
        this.setState({ [name]: date })
    }

    render() {
        return (
    <React.Fragment>
      <View style={{marginBottom: 20, paddingBottom: 20, paddingTop: 35, backgroundColor: 'rgb(36,152,216)' }}>
        <TouchableHighlight onPress={()=>this.props.setModalVisible(false)}>
          <Text style={styles.closeModalText}>
            Close &times;
          </Text>
        </TouchableHighlight>
        <Text style={styles.newTripGreeting}>
            New Trip Info
        </Text>
      </View>

      <ScrollView>
        
        <TextInput label='Enter Trip Title' mode="outlined" value={this.state.tripTitle}
            onChangeText={text => this.setState({ tripTitle: text })}
            onBlur={this.onBlur} onFocus={this.onFocus}
            style={{margin: 20, borderRadius: 5, backgroundColor: 'rgb(255,255,255)' }} 
            error={this.state.errTripTitle}
        />
        
        <View style={styles.datepicker}>
            <Text style={{fontSize: 18, margin: 10}}>Start Date: </Text>
            <ModalDatePicker startDate={new Date()}
                renderDate={({ year, month, day, date }) => {
                if (!date) {
                    return (<Text style={{fontSize: 18}}>Pick a start date</Text>)
                }
                let selectedDate= `${year}-${month}-${day}`
                return <Text style={{fontSize: 18}}>{selectedDate}</Text>
                }}
                onDateChanged={({ year, month, day, date }) => {
                    if (date) {
                        this.updateDate("dateStart",`${year}-${month}-${day}`)
                    }
                }}
            />
        </View>
    

        <View style={styles.datepicker}>
            <Text style={{fontSize: 18, margin: 10}}>End Date: </Text>
            <ModalDatePicker startDate={new Date()}
                renderDate={({ year, month, day, date }) => {
                    let selectedDate = "Pick an end date"
                    if (date) { 
                        selectedDate = `${year}-${month}-${day}` 
                    }
                    return <Text style={{fontSize: 18}}>{selectedDate}</Text>
                }}
                onDateChanged={({ year, month, day, date }) => {
                    if (date) {
                        this.updateDate("dateEnd",`${year}-${month}-${day}`)
                    }
                }}
            />
        </View>

        <TouchableOpacity onPress={this.submitTripInfo} style={styles["create_btn"]}>
            <Text style={{textAlign: 'center', fontSize: 20, padding: 10, color: 'rgb(255,255,255)'}}>
                Create Trip
            </Text>
        </TouchableOpacity>
      
      </ScrollView>
        
    </React.Fragment>
        )
    }
}


export default class TripContainer extends Component {

    state= {
        trips: [],
        modalVisible: false,
    }

    setModalVisible = (visible) => {
        this.setState({modalVisible: visible})
    }

    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    addTrips = (trip) => {
        let trips = this.state.trips
        trips.push(trip)
        this.setState({ trips })
    }

    componentDidMount = () => {
        this._getToken().then(token=>{
            //*
            fetch(serverURL+'/api/users/profile' ,{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res=>{
                if (res.status===200) {
                    res.json().then(data=>{
                        this.setState({ trips: data.trips, })
                    })
                }
                
            }).catch(err=>{ console.log(err) })
            //*/
        }).catch(error=>{
            console.log("get token error:",error)
        })
    }

    render() {

        let numTrips = this.state.trips.length>0 ? 
            <Text style={styles.tripInfo}>{`You have ${this.state.trips.length} trips`}</Text> : 
            <Text style={styles.tripInfo}>You don't have any trip yet</Text>
            
        return (
    <React.Fragment>
        
        <Appbar.Header statusBarHeight={20} style={styles.appbarHeader}>
            <Appbar.Content title="Trips" titleStyle={styles.contentTitle} />
        </Appbar.Header>
        
        <View style={{justifyContent: 'center', padding: 15, 
            borderBottomWidth: 2, borderBottomColor: 'grey', }}>
          <Button style={{borderRadius: 20, width: '50%', marginLeft: '25%', 
            backgroundColor: 'rgb(49,90,158)'}}
            onPress={()=>this.setModalVisible(true)}>
            <Text style={{color: 'rgb(255,255,255)', fontSize: 20}}>
              + New Trip
            </Text>  
          </Button>
          
        </View>

        <ScrollView style={{marginTop: 25}}>
          {numTrips}
        </ScrollView>

        <Modal animationType="slide" transparent={false} visible={this.state.modalVisible}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalVisible(false)
        }}>
            <NewTripModal setModalVisible={this.setModalVisible} addTrips={this.addTrips} />
        </Modal>

    </React.Fragment>
        )
    }
}
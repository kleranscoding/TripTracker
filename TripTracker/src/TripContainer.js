import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, 
    TouchableHighlight, Modal, Alert, TouchableOpacity } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar, Button, TextInput, Card, Title, Paragraph  } from  'react-native-paper';
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
    addNewBtn: {
        marginLeft: '25%', 
        borderRadius: 20, width: '50%', 
        backgroundColor: 'rgb(49,90,158)'
    },
})

const modalStyles = StyleSheet.create({
    newTripGreeting: {
        textAlign: 'center', 
        fontSize: 24, fontFamily: 'Avenir', color: 'rgb(255,255,255)',
    },
    closeModalText: {
        marginRight: 5, 
        textAlign: 'right', fontSize: 18, color: 'rgb(255,255,255)',
    },
    modalHeader: {
        marginBottom: 20, 
        paddingBottom: 20, paddingTop: 35, backgroundColor: 'rgb(36,152,216)' 
    },
    datepicker: {
        justifyContent: 'center', flexDirection: 'row', alignItems: 'center',
    },
    "datepicker_err": {
        borderColor: 'rgb(255,0,0)', borderWidth: 1, borderRadius: 5,
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

const cardStyles = StyleSheet.create({
    container: { flex: 1, },
    content: { padding: 4, },
    card: { margin: 10, },
    cardImg: {
        width: '100%', height: 200,
    },
})

function validateWhtieSpaceOnly(text) { return regexWhitespace.test(text) }

class NewTripModal extends Component {
    
    state= {
        tripTitle: '',
        dateStart: '', dateEnd: '',
        errTripTitle: false,
        errDateStartStyle: {fontSize: 18}, errDateEndStyle: {fontSize: 18},
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

    setDate = (newDate)=> { this.setState({chosenDate: newDate}); }

    onFocus = () => { this.setState({errTripTitle: false}) }

    onBlur = (evt) => {
        if (!evt.nativeEvent.text) {
            this.setState({errTripTitle: true})
            return
        }
    }

    updateDate = (name,date) => { this.setState({ [name]: date }) }

    render() {
        return (
    <React.Fragment>
      <View style={modalStyles.modalHeader}>
        <TouchableHighlight onPress={()=>this.props.setModalVisible(false)}>
          <Text style={modalStyles.closeModalText}>
            Close &times;
          </Text>
        </TouchableHighlight>
        <Text style={modalStyles.newTripGreeting}>
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
        
        <View style={modalStyles.datepicker}>
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
    

        <View style={modalStyles.datepicker}>
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

        <TouchableOpacity onPress={this.submitTripInfo} style={modalStyles["create_btn"]}>
            <Text style={modalStyles["create_btn_text"]}>
                Create Trip
            </Text>
        </TouchableOpacity>
      
      </ScrollView>
        
    </React.Fragment>
        )
    }
}


export default class TripContainer extends Component {

    constructor(props) {
        super(props)
        props.navigation.addListener('didFocus',payload => {
            console.debug('didFocus', payload);
            this._getTripInfo()
        })
        this.state= {
            trips: [], modalVisible: false,
        }
    }

    componentDidMount = () => { this._getTripInfo() }

    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }


    _getTripInfo = () => {
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

    addTrips = (trip) => {
        let trips = this.state.trips
        trips.push(trip)
        this.setState({ trips })
    }


    setModalVisible = (visible) => { this.setState({modalVisible: visible}) }
    
    render() {

        let numTrips = this.state.trips.length>0 ? 
            <Text style={styles.tripInfo}>{`You have ${this.state.trips.length} trips`}</Text> : 
            <Text style={styles.tripInfo}>You don't have any trip yet</Text>
        
        let allTrips = []
        this.state.trips.map((trip,index)=>{
            return allTrips.push(
                <Card style={cardStyles.card} key={index}>
                  <Card.Content>
                    <Title >{trip.title}</Title>
                    <Card.Cover source={{ uri: serverURL+'/'+trip.image }} style={cardStyles.cardImg} />
                    <Paragraph>Trip from {trip.startDate} to {trip.endDate}</Paragraph>
                  </Card.Content>
                  <Card.Actions style={{alignSelf: 'center', margin: 15 }}>
                    <TouchableOpacity >
                      <Text style={{fontSize: 18, color: 'rgb(36,152,216)' }}>
                        Learn More
                      </Text>
                    </TouchableOpacity>
                  </Card.Actions>
                </Card>
            )
        })
        

        return (
    <React.Fragment>
        
        <Appbar.Header statusBarHeight={20} style={styles.appbarHeader}>
            <Appbar.Content title="Trips" titleStyle={styles.contentTitle} />
        </Appbar.Header>
        
        <View style={{justifyContent: 'center', padding: 15, 
            borderBottomWidth: 2, borderBottomColor: 'grey', }}>
          <TouchableOpacity style={styles.addNewBtn}
            onPress={()=>this.setModalVisible(true)}>
            <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 20}}>
              + New Trip
            </Text>  
          </TouchableOpacity>
          
        </View>
        
        {numTrips}

        <ScrollView style={{marginTop: 25}}>
          
          {allTrips}
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
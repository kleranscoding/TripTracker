import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, Image,
    TouchableHighlight, Modal, Alert, TouchableOpacity } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar, Button, TextInput, Card, Title, Paragraph  } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import ModalDatePicker from 'react-native-datepicker-modal';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { serverURL, tokenName, regexWhitespaceOnly } from './config/envConst';
import { GOOGLAPI } from '../envAPI';
 
const styles = StyleSheet.create({
    imgSmall: {
        width: '50%', height: 75,
    },
    img: {
        width: '100%', height: 200,
    },
    imgViewSmall: {
        height: 100, 
    },
    imgView: {
        height: 250, 
    },
    locInfo: {
        marginTop: 5,
        textAlign: 'center',
        fontSize: 20, fontFamily: 'Avenir',
    },
})

const locStyles = StyleSheet.create({
    addNewBtn: {
        marginTop: 10 , marginLeft: '25%', 
        borderRadius: 20, width: '50%', 
        backgroundColor: 'rgb(49,90,158)'
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
    card: { 
        margin: 10, 
        borderColor: 'rgba(192,192,192,0.75)', borderWidth: 1,
    },
    cardImg: {
        width: '100%', height: 200,
    },
})

function validateWhtieSpaceOnly(text) { return regexWhitespaceOnly.test(text) }

class LocationContainer extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            locations: []
        }
    }
    
    componentDidMount = () => {
        console.log("didmount")
        console.log(this.props.locations)
        this.setState({ locations: this.props.locations})
    }

    render() {
        console.log("render")
        console.log(this.state.locations)
        //let numLocs = null
        let numLocs = this.state.locations.length>0 ? 
            this.state.locations.length > 1 ?
                <Text style={styles.locInfo}>{`There are ${this.state.locations.length} locations`}</Text> :
                <Text style={styles.locInfo}>{`There is ${this.state.locations.length} location`}</Text> :
            <Text style={styles.locInfo}>You don't have any location in this trip yet</Text>
        
        return(
        <React.Fragment>
            {numLocs}
        </React.Fragment>
        )
    }
}


class NewLocModal extends Component {
    constructor() {
        super()
        this.location= ''
        this.formatAddr= ''
        this.geocode = {}
        this.state = {
            dateStart: '', dateEnd: '',
        }
    }
    
    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    submitLocInfo = () => {
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
        
        this._getToken().then(token=>{
            
            fetch(serverURL+'/api/locations/new',{
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "tripId": this.props.tripId,
                    "location": location.trim(), "startDate": startDate, "endDate": endDate,
                    "formatAddr": formatAddr, "geocode": geocode,
                }),
            }).then(res=>{
                if (res.status===200) {
                  res.json().then(data=>{
                    this.props.setModalVisible(false)
                    this.props.addLocs(data)
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
      <View style={modalStyles.modalHeader}>
        <TouchableHighlight onPress={()=>this.props.setModalVisible(false)}>
          <Text style={modalStyles.closeModalText}>
            Close &times;
          </Text>
        </TouchableHighlight>
        <Text style={modalStyles.newLocGreeting}>
            New Location Info
        </Text>
      </View>

      <ScrollView>
        
      <GooglePlacesAutocomplete 
        ref="location"
        query={{ key: GOOGLAPI, types: ['geocode', 'cities'] }}
        placeholder='Enter Location'
        minLength={2}
        autoFocus={false}
        returnKeyType={'next'}
        fetchDetails={true}
        currentLocation={false}
        renderDescription={row => row.description} 
        onPress={(data, details = null) => { 
            console.log(data.description);console.log(details["formatted_address"]);console.log(details.geometry.location)
            this.location= data.description
            this.formatAddr= details["formatted_address"]
            this.geocode= details.geometry.location
        }}
        style={{margin: 20, borderRadius: 5, fontSize: 18, }}
        debounce={200} />

        {/* <TextInput label='Enter Location' mode="outlined" value={this.state.location}
            style={{margin: 20, borderRadius: 5, backgroundColor: 'rgb(255,255,255)' }} /> */}
        
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

        <TouchableOpacity onPress={this.submitLocInfo} style={modalStyles["create_btn"]}>
            <Text style={modalStyles["create_btn_text"]}>
                Add Location
            </Text>
        </TouchableOpacity>
      
      </ScrollView>
        
    </React.Fragment>
        )
    }
}

class MapContainer extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            region: {
                latitude: props.geocode.lat,
                longitude: props.geocode.lng,
                latitudeDelta: 0.0922,longitudeDelta: 0.0421,
            },
        }
    }
    
    onRegionChange = (region)=> { this.setState({ region }) }
  
    render() {
        return(
            <MapView style={{margin: 20, height: '75%', }} 
                region={this.state.region} onRegionChange={this.onRegionChange} />
        )
    }
    
  }


export default class TripDetail extends Component {

    constructor(props) {
        super(props)
        this.state = { 
            locations: [],
            tripDetails: {},
            resize: false,
            modalVisible: false,
            imgView: styles.imgViewSmall, imgSize: styles.imgSmall,
        }
    }

    static navigationOptions =({navigation})=> {
        return {
            title: navigation.getParam('title'),
            headerTintColor: '#fafafa',
            headerTitleStyle: {
                fontSize: 24, fontFamily: 'Avenir',
            },
            headerStyle: {
                backgroundColor: 'rgba(36,152,219,0.5)'
            }
        }
    }

    componentDidMount = () => {
        this._getTripDetails()
    }

    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    _getTripDetails = () => {
        this._getToken().then(token=>{
            console.log("details= ",token)
            const tripId = this.props.navigation.getParam('tripId', null)
            if (!tripId) {
                this.props.navigation.goBack()
            }
            fetch(serverURL+'/api/trips/'+tripId,{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, },
            }).then(res=>{
                if (res.status===200) {
                  res.json().then(data=>{
                    console.log(data)
                    this.setState({ tripDetails: data })
                  })
                }
            }).catch(err=>{ console.log(err) })
        }).catch(error=>{
            console.log("get token error:",error)
        })
    }

    addLocs = (loc) => {
        let locations = this.state.tripDetails.locations
        locations.push(loc)
        this.setState(prevState=>({ 
            ...prevState.tripDetails, locations 
        }))
    }

    setModalVisible = (visible) => { this.setState({modalVisible: visible}) }

    resizeImg = () => {
        if (this.state.resize) {
            this.setState({
                imgView: styles.imgViewSmall,
                imgSize: styles.imgSmall,
                resize: false,
            })
        } else {
            this.setState({
                imgView: styles.imgView,
                imgSize: styles.img,
                resize: true,
            })
        }
    }

    render() {
        console.log("locations")
        console.log(this.state.tripDetails.locations)
        
        let allLocs = []
        if (this.state.tripDetails.locations) {
            this.state.tripDetails.locations.map((loc,index)=>{
                return allLocs.push(
                    <Card style={cardStyles.card} key={index}>
                      <Card.Content>
                        
                        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                          <TouchableOpacity style={{marginLeft: 10, marginRight: 10}}
                            >
                            <Ionicons name="ios-build" size={28} color="rgb(36,152,219)"/>
                          </TouchableOpacity>
                          <TouchableOpacity style={{marginLeft: 10, marginRight: 10}}
                            >
                            <Ionicons name="ios-trash" size={28} color="rgb(225,5,5)"/>
                          </TouchableOpacity>
                        </View>
    
                        <Title style={{fontSize: 24, marginBottom: 5}}>{loc.location}</Title>
                        <View style={cardStyles.cardImg}>
                            <MapContainer geocode={loc.geocode} />
                        </View>
                        
                        {/* <Card.Cover source={{ uri: serverURL+'/'+loc.image }} style={cardStyles.cardImg} /> */}
                        <Paragraph style={{fontSize: 16}}>
                          Time: {loc.startDate} to {loc.endDate}
                        </Paragraph>
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
        }
        

        return (
    <React.Fragment>
        <View style={this.state.imgView}>
            <ScrollView style={{margin: 10, }}> 
                <TouchableOpacity onPress={this.resizeImg}>
                    <Image source={{uri: serverURL+'/'+this.state.tripDetails.image}} 
                        style={this.state.imgSize} />
                </TouchableOpacity>
                
            </ScrollView>
        </View>
        <View style={{margin: 15, }}>
            <TouchableOpacity style={locStyles.addNewBtn} onPress={()=>this.setModalVisible(true)}>
                <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 20}}>
                    + New Locations
                </Text>
            </TouchableOpacity>
        </View>
        <ScrollView style={{margin: 10, marginTop: 25}}>
            {this.state.tripDetails.locations!==undefined?
            <LocationContainer locations={this.state.tripDetails.locations} />:null
            }
            {allLocs}
        </ScrollView>

        <Modal animationType="slide" transparent={false} visible={this.state.modalVisible}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalVisible(false)
        }}>
            <NewLocModal setModalVisible={this.setModalVisible} addLocs={this.addLocs} tripId={this.state.tripDetails.id} />
        </Modal>
    </React.Fragment>
        )
    }
}


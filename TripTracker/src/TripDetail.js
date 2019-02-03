import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, Image,
    TouchableHighlight, Modal, Alert, TouchableOpacity, 
    FlatList, ImageBackground } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar, Button, TextInput, Card, Title, Paragraph, Searchbar } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import CalendarPicker from 'react-native-calendar-picker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SwipeListView } from 'react-native-swipe-list-view';

import { serverURL, tokenName, regexWhitespaceOnly } from './config/envConst';
import { GOOGLAPI } from '../envAPI.js';

import EditTripModal from './EditTripModal';

 
const styles = StyleSheet.create({
    appbarHeader:{
        backgroundColor: 'rgb(36,152,219)',
    },
    contentTitle: {
        fontSize: 24, fontFamily: 'Avenir',
    },
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
        fontSize: 16, fontFamily: 'Avenir',
    },
    rowFront: {
		alignItems: 'flex-start',
		backgroundColor: 'rgb(255,255,255)',
		borderBottomColor: 'silver',
		borderBottomWidth: 1,
		justifyContent: 'center',
        height: 100,
        padding: 10,
	},
	rowBack: {
		alignItems: 'center',
		backgroundColor: 'transparent',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 15,
    },
})

const locStyles = StyleSheet.create({
    addNewBtn: {
        marginTop: 10, marginLeft: 5, 
        borderRadius: 20, width: '36%', 
        backgroundColor: 'rgb(49,90,158)'
    },
    editBtn: {
        marginTop: 10, marginLeft: 5, 
        borderRadius: 20, width: '25%', 
        backgroundColor: 'rgb(49,90,158)'
    },
    deleteBtn: {
        marginTop: 10, marginLeft: 5, 
        borderRadius: 20, width: '25%', 
        backgroundColor: 'rgb(255,0,0)'
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
        justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center',
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

/**
 * FUNCTIONS
 */
function validateWhtieSpaceOnly(text) { return regexWhitespaceOnly.test(text) }

function padZero(num) { return (num>=0 && num<=9)? `0${num}`:`${num}`; }

function dateToString(selectedDate) {
    let date= new Date(selectedDate)
    return `${date.getFullYear()}-${padZero(date.getMonth()+1)}-${padZero(date.getDate())}`
}

_getToken = async() => { return await AsyncStorage.getItem(tokenName) }

/**
 * LOCATION CONTAINER
 */
class LocationContainer extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            locations: []
        }
    }
    
    componentDidMount = () => {
        this.setState({ locations: this.props.locations})
    }

    render() {
        let numLocs = this.props.locations.length>0 ? 
            this.props.locations.length > 1 ?
                <Text style={styles.locInfo}>{`${this.props.locations.length} locations found`}</Text> :
                <Text style={styles.locInfo}>{`${this.props.locations.length} location found`}</Text> :
            <Text style={styles.locInfo}>You don't have any location in this trip yet</Text>
        
        return(
        <React.Fragment>
            {numLocs}
        </React.Fragment>
        )
    }
}

/**
 * MODAL
 */
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
        //console.log(location);console.log(formatAddr);console.log(geocode);console.log(startDate, endDate)
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
        
        _getToken().then(token=>{
            
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

    onDateChange = (date, type) => {
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
        <Appbar.Content title="New Location Info" titleStyle={styles.contentTitle} />
        <Button onPress={()=>this.props.setModalVisible(false)}
            style={{alignItems: 'center', alignContent: 'flex-end'}}>
            <Text style={{color: "rgb(255,255,255)"}}>Close</Text>
        </Button> 
      </Appbar.Header>

      <ScrollView>
        
      <GooglePlacesAutocomplete 
        ref="location" query={{ key: GOOGLAPI, types: ['geocode', 'cities'] }}
        style={{margin: 20, borderRadius: 5, fontSize: 18, }}
        placeholder='Enter Location' minLength={2} autoFocus={false} returnKeyType={'search'}
        fetchDetails={true} currentLocation={false} debounce={200} 
        listViewDisplayed='auto'
        renderDescription={row => row.description} 
        onPress={(data, details = null) => { 
            //console.log(data.description);console.log(details["formatted_address"]);console.log(details.geometry.location)
            this.location= data.description
            this.formatAddr= details["formatted_address"]
            this.geocode= details.geometry.location
        }}
        styles={{
            textInputContainer: {
              width: '100%', backgroundColor: 'rgba(0,0,0,0)', 
            },
            description: {
              fontWeight: 'bold', 
            },
            predefinedPlacesDescription: {
              color: '#1faadb', 
            },
            listView: {
                borderWidth: 1, borderColor: 'silver',
            },
            container: {
                borderWidth: 1, borderColor: 'silver',
            }
          }}

        />

        <View >
        <CalendarPicker
          startFromMonday={true}
          allowRangeSelection={true}
          todayBackgroundColor="#f2e6ff"
          selectedDayColor="#7300e6"
          selectedDayTextColor="#FFFFFF"
          onDateChange={this.onDateChange}
        />
 
        <View>
          <Text>SELECTED START DATE:{ this.state.dateStart }</Text>
          <Text>SELECTED END DATE:{ this.state.dateEnd }</Text>
        </View>
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

/**
 * MAPCONTAINER
 */
class MapContainer extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            region: {
                latitude: props.geocode.lat? parseFloat(props.geocode.lat): 0,
                longitude: props.geocode.lng? parseFloat(props.geocode.lng): 0,
                latitudeDelta: 0.0922,longitudeDelta: 0.0421,
            },
        }
    }
    
    //onRegionChange = (region)=> { this.setState({ region }) }
  
    render() {
        return(
            <MapView style={{margin: 20, height: '75%', }} 
                initialRegion = {this.state.region}
                //region={this.state.region} onRegionChange={this.onRegionChange} 
            />
        )
    }
}

/**
 * TRIP LIST
 */
class TripList extends Component {

    constructor(props) {
        super(props)
        this.focusListener = this.props.navigation.addListener('didFocus',payload => {
            console.debug('didFocus', payload);
            this._getTripDetails()
          })
        this.state = { 
            locations: [],
            tripDetails: {},
            resize: false,
            modalVisible: false, modalDelete: false, modalEdit: false,
            modalEditLoc: false, modalEditTrip: false,
            selectOnDelete: {}, selectOnEdit: {},
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
        console.log("did mounted")
        //this._getTripDetails()
    }

    componentWillUnmount = () => { this.focusListener.remove() }

    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    _getTripDetails = () => {
        _getToken().then(token=>{
            console.log("trip details= ",token)
            const tripId = this.props.navigation.getParam('tripId', null)
            if (!tripId) { this.props.navigation.goBack() }
            fetch(serverURL+'/api/trips/'+tripId,{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, },
            }).then(res=>{
                if (res.status===200) {
                  res.json().then(data=>{
                    //console.log(data)
                    console.log("done getting trip details data")
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

    toLocDetails = (index) => {
        //console.log(this.state.tripDetails.locations[index])
        this.props.navigation.navigate('LocationDetail',{
            locId: this.state.tripDetails.locations[index].id, locDetails: this.state.tripDetails.locations[index],
        })
    }

    setModal = (visible) => { 
        this.setState({
            modalDelete: visible, selectOnDelete: {},
        }) 
    }

    setModal = (visible,modalType,selectOnType) => {
        this.setState({
            [modalType]: visible, [selectOnType]: {},
        })
    }

    setModalVisible = (visible) => { this.setState({modalVisible: visible}) }

    setModalDelete = (visible) => { 
        this.setState({
            modalDelete: visible, selectOnDelete: {},
        }) 
    }

    onPress = (index) => {
        console.log(index)
    }

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

    _onDeleteLoc = (index) => {
        this.setState({
            selectOnDelete: this.state.tripDetails.locations[index], 
            modalDelete: true,
        })
    }

    _removeLoc = (data) => {
        let filteredLocs = this.state.tripDetails.locations.filter(loc=>{
            return (loc.id!==data.id)
        })
        this.setState(prevState=>({
            tripDetails: {
                ...prevState.tripDetails, locations: filteredLocs,
            },
            modalDelete: false,
        }))
    }

    _onEditTrip = () => {
        this.setState({
            selectOnEdit: this.state.tripDetails, 
            modalEditTrip: true,
        })
    }

    _editTrip = (data) => {
        let tripDetails = this.state.tripDetails
        tripDetails.title= data.title
        tripDetails.startDate= data.startDate
        tripDetails.endDate= data.endDate
        console.log(tripDetails)
        this.setState({
            tripDetails,
            modalEditTrip: false, 
        })
        this.props.navigation.setParams({
            title: tripDetails.title
        })
        console.log(this.props.navigation)
    }

    
    render() {
        
        let allLocs = []
        if (this.state.tripDetails.locations) {
            this.state.tripDetails.locations.map((loc,index)=>{
                return allLocs.push({ loc: loc ,key: index.toString() })
            })  
        }
        
        return (
    <React.Fragment>

      <ImageBackground source={{uri: serverURL+'/'+this.state.tripDetails.image}} style={{width: '100%', height: '100%'}}>
  
        <View style={this.state.imgView}>
            <ScrollView style={{margin: 10, }}> 
                <TouchableOpacity onPress={this.resizeImg}>
                    <Image source={{uri: serverURL+'/'+this.state.tripDetails.image}} 
                        style={this.state.imgSize} />
                </TouchableOpacity>  
            </ScrollView>
        </View>

        <View style={{backgroundColor: 'rgb(255,255,255)'}}>
            
            <View style={{margin: 10, flexDirection: 'row', justifyContent: ''}}>
              {/* <TouchableOpacity style={locStyles.deleteBtn} >
                    <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 14 }}>
                        DELETE
                    </Text>
              </TouchableOpacity> */}
              <TouchableOpacity style={locStyles.editBtn} onPress={()=>this._onEditTrip()}>
                <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 14 }}>
                    Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={locStyles.addNewBtn} onPress={()=>this.setModalVisible(true)}>
                    <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 18}}>
                        + Location
                    </Text>
              </TouchableOpacity>
            </View>
        
            <Searchbar style={{margin: 15}}
                placeholder="Search Location" />
            
            <View style={{margin: 5}}>
            {this.state.tripDetails.locations!==undefined?
                <LocationContainer locations={this.state.tripDetails.locations} />:null }
            </View>
        </View>

        <SwipeListView
            style={{backgroundColor: 'rgb(255,255,255)'}}
            useFlatList
            data={allLocs}
            disableRightSwipe={true}
            renderItem={ (data, rowMap) => {
                let index= parseInt(data.item.key), loc = data.item.loc
                return(
                <TouchableHighlight style={styles.rowFront}
                    onPress={()=>this.toLocDetails(index)}>
                    
                    <View style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir'}}>
                        {loc.location.split(",")[0]+' ...'}
                      </Text>
                      <Text>Date: {loc.startDate} to {loc.endDate}</Text> 
                    </View>

                </TouchableHighlight>)
            }}
            renderHiddenItem={ (data, rowMap) => {
                let index = parseInt(data.item.key)
                return(
                <View style={styles.rowBack}>
                    {/* <Button style={{borderRadius: 5 }} 
                        onPress={()=>this._onEditLoc(index)}>
                        <Text>Edit</Text>
                    </Button> */}
                    <Text />
                    <Button style={{borderRadius: 5,  }} 
                        onPress={()=>this._onDeleteLoc(index)}>
                        <Text style={{color: 'rgb(255,0,0)'}}>Delete</Text>
                    </Button>
                </View>
            )}}
            //leftOpenValue={80}
            rightOpenValue={-80}
        />

        <Modal animationType="slide" transparent={false} visible={this.state.modalVisible}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalVisible(false)
        }}>
            <NewLocModal setModalVisible={this.setModalVisible} addLocs={this.addLocs} tripId={this.state.tripDetails.id} />
        </Modal>

        <Modal animationType="slide" transparent={false} visible={this.state.modalDelete}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalDelete(false)
            }}>
            <DeleteLocModal selectOnDelete={this.state.selectOnDelete} 
                setModalDelete={this.setModalDelete}
                removeLoc={this._removeLoc} />
        </Modal>

        <Modal animationType="slide" transparent={false} visible={this.state.modalEditTrip}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModal(false,"modalEditTrip","")
            }}>
            <EditTripModal selectOnEdit={this.state.selectOnEdit} 
                setModalEdit={this.setModal}
                editTrip={this._editTrip} />
        </Modal>

        </ImageBackground>
    </React.Fragment>
        )
    }
}


class DeleteLocModal extends Component {

    _cancelDelete = () => {
        this.props.setModalDelete(false);
    }

    _deleteLoc = () => {
        console.log("to delete location")
        _getToken().then(token=>{
            console.log(token)
            //console.log(this.props.selectOnDelete.id)
            //*
            fetch(serverURL+'/api/locations/delete/'+this.props.selectOnDelete.id,{
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, },
            }).then(res=>{
                res.json().then(data=>{
                    this.props.removeLoc(data)
                })
            })
            //*/
        }) 
    }

    render() {
        return (
            <React.Fragment>
                <View style={modalStyles.modalHeader}>
                    <TouchableHighlight onPress={()=>this.props.setModalDelete(false)}>
                    <Text style={modalStyles.closeModalText}>
                        Close &times;
                    </Text>
                    </TouchableHighlight>
                    <Text style={modalStyles.newLocGreeting}>
                        {'Warning: Deleting\n'+this.props.selectOnDelete.location}
                    </Text>
                </View>
                <View >
                    <Text >
                        {'Are you sure you want to delete\n'+this.props.selectOnDelete.location}?
                    </Text>
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <Button onPress={this._cancelDelete} >
                            <Text>Cancel</Text>
                        </Button>
                        <Button onPress={this._deleteLoc} 
                            style={{backgroundColor: 'red', borderRadius: 10, }}>
                            <Text style={{color: 'white'}}>Delete</Text>
                        </Button>
                    </View>
                </View>

            </React.Fragment>
        )
    }
}


export default TripDetail = TripList

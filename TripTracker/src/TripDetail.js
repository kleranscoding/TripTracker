import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, Image,
    TouchableHighlight, Modal, Alert, TouchableOpacity, 
    FlatList, ImageBackground } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar, Button, TextInput, Card, Title, Paragraph, Searchbar } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import ModalDatePicker from 'react-native-datepicker-modal';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SwipeListView } from 'react-native-swipe-list-view';

import { serverURL, tokenName, regexWhitespaceOnly } from './config/envConst';
import { GOOGLAPI } from '../envAPI.js';

 
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
        fontSize: 20, fontFamily: 'Avenir',
    },
    rowFront: {
		alignItems: 'flex-start',
		backgroundColor: 'rgb(255,255,255)',
		borderBottomColor: 'silver',
		borderBottomWidth: 1,
		justifyContent: 'center',
        height: 75,
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

const cardStyles = StyleSheet.create({
    container: { flex: 1, },
    content: { padding: 4, },
    card: { 
        margin: 10, 
        borderColor: 'rgba(192,192,192,0.75)', borderWidth: 2, borderRadius: 10,
    },
    cardIndiv: {
        fontSize: 20, fontFamily: 'Avenir',
        padding: 10, textAlign: 'left',
    },
    cardImg: {
        width: '100%', height: 200,
    },
})


/**
 * FUNCTIONS
 */
function validateWhtieSpaceOnly(text) { return regexWhitespaceOnly.test(text) }


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
        //console.log("didmount");console.log(this.props.locations)
        this.setState({ locations: this.props.locations})
    }

    render() {
        //console.log("render");console.log(this.state.locations)
        //let numLocs = null
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
      {/* <View style={modalStyles.modalHeader}>
        <TouchableHighlight onPress={()=>this.props.setModalVisible(false)}>
          <Text style={modalStyles.closeModalText}>
            Close &times;
          </Text>
        </TouchableHighlight>
        <Text style={modalStyles.newLocGreeting}>
            New Location Info
        </Text>
      </View> */}

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
        placeholder='Enter Location' minLength={2} autoFocus={false} returnKeyType={'next'}
        fetchDetails={true} currentLocation={true} debounce={200} 
        renderDescription={row => row.description} 
        onPress={(data, details = null) => { 
            //console.log(data.description);console.log(details["formatted_address"]);console.log(details.geometry.location)
            this.location= data.description
            this.formatAddr= details["formatted_address"]
            this.geocode= details.geometry.location
        }}/>

        <View style={{margin: 25 }}>
            {/* <View style={modalStyles.datepicker}> */}
                <Text style={{fontSize: 18, margin: 10}}>Start Date: </Text>
                <ModalDatePicker startDate={new Date()}
                    renderDate={({ year, month, day, date }) => {
                    if (!date) {
                        return (<Text style={{fontSize: 18}}>Click here to select a start date</Text>)
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
            {/* </View> */}
            {/* <View style={modalStyles.datepicker}> */}
                <Text style={{fontSize: 18, margin: 10}}>End Date: </Text>
                <ModalDatePicker startDate={new Date()}
                    renderDate={({ year, month, day, date }) => {
                        let selectedDate = "Click here to select an end date"
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
            {/* </View> */}
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
        this.state = { 
            locations: [],
            tripDetails: {},
            resize: false,
            modalVisible: false, modalDelete: false,
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
        this._getTripDetails()
    }

    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    _getTripDetails = () => {
        this._getToken().then(token=>{
            console.log("details= ",token)
            const tripId = this.props.navigation.getParam('tripId', null)
            if (!tripId) { this.props.navigation.goBack() }
            fetch(serverURL+'/api/trips/'+tripId,{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, },
            }).then(res=>{
                if (res.status===200) {
                  res.json().then(data=>{
                    //console.log(data)
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
            locId: this.state.tripDetails.locations[index].id, location: this.state.tripDetails.locations[index],
        })
    }

    setModalVisible = (visible) => { this.setState({modalVisible: visible}) }

    setModalDelete = (visible) => { 
        this.setState({
            modalDelete: visible, selectOnDelete: {},
        }) 
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

    render() {
        
        let allLocs = []
        if (this.state.tripDetails.locations) {
            this.state.tripDetails.locations.map((loc,index)=>{
                return allLocs.push({ loc: loc ,key: index.toString() })
            })  
        }
        /*
        let locFlatList= (
        <FlatList data={allLocs}
            renderItem={({item, separators}) => (
            <Card style={cardStyles.card}>
              <Card.Content>
                <TouchableOpacity 
                    onPress={()=>this.toLocDetails(parseInt(item.key))}
                    onShowUnderlay={separators.highlight} onHideUnderlay={separators.unhighlight}>
                  <Text style={cardStyles.cardIndiv}>{item.locItem.location}</Text>  
                </TouchableOpacity>
              </Card.Content>
              <Card.Actions style={{ margin: 10 }}>
                <View style={{flexDirection: 'row', }}>
                    <Button style={{margin: 5, borderRadius: 5, backgroundColor: 'rgb(81, 148, 255)' }} icon="more" mode="contained"
                      onPress={()=>this.toLocDetails(parseInt(item.key))}>
                    <Text>Details</Text>
                    </Button>
                    <Button style={{margin: 5, borderRadius: 5 }} icon="edit" mode="contained"
                    >
                    <Text>Edit</Text>
                    </Button>
                    <Button style={{margin: 5, borderRadius: 5, backgroundColor: 'rgb(255,0,0)' }} icon="delete" mode="contained"
                      onPress={()=>this._onDeleteLoc(parseInt(item.key))}>
                    <Text>Delete</Text>
                    </Button>
                </View>
              </Card.Actions>
            </Card>
        )}/>)
        //*/
        
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
            <View style={{margin: 15, }}>
                <TouchableOpacity style={locStyles.addNewBtn} onPress={()=>this.setModalVisible(true)}>
                    <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 20}}>
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
            renderItem={ (data, rowMap) => {
                let index= parseInt(data.item.key), loc = data.item.loc
                return(
                <TouchableHighlight style={styles.rowFront}
                    onPress={()=>this.toLocDetails(index)}>
                    
                    <View style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir'}}>
                        {loc.location}
                      </Text>
                      <Text>Date: {loc.startDate}</Text> 
                    </View>

                </TouchableHighlight>)
            }}
            renderHiddenItem={ (data, rowMap) => {
                let index = parseInt(data.item.key)
                return(
                <View style={styles.rowBack}>
                    <Button style={{borderRadius: 5 }} 
                        onPress={()=>this.onPress(index)}>
                        <Text>Edit</Text>
                    </Button>
                    <Button style={{borderRadius: 5,  }} 
                        onPress={()=>this._onDeleteLoc(index)}>
                        <Text style={{color: 'rgb(255,0,0)'}}>Delete</Text>
                    </Button>
                </View>
            )}}
            leftOpenValue={80}
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

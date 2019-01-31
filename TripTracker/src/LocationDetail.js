import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, Image,
    TouchableHighlight, Modal, Alert, TouchableOpacity, 
    FlatList, Picker, } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar, Button, TextInput, Card, Title, Paragraph, FAB  } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import ModalDatePicker from 'react-native-datepicker-modal';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { Categories, serverURL, tokenName, regexWhitespaceOnly, currencyInfo } from './config/envConst';
import { GOOGLAPI } from '../envAPI.js';


/**
 * STYLESHEETS
 */
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

const spendStyles = StyleSheet.create({
    addNewBtn: {
        marginTop: 10 , marginLeft: '15%', 
        borderRadius: 20, width: '70%', 
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

/**
 * FUNCTIONS AND CONSTANTs 
 */
const selectText = ' (selected)'

function validateWhtieSpaceOnly(text) { return regexWhitespaceOnly.test(text) }

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
    
    render() {
        return(
            <MapView style={{margin: 20, height: '75%', }} 
                initialRegion = {this.state.region} />
        )
    }
}

/**
 * MODAL
 */
class NewSpendModal extends Component {
    constructor() {
        super()
        this.location= ''
        this.formatAddr= ''
        this.geocode = {}
        this.state = {
            catIndex: null,
            name: '', category: '', date: '',
            amount: '', currency: 'USD', note: '',
            catLabels: Categories.map(cat=>{ return cat.label }),
            currencyList: currencyInfo,
            resizeCurr: false, resizeCat: false,
        }
    }
    
    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    submitSpendInfo = () => {
        let errCat= true, errCur= true
        let errMsgCat = '', errMsgCur = ''
        if (this.state.catIndex===null) {
            errMsgCat = "- Please select a category"
        } else {
            errCat= false
        }
        if (this.state.catIndex===null) {
            errMsgCur = "- Please select a currency"
        } else {
            errCur= false
        }
        if (errCat || errCur) {
            Alert.alert("Hang On!\n"+errMsgCat+"\n"+errMsgCur)
            return
        }
        console.log(this.state.category)
        console.log(this.state.currency)
        /*
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
        //*/
    }

    selectCategory = (index) => {
        
        let catLabels= this.state.catLabels
        if (this.state.catIndex===index) return
        if (this.state.catIndex!==null) {
            catLabels[this.state.catIndex]= catLabels[this.state.catIndex].replace(selectText,"")
        }
        catLabels[index]= catLabels[index]+selectText
        this.setState(prevState=>({ 
            catIndex: index,
            category: Categories[index].label,
            catLabels 
        }))
    }

    setDate = (newDate)=> { this.setState({chosenDate: newDate}); }

    updateDate = (name,date) => { this.setState({ [name]: date }) }

    resizeSelector = (name) => {
        if (this.state[name]) {
            this.setState({
                [name]: false,
                
            })
        } else {
            this.setState({
                [name]: true,
                
            })
        }
    }

    resizeCurrency = () => {
        if (this.state.resizeCurr) {
            this.setState({
                resizeCurr: false,
                
            })
        } else {
            this.setState({
                resizeCurr: true,
                
            })
        }
    }

    resizeCat = () => {
        if (this.state.resizeCat) {
            this.setState({
                resizeCat: false,
                
            })
        } else {
            this.setState({
                resizeCat: true,
                
            })
        }
    }

    render() {
        // create category button group
        let catButtonGrp = []
        Categories.map((cat,index)=>{
            return catButtonGrp.push(
            <View key={index} >
                <Button icon={cat.icon} ref={"cat_"+index}
                    onPress={()=>this.selectCategory(index)}>
                    {this.state.catLabels[index]}
                </Button>
            </View>
            )
        })
        // create currency picker group
        let currencyGrp = this.state.currencyList.map((currency,index)=>{
            return (<Picker.Item key={index} label={currency[1]+" ("+currency[0]+")"} value={currency[0]} />)
        })


        return (
    <React.Fragment>
      <View style={modalStyles.modalHeader}>
        <TouchableHighlight onPress={()=>this.props.setModalVisible(false)}>
          <Text style={modalStyles.closeModalText}>
            Close &times;
          </Text>
        </TouchableHighlight>
        <Text style={modalStyles.newLocGreeting}>
            New Expenditure Info
        </Text>
      </View>

      <ScrollView>
        
      <KeyboardAwareScrollView style={{marginBottom: 50}}>
        <TextInput label='What did you spend on?' mode="outlined" 
            style={{margin: 20, borderRadius: 10, backgroundColor: 'rgb(255,255,255)' }} />
        
        <View style={modalStyles.datepicker}>
            <Text style={{fontSize: 18, margin: 10}}>Date: </Text>
            <ModalDatePicker startDate={new Date()}
                renderDate={({ year, month, day, date }) => {
                    let selectedDate = "Pick a date"
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

        <TextInput label='How much is that?' mode="outlined" 
            style={{margin: 20, borderRadius: 10, backgroundColor: 'rgb(255,255,255)' }} />

        <View style={{padding: 20, flex: 1, backgroundColor: 'rgb(49,90,158)', margin: 20}}>
            <TouchableOpacity onPress={this.resizeCurrency}>
                <Text style={{color: 'rgb(255,255,255)', fontSize: 18, fontFamily: 'Avenir'}}>
                    Currency: {this.state.currency+" selected"}
                </Text>
            </TouchableOpacity>
            {/* <View> */}
                {this.state.resizeCurr && 
                <Picker selectedValue={this.state.currency} prompt='Options'
                    onValueChange={(itemValue, itemIndex) => this.setState({currency: itemValue})}>
                    {currencyGrp}
                </Picker>}
            {/* </View> */}
        </View>
        
        <View style={{padding: 20, flex: 1, backgroundColor: 'rgb(49,90,158)', margin: 20}}>
            <TouchableOpacity onPress={this.resizeCat}>
                <Text style={{color: 'rgb(255,255,255)', fontSize: 18, fontFamily: 'Avenir'}}>
                    Select category
                </Text>
            </TouchableOpacity>
            {/* <View> */}
                {this.state.resizeCat && catButtonGrp}
            {/* </View>    */}
        </View>
        
        
        <TextInput label='A little more about it maybe? (optional)' mode="outlined" multiline={true}
            style={{margin: 20, borderRadius: 10, backgroundColor: 'rgb(255,255,255)' }} />
    


        <TouchableOpacity onPress={this.submitSpendInfo} style={modalStyles["create_btn"]}>
            <Text style={modalStyles["create_btn_text"]}>
                Add Expenditure
            </Text>
        </TouchableOpacity>

      </KeyboardAwareScrollView>

      </ScrollView>
        
    </React.Fragment>
        )
    }
}


/**
 * LOCATIONDETAIL
 */
export default class LocationDetail extends Component {

    constructor(props) {
        super(props)
        this.state = { 
            spendings: [],
            locDetails: props.navigation.getParam("location"),
            resize: false,
            modalVisible: false,
            imgView: styles.imgViewSmall, imgSize: styles.imgSmall,
        }
    }

    static navigationOptions =({navigation})=> {
        return {
            title: navigation.getParam('location').location,
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
        this._getLocDetails()
    }

    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    _getLocDetails = () => {
        this._getToken().then(token=>{
            console.log("details= ",token)
            const locId = this.props.navigation.getParam('locId', null)
            if (!locId) {
                this.props.navigation.goBack()
            }
            //*
            fetch(serverURL+'/api/locations/'+locId,{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, },
            }).then(res=>{
                if (res.status===200) {
                  res.json().then(data=>{
                    console.log(data)
                    this.setState({ locDetails: data })
                  })
                }
            }).catch(err=>{ console.log(err) })
            //*/
        }).catch(error=>{
            console.log("get token error:",error)
        })
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

    addSpends = (spend) => {
        let spendings = this.state.locDetails.spendings
        spendings.push(spend)
        this.setState(prevState=>({ 
            ...prevState.locDetails, spendings 
        }))
    }

    render() {

        let allSpendings = []
        if (this.state.locDetails.spendings) {
            this.state.locDetails.spendings.map((spend,index)=>{
                return allSpendings.push(
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
    
                        <Title style={{fontSize: 24, marginBottom: 5}}>{spend.name}</Title>
                        
                        {/* <Card.Cover source={{ uri: serverURL+'/'+loc.image }} style={cardStyles.cardImg} /> */}
                        <Paragraph style={{fontSize: 16}}>
                          Date: {spend.date}
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

        return(
    <React.Fragment>
        <View style={this.state.imgView}>
            <MapContainer geocode={this.state.locDetails.geocode} />
        </View>
        <View style={{margin: 15, }}>
            <TouchableOpacity style={spendStyles.addNewBtn} onPress={()=>this.setModalVisible(true)}>
                <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 20}}>
                    + Add Expenditures
                </Text>
            </TouchableOpacity>
        </View>
        <ScrollView style={{margin: 10, marginTop: 25}}>
            {this.state.locDetails.spendings!==undefined?
            <LocationContainer locations={this.state.locDetails.spendings} />:null
            }
            {allSpendings}
        </ScrollView>

        <Modal animationType="slide" transparent={false} visible={this.state.modalVisible}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalVisible(false)
        }}>
            <NewSpendModal setModalVisible={this.setModalVisible} addSpends={this.addSpends} locId={this.state.locDetails.id} />
        </Modal>

    </React.Fragment>
        )
    }
}
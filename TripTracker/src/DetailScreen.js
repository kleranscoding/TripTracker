import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, Image,
    TouchableHighlight, Modal, Alert, TouchableOpacity } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar, Button, TextInput, Card, Title, Paragraph  } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ModalDatePicker from 'react-native-datepicker-modal'

import { serverURL, tokenName,regexWhitespace } from './config/envConst';

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
    
    state= {
        location: '',
        dateStart: '', dateEnd: '',
        errLoc: false,
        errDateStartStyle: {fontSize: 18}, errDateEndStyle: {fontSize: 18},
    }

    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    submitLocInfo = () => {
        return
        let location = this.state.location
        let startDate = this.state.dateStart, endDate = this.state.dateEnd
        let errLoc= true, errDateStart= true, errDateEnd= true
        console.log(location, startDate, endDate)
        if (!location || validateWhtieSpaceOnly(location) ) {
            this.setState({errLoc: true})
        } else {
            errTitle= false
        }
        if (!(startDate && endDate && startDate.localeCompare(endDate)<=0) ) {
            if (startDate.localeCompare(endDate)>0) Alert.alert("invalid dates")
        } else {
            errDateStart= false
            errDateEnd= false
        }
        console.log(errLoc, errDateStart, errDateEnd)
        if (errLoc || errDateStart || errDateEnd) return

        this._getToken().then(token=>{
            
            fetch(serverURL+'/api/trips/new',{
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "location": location.trim(), "startDate": startDate, "endDate": endDate,
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

    onFocus = () => { this.setState({errLoc: false}) }

    onBlur = (evt) => {
        if (!evt.nativeEvent.text) {
            this.setState({errLoc: true})
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
        <Text style={modalStyles.newLocGreeting}>
            New Location Info
        </Text>
      </View>

      <ScrollView>
        
        <TextInput label='Enter Location' mode="outlined" value={this.state.location}
            onChangeText={text => this.setState({ location: text })}
            onBlur={this.onBlur} onFocus={this.onFocus}
            style={{margin: 20, borderRadius: 5, backgroundColor: 'rgb(255,255,255)' }} 
            error={this.state.errLoc}
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


class DetailScreen extends Component {

    constructor(props) {
        super(props)
        this.state = { 
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
        let locations = this.state.locations
        locations.push(loc)
        this.setState({ locations })
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
        <ScrollView style={{margin: 10, }}>
            {this.state.tripDetails.locations!==undefined?
            <LocationContainer locations={this.state.tripDetails.locations} />:null
            }
        </ScrollView>

        <Modal animationType="slide" transparent={false} visible={this.state.modalVisible}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalVisible(false)
        }}>
            <NewLocModal setModalVisible={this.setModalVisible} addLocs={this.addLocs} />
        </Modal>
    </React.Fragment>
        )
    }
}



export default DetailScreen
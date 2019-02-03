import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, Modal, Alert, Image, 
    TouchableHighlight, TouchableWithoutFeedback, TouchableOpacity, } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar, Button, TextInput, Card, Title, Paragraph, Searchbar, TouchableRipple } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ModalDatePicker from 'react-native-datepicker-modal';
import { SwipeListView } from 'react-native-swipe-list-view';
import CalendarPicker from 'react-native-calendar-picker';

import { serverURL, tokenName, regexWhitespace, regexWhitespaceOnly } from './config/envConst';
import TripDetail from './TripDetail'
import LocationDetail from './LocationDetail';

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
    tripInfo: {
        marginTop: 5,
        textAlign: 'center',
        fontSize: 20, fontFamily: 'Avenir',
    },
    addNewBtn: {
        marginTop: 10 , marginLeft: '25%', 
        borderRadius: 20, width: '50%', 
        backgroundColor: 'rgb(49,90,158)'
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
		paddingLeft: 5,
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
        paddingBottom: 20, paddingTop: 35, backgroundColor: 'rgb(36,152,219)' 
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
        backgroundColor: 'rgb(49,90,158)',
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
        margin: 10, borderRadius: 10,
        borderColor: 'rgba(192,192,192,0.75)', borderWidth: 2,
    },
    cardImg: {
        width: 50, height: 50,
    },
})


/**
 * FUNCTIONS
 */
function validateWhtieSpaceOnly(text) { return regexWhitespaceOnly.test(text) }

function getDaysDiffText(startDateText,endDateText) {
    var timeDiff = new Date(endDateText) - new Date(startDateText)
    var dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))+1
    if (dayDiff>1) {
        return dayDiff+' days'
    }
    return dayDiff+' day'
}

function padZero(num) { return (num>=0 && num<=9)? `0${num}`:`${num}`; }

function dateToString(selectedDate) {
    let date= new Date(selectedDate)
    return `${date.getFullYear()}-${padZero(date.getMonth()+1)}-${padZero(date.getDate())}`
}

_getToken = async() => { return await AsyncStorage.getItem(tokenName) }

/**
 * MODAL
 */
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
        let errMsgTitle='', errMsgDate= ''
        console.log(tripTitle, startDate, endDate)
        if (!tripTitle || validateWhtieSpaceOnly(tripTitle) ) {
            errMsgTitle= '\n- Please enter a trip name'
            this.setState({errTripTitle: true})
        } else {
            errTitle= false
        }
        if (!(startDate && endDate)) {
            errMsgDate= "\n- Please select start and end date"
        } else {
            errDateStart= false
            errDateEnd= false
        }
        console.log(errTitle, errDateStart, errDateEnd)
        if (errTitle || errDateStart || errDateEnd) {
            Alert.alert("Hang On!"+errMsgTitle+errMsgDate)
            return
        }

        this._getToken().then(token=>{
            
            fetch(serverURL+'/api/trips/new',{
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "title": tripTitle.trim(), "startDate": startDate, "endDate": endDate,
                }),
            }).then(res=>{
                if (res.status===200) {
                  res.json().then(data=>{
                    this.props.setModalVisible(false)
                    this.props.addTrips(data)
                    this.props.navigation.navigate('TripDetail',{
                        tripId: data.id, title: data.title
                    })
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
        <Appbar.Content title="New Trip Info" titleStyle={styles.contentTitle} />
        <Button onPress={()=>this.props.setModalVisible(false)}
            style={{alignItems: 'center', alignContent: 'flex-end'}}>
            <Text style={{color: "rgb(255,255,255)"}}>Close</Text>
        </Button> 
      </Appbar.Header>

      <ScrollView>
        
        <TextInput label='Enter Trip Title' mode="outlined" value={this.state.tripTitle}
            onChangeText={text => this.setState({ tripTitle: text })}
            onBlur={this.onBlur} onFocus={this.onFocus}
            style={{margin: 20, borderRadius: 5, backgroundColor: 'rgb(255,255,255)' }} 
            error={this.state.errTripTitle}
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

/**
 * TRIPCONTAINER
 */
class TripContainer extends Component {

    constructor(props) {
        super(props)
        this.focusListener = this.props.navigation.addListener('didFocus',payload => {
            console.debug('didFocus', payload);
            this._getTripInfo() 
          })
        this.state= {
            selectOnDelete: {}, selectOnEdit: {}, trips: [],
            modalVisible: false, modalDelete: false,
        }
    }

    static navigationOptions = {
        title: 'Trips',
        headerTintColor: '#fafafa',
        headerTitleStyle: {
            fontSize: 24, fontFamily: 'Avenir',
        },
        headerStyle: {
            backgroundColor: 'rgba(36,152,219,0.85)',
        }
    }

    componentDidMount = () => { 
        //this._getTripInfo() 
    }

    componentWillUnmount = () => { this.focusListener.remove() }

    _signOutAsync = async () => {
        await AsyncStorage.removeItem(tokenName)
        this.props.navigation.navigate('Splash')
    }

    _getTripInfo = () => {
        _getToken().then(token=>{
            console.log("trip container= "+token)
            fetch(serverURL+'/api/users/profile',{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res=>{
                if (res.status===200) {
                    res.json().then(data=>{
                        this.setState({ trips: data.trips, })
                        console.log("done getting trips...")
                    })
                } else {
                    res.json().then(data=>{
                        if (data.message.indexOf('jwt expired')!==-1) {
                            this._signOutAsync()
                        }
                    })
                }
                
            }).catch(err=>{ console.log(err) })
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

    setModalDelete = (visible) => { this.setState({modalDelete: visible}) }
    
    favToggle = (index) => {
        console.log(this.state.trips[index])
        _getToken().then(token=>{
            
            fetch(serverURL+'/api/trips/edit/'+this.state.trips[index].id,{
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "isFav": !this.state.trips[index].isFav, 
                }),
            }).then(res=>{
                if (res.status===200) {
                    res.json().then(data=>{
                        console.log("edit trips isFav: ")
                        console.log(data)
                        let filteredTrips = this.state.trips
                        filteredTrips[index].isFav = data.isFav
                        this.setState({ trips: filteredTrips, })
                    })
                }
            }).catch(err=>{ console.log(err) })
        }).catch(error=>{
            console.log("get token error:",error)
        })
    }

    toTripDetails = (index) => {
        this.props.navigation.navigate('TripDetail',{
            tripId: this.state.trips[index].id, title: this.state.trips[index].title,
        })
    }

    _onDeleteTrip = (index) => {
        this.setState({
            selectOnDelete: this.state.trips[index], 
            modalDelete: true,
        })
    }

    deleteTrip = (index) => {
        console.log(this.state.trips[index])
        let tripId = this.state.trips[index].id
        this._getToken().then(token=>{
            fetch(serverURL+'/api/trips/delete/'+tripId,{
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res=>{
                if (res.status===200) {
                    res.json().then(data=>{
                        console.log(data)
                        let filteredTrips = this.state.trips.filter(trip=>{
                            return (trip.id!==data.id)
                        })
                        this.setState({ trips: filteredTrips, })
                    })
                } 
                    
            }).catch(err=>{ console.log(err) })

        }).catch(error=>{
            console.log("get token error:",error)
        })
    }

    _removeTrip = (data) => {
        let filteredTrips = this.state.trips.filter(trip=>{
            return (trip.id!==data.id)
        })
        this.setState({
            trips: filteredTrips,
            modalDelete: false,
        })
    }

    render() {

        let numTrips = this.state.trips.length>1 ?
            <Text style={styles.tripInfo}>{`${this.state.trips.length} trips found`}</Text> : 
            <Text style={styles.tripInfo}>{`${this.state.trips.length} trip found`}</Text>
        
        let allTrips = []
        this.state.trips.map((trip,index)=>{
            return allTrips.push({key: index.toString(), trip: trip})
        })
        
        return (
    <React.Fragment>
        
        <View style={{justifyContent: 'space-between', padding: 10, flexDirection: 'row',
            borderBottomWidth: 1, borderBottomColor: 'silver', }}>
          
          {numTrips}          
          
          <Button style={{backgroundColor: 'rgb(49,90,158)', borderRadius: 20}} icon="add" mode="contained"
            onPress={()=>this.setModalVisible(true)}>
            <Text style={{textAlign: 'center', color: 'rgb(255,255,255)', fontSize: 14}}>
              Trip
            </Text>  
          </Button>
        </View>

        <Searchbar style={{margin: 15}}
            placeholder="Search Trip" />

        <SwipeListView
            useFlatList
            data={allTrips}
            //disableRightSwipe={true}
            renderItem={ (data, rowMap) => {
                let index= parseInt(data.item.key), trip = data.item.trip
                return(
                <TouchableHighlight style={styles.rowFront}
                    onPress={()=>this.toTripDetails(index)}>
                  <View>
                    <Text style={{fontSize: 20, fontFamily: 'Avenir', marginTop: 10}}>
                        {trip.title.toUpperCase()}
                      </Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image source={{ uri: serverURL+'/'+trip.image }} style={cardStyles.cardImg} />
                      
                      <View style={{marginLeft: 10, alignSelf: 'flex-end', flexDirection: 'column'}}>
                        <Paragraph style={{fontSize: 14, fontFamily: 'Avenir', margin: 0}}>
                            Duration: 
                            <Text style={{color: 'rgb(49,90,158)'}}>
                                {' '+getDaysDiffText(trip.startDate,trip.endDate)}
                            </Text>
                        </Paragraph>
                        <Paragraph style={{fontSize: 14, fontFamily: 'Avenir'}}>
                            From: 
                            <Text style={{color: 'rgb(49,90,158)'}}>
                                {' '+trip.startDate.split('-').join('/')+' '}
                            </Text> 
                            to 
                            <Text style={{color: 'rgb(49,90,158)'}}>
                                {' '+trip.endDate.split('-').join('/')}
                            </Text> 
                        </Paragraph>
                      </View>
                    
                    </View>
                  </View>  
                </TouchableHighlight >)
            }}
            renderHiddenItem={ (data, rowMap) => {
                let index = parseInt(data.item.key)
                let isFav = data.item.trip.isFav
                return(
                <View style={styles.rowBack}>
                    <Button style={{borderRadius: 5 }} icon={isFav? 'star': ''}
                        onPress={()=>this.favToggle(index)}>
                        <Text>{isFav? 'Remove':'Add to favorite'}</Text>
                    </Button>
                    <Button style={{borderRadius: 5, }} 
                        onPress={()=>this._onDeleteTrip(index)}>
                        <Text style={{color: 'rgb(255,0,0)'}}>Delete</Text>
                    </Button>
                </View>
            )}}
            leftOpenValue={140}
            rightOpenValue={-80}
        />

        <Modal animationType="slide" transparent={false} visible={this.state.modalVisible}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalVisible(false)
        }}>
            <NewTripModal setModalVisible={this.setModalVisible} addTrips={this.addTrips} 
              navigation={this.props.navigation}/>
        </Modal>

        <Modal animationType="slide" transparent={false} visible={this.state.modalDelete}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalVisible(false)
        }}>
            <DeleteTripModal setModalDelete={this.setModalDelete}
                    selectOnDelete={this.state.selectOnDelete} 
                    removeTrip={this._removeTrip} />
        </Modal>

    </React.Fragment>
        )
    }
}


class DeleteTripModal extends Component {

    _cancelDelete = () => {
        this.props.setModalDelete(false);
    }

    _deleteTrip = () => {
        console.log("to delete trip")
        _getToken().then(token=>{
            console.log(token)
            console.log(this.props.selectOnDelete.id)
            //*
            fetch(serverURL+'/api/trips/delete/'+this.props.selectOnDelete.id,{
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, },
            }).then(res=>{
                res.json().then(data=>{
                    this.props.removeTrip(data)
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
                        {'Warning: Deleting\n'+this.props.selectOnDelete.title}
                    </Text>
                </View>
                <View >
                    <Text >
                        {'Are you sure you want to delete\n'+this.props.selectOnDelete.title}?
                    </Text>
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <Button onPress={this._cancelDelete} >
                            <Text>Cancel</Text>
                        </Button>
                        <Button 
                            onPress={this._deleteTrip} 
                            style={{backgroundColor: 'red', borderRadius: 10, }}>
                            <Text style={{color: 'white'}}>Delete</Text>
                        </Button>
                    </View>
                </View>

            </React.Fragment>
        )
    }
}

export default TripScreen = createStackNavigator({
    TripScreen: {
        screen: TripContainer,
    },
    TripDetail: {
        screen: TripDetail,
    },
    LocationDetail: {
        screen: LocationDetail,
    },
})
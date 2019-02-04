import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, Modal, Alert, Image, 
    TouchableHighlight, TouchableWithoutFeedback, TouchableOpacity, } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar, Button, TextInput, Card, Title, Paragraph, Searchbar, TouchableRipple } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';

import { serverURL, tokenName, } from './config/envConst';

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
		paddingLeft: 15,
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

function getDaysDiffText(startDateText,endDateText) {
    var timeDiff = new Date(endDateText) - new Date(startDateText)
    var dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))+1
    if (dayDiff>1) {
        return dayDiff+' days'
    }
    return dayDiff+' day'
}

_getToken = async() => { return await AsyncStorage.getItem(tokenName) }


/**
 * FAVORITES
 */
export default class Favorites extends Component {

    constructor(props) {
        super(props)
        this.focusListener = this.props.navigation.addListener('didFocus',payload => {
            //console.debug('didFocus', payload);
            this._getFavTripInfo() 
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
        //this._getFavTripInfo() 
    }

    componentWillUnmount = () => { this.focusListener.remove() }

    _signOutAsync = async () => {
        await AsyncStorage.removeItem(tokenName)
        this.props.navigation.navigate('Splash')
    }

    _getFavTripInfo = () => {
        _getToken().then(token=>{
            console.log("fav trip container= "+token)
            fetch(serverURL+'/api/users/favorite',{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res=>{
                if (res.status===200) {
                    res.json().then(data=>{
                        console.log(data)
                        this.setState({ trips: data, })
                        console.log("done getting fav trips...")
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
        //console.log(this.state.trips[index])
        let tripId = this.state.trips[index].id
        this._getToken().then(token=>{
            fetch(serverURL+'/api/trips/delete/'+tripId,{
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res=>{
                if (res.status===200) {
                    res.json().then(data=>{
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
            <Text style={styles.tripInfo}>{`${this.state.trips.length} favorite trips`}</Text> : 
            this.state.trips.length>0 ?
            <Text style={styles.tripInfo}>{`${this.state.trips.length} favorite trip`}</Text>:
            <Text style={styles.tripInfo}>You don't have any favorite trip</Text>
        
        let allTrips = []
        this.state.trips.map((trip,index)=>{
            return allTrips.push({key: index.toString(), trip: trip})
        })
        //console.log(allTrips)
        
        return (
    <React.Fragment>
        
        <Appbar.Header statusBarHeight={20} style={styles.appbarHeader}>
            <Appbar.Content title="Favorites" titleStyle={styles.contentTitle} />
        </Appbar.Header>

        <View style={{justifyContent: 'space-between', padding: 10, flexDirection: 'row',
            borderBottomWidth: 1, borderBottomColor: 'silver', }}>
          
          {this.state.trips && numTrips}          
          
          <Button style={{backgroundColor: 'rgb(49,90,158)', borderRadius: 20}} icon="add" mode="contained"
            onPress={()=>this.setModalVisible(true)}>
            <Text style={{textAlign: 'center', color: 'rgb(255,255,255)', fontSize: 14}}>
              Trip
            </Text>  
          </Button>
        </View>

        <SwipeListView
            useFlatList
            data={allTrips}
            disableLeftSwipe={true}
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
                    <Text />
                    {/* <Button style={{borderRadius: 5, }} 
                        onPress={()=>this._onDeleteTrip(index)}>
                        <Text style={{color: 'rgb(255,0,0)'}}>Delete</Text>
                    </Button> */}
                </View>
            )}}
            leftOpenValue={120}
            //rightOpenValue={-80}
        />

    </React.Fragment>
        )
    }
}
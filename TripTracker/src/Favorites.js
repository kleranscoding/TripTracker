import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, Image, TouchableHighlight, TouchableOpacity, } from 'react-native';
import { Appbar, Button, Paragraph, } from  'react-native-paper';
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
        height: 125,
        padding: 5,
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
        height: 75, width: 100, 
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
            
            fetch(serverURL+'/api/users/favorite',{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res=>{
                if (res.status===200) {
                    res.json().then(data=>{
                        //console.log(data)
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

    closeRow = (rowMap, rowKey) => {
		if (rowMap[rowKey]) { rowMap[rowKey].closeRow() }
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
          
        </View>

        <SwipeListView
            useFlatList
            data={allTrips}
            disableLeftSwipe={true}
            renderItem={ (data, rowMap) => {
                let index= parseInt(data.item.key), trip = data.item.trip
                let tripTitleLen= trip.title.length
                return(
                <TouchableHighlight style={styles.rowFront}
                    onPress={()=>this.toTripDetails(index)}>
                  <View>
                    <Text style={{fontSize: tripTitleLen>=50? 12 : tripTitleLen>=25? 16 : 20, fontFamily: 'Avenir', marginTop: 10}}>
                        {trip.title.toUpperCase()}
                      </Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image source={{ uri: serverURL+'/'+trip.image }} style={cardStyles.cardImg} />
                      
                      <View style={{marginLeft: 10, alignSelf: 'flex-end', flexDirection: 'column'}}>
                        <Paragraph style={{fontSize: 16, fontFamily: 'Avenir', margin: 0}}>
                            Duration: 
                            <Text style={{color: 'rgb(49,90,158)'}}>
                                {' '+getDaysDiffText(trip.startDate,trip.endDate)}
                            </Text>
                        </Paragraph>
                        <Paragraph style={{fontSize: 16, fontFamily: 'Avenir'}}>
                            From: 
                            <Text style={{color: 'rgb(49,90,158)'}}>
                                {' '+trip.startDate.split('-').join('/')+' '}
                            </Text> 
                        </Paragraph>
                        <Paragraph style={{fontSize: 16, fontFamily: 'Avenir'}}>
                            to: 
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
                  <TouchableOpacity style={{borderRadius: 5, }} onPress={()=>this.favToggle(index)}
                  >
                    <View style={{flexDirection: 'column', }}>
                        <Text style={{color: 'rgb(49,90,158)', margin: 5, fontSize: 16, fontFamily: 'Avenir'}}> 
                            Remove
                        </Text>
                        <Text style={{color: 'rgb(49,90,158)', margin: 5, fontSize: 16, fontFamily: 'Avenir'}}> 
                            Favorite
                        </Text>
                    </View>
                  </TouchableOpacity>
                  <Text />
                </View>
            )}}
            leftOpenValue={100}
        />

    </React.Fragment>
        )
    }
}
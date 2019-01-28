import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar, Button } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { serverURL, tokenName } from './config/envConst';


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
    }
})

export default class TripContainer extends Component {

    state= {
        trips: [],
    }

    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    componentDidMount = () => {
        this._getToken().then(token=>{
            console.log("trip: ",token)
            /*
            fetch(serverURL ,{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res=>{
                console.log(res)
                if (res.status===200) {
                    res.json().then(data=>{
                        this.setState({
                            trips: data.trips,
                        })
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
            <Text style={styles.tripInfo}>`You have ${this.state.trips.length} trips`</Text> : 
            <Text style={styles.tripInfo}>You don't have any trip yet</Text>
                      
        return (
    <React.Fragment>
        
        <Appbar.Header statusBarHeight={20} style={styles.appbarHeader}>
            <Appbar.Content title="Trips" titleStyle={styles.contentTitle} />
        </Appbar.Header>
        
        <View style={{justifyContent: 'center', margin: 15 }}>
          <Button style={{borderRadius: 20, width: '40%', marginLeft: '30%', backgroundColor: 'rgb(49,90,158)'}}>
            <Text style={{color: 'rgb(255,255,255)', fontSize: 20}}>
              + New Trip
            </Text>  
          </Button>
        </View>

        <ScrollView style={{marginTop: 25}}>
          {numTrips}
        </ScrollView>

    </React.Fragment>
        )
    }
}
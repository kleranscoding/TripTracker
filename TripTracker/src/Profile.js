import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar, Button } from  'react-native-paper';
import MapView from 'react-native-maps';

import { serverURL, tokenName, imgHgtWdt } from './config/envConst';


const styles = StyleSheet.create({
    appbarHeader:{
      backgroundColor: 'rgb(36,152,216)',
    },
    contentTitle: {
      fontSize: 24, fontFamily: 'Avenir',
    },
    greeting: {
        fontStyle: 'italic',
        fontSize: 24, fontFamily: 'Avenir',
    },
    profileInfo: {
        fontSize: 20, fontFamily: 'Avenir',
    },
    tripInfo: {
        textAlign: 'center',
        fontSize: 20, fontFamily: 'Avenir',
    },
    imgStyle: {
      width: imgHgtWdt, height: imgHgtWdt, 
    },
    profileInfoWrapper: {
      flexDirection: 'row', backgroundColor: 'rgba(49,90,158,0.25)', 
      borderBottomWidth: 2, borderBottomColor: 'grey', 
    },
})


class MapContainer extends Component {
    
  state = {
      region: {
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
      },
  }
  
  onRegionChange = (region)=> { this.setState({ region }) }

  render() {
      return(
  <MapView style={{margin: 20, height: '30%'}} 
    region={this.state.region} onRegionChange={this.onRegionChange} />
      )
  }
  
}

export default class Profile extends Component {
    constructor(props) {
      super(props)
      props.navigation.addListener('didFocus',payload => {
          console.debug('didFocus', payload);
          this._getProfileInfo()
      })
      this.state = {
        username: '', email: '', image: '', trips: [],
      }
    }

    componentDidMount = () => { this._getProfileInfo() }
    
    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    _getProfileInfo = () => {
      this._getToken().then(token=>{
        //console.log("profile: ",token)
        fetch(serverURL+'/api/users/profile',{
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res=>{
          if (res.status===200) {
            res.json().then(data=>{
              this.setState({
                username: data.username, email: data.email, image: data.image, trips: data.trips,
              })
            })
          }
        }).catch(err=>{ console.log(err) })
      }).catch(error=>{
        console.log("get token error:",error)
      })
    }

    render() {

        let numTrips = this.state.trips.length>0 ? 
            <React.Fragment>
              <Button onPress={()=>this.props.navigation.navigate('Trips')}
                style={{borderRadius: 20, width: '50%', marginLeft: '25%', backgroundColor: 'rgb(49,90,158)'}}>
                <Text style={{color: 'rgb(255,255,255)'}}>
                  {`You have ${this.state.trips.length} trips`}
                </Text>
              </Button>
            </React.Fragment>: 
            <React.Fragment>
              <Text style={styles.tripInfo}>You don't have any trip yet</Text>
              <Button onPress={()=>this.props.navigation.navigate('Trips')}
                style={{borderRadius: 20, width: '50%', marginLeft: '25%', backgroundColor: 'rgb(49,90,158)'}}>
                <Text style={{color: 'rgb(255,255,255)'}}>Add a Trip!</Text>
              </Button>
            </React.Fragment>

        return(
    <React.Fragment>
        
        <Appbar.Header statusBarHeight={20} style={styles.appbarHeader}>
            <Appbar.Content title="Profile" titleStyle={styles.contentTitle} />
        </Appbar.Header>
        
        {/* <Text style={styles.greeting}>Welcome, {this.state.username}!</Text> */}
        
        <View style={styles.profileInfoWrapper}>
          <Image source={{uri: serverURL+'/'+this.state.image}} style={styles.imgStyle}  />
                    
          <View style={{justifyContent: 'center', margin: 10, }}>
            <Text style={styles.profileInfo}>{this.state.username}</Text>
            <Text style={styles.profileInfo}>{this.state.email}</Text>
          </View> 
        </View>
        
        <MapContainer />
      
        <ScrollView style={{marginTop: 25}}>
          {numTrips}
        </ScrollView>
        
    </React.Fragment>
        )
    }
}

import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, Image, Alert,
    ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Appbar, Button, TextInput } from  'react-native-paper';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Constants, Location, Permissions } from 'expo';

import { serverURL, tokenName, imgHgtWdt } from './config/envConst';
import Logout from './screens/Logout';
import EditAvatarModal from './EditAvatarModal';

const styles = StyleSheet.create({
    appbarHeader:{
      backgroundColor: 'rgb(36,152,219)',
    },
    contentTitle: {
      fontSize: 24, fontFamily: 'Avenir',
    },
    greeting: {
        fontStyle: 'italic',
        fontSize: 24, fontFamily: 'Avenir',
    },
    profileInfo: {
        fontSize: 18, fontFamily: 'Avenir', width: 200,
    },
    tripInfo: {
        textAlign: 'center',
        fontSize: 20, fontFamily: 'Avenir',
    },
    imgStyle: {
      width: imgHgtWdt, height: imgHgtWdt, 
    },
    profileInfoWrapper: {
      flexDirection: 'row', 
      backgroundColor: 'rgba(49,90,158,0.25)', 
      borderBottomWidth: 2, borderBottomColor: 'grey', 
    },
})

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

_getToken = async() => { return await AsyncStorage.getItem(tokenName) }

class MapContainer extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      region: {
          latitude: props.geolocation.latitude || 37.78825,
          longitude: props.geolocation.longitude || -122.4324,
          latitudeDelta: LATITUDE_DELTA,longitudeDelta: LONGITUDE_DELTA,
      },
    }
  }
  
  onRegionChange = (region)=> { this.setState({ region }) }

  render() {
      return(
        <MapView style={{margin: 10, height: 250}} 
          initialRegion={this.state.region} >
          <Marker
            coordinate={this.state.region}
            title={this.props.geolocation? this.props.username: "San Francisco"} 
            description={this.props.geolocation? "You are here": "San Francisco"}  />
        </MapView>
      )
  }
  
}

export default class Profile extends Component {
    constructor(props) {
      super(props)
      this.focusListener = this.props.navigation.addListener('didFocus',payload => {
        //console.debug('didFocus', payload);
        this._getProfileInfo()
      })
      this.state = {
        username: '', email: '', image: '', trips: [],
        modalExit: false, geolocation: null,
        modalAvatar: false,
        editProfile: false,
      }
    }

    componentWillMount() {
      this._getLocationAsync()
    }

    componentDidMount = () => {  
      //this._getProfileInfo() 
    }

    componentWillUnmount = () => { this.focusListener.remove() }
    
    _getLocationAsync = async () => {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') { 
        Alert.alert('Permission to access location was denied'); 
        return
      }
      let geolocation = await Location.getCurrentPositionAsync({});
      this.setState({ geolocation })
    }

    updateImage = (data,target) => {
        this.setState({
          image: data.image, [target]: false,
        })
    }

    _getProfileInfo = () => {
      _getToken().then(token=>{
        console.log("profile: ")
        fetch(serverURL+'/api/users/profile',{
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res=>{
          if (res.status===200) {
            res.json().then(data=>{
              this.setState({
                username: data.username, email: data.email, image: data.image, trips: data.trips,
              })
              console.log("done getting profile details...")
            })
          }
        }).catch(err=>{ console.log(err) })
      }).catch(error=>{
        console.log("get token error:",error)
      })
    }

    setModalExit = (visible) => {
      this.setState({ modalExit: visible})
    }

    setModal = (visible,modalType,selectOnType) => {
      this.setState({
          [modalType]: visible, [selectOnType]: {},
      })
    }

    render() {
        const defaultImageSetting= {
          "target": "modalAvatar", "image": "images/default_profile.jpg", "route": "users/avatar"
        }
        // get for number of trips
        let numTrips = this.state.trips.length>0 ? 
            <React.Fragment>
              <Button onPress={()=>this.props.navigation.navigate('Trips')}
                style={{borderRadius: 20, width: '50%', marginLeft: '25%', backgroundColor: 'rgb(49,90,158)'}}>
                <Text style={{color: 'rgb(255,255,255)'}}>
                  { this.state.trips.length>1 ? 
                    `You have ${this.state.trips.length} trips` : 
                    this.state.trips.length>0 ? 
                    `You have ${this.state.trips.length} trip`:
                     'You don\'t have any trip'
                  }
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
          <Appbar.Content title={"Hi, "+this.state.username} titleStyle={styles.contentTitle} />
          <TouchableOpacity onPress={()=>this.setModalExit(true)}
            style={{alignItems: 'center', alignContent: 'flex-end'}}>
            <Ionicons name="ios-exit" size={28} color="rgb(255,255,255)" />
            <Text style={{color: "rgb(255,255,255)"}}>Log Out</Text>
          </TouchableOpacity> 
        </Appbar.Header>
        
        <View style={styles.profileInfoWrapper}>
          <TouchableOpacity onPress={()=>this.setState({modalAvatar: true})}>
            <Image source={{uri: serverURL+'/'+this.state.image}} style={styles.imgStyle}  />
          </TouchableOpacity>
                    
          <TouchableOpacity 
            style={{justifyContent: 'center', margin: 10, }}>
            {this.state.editProfile?
              <TextInput type="outlined" onChangeText={(text)=>this.setState({ username: text})}
                style={styles.profileInfo}>{this.state.username}
              </TextInput> :
              <Text style={styles.profileInfo}>{this.state.username}</Text>
            }
            <Text style={styles.profileInfo}>{this.state.email}</Text>
          </TouchableOpacity> 

          <TouchableOpacity style={{alignSelf: 'center'}}
            onPress={()=>this.setState({ editProfile: !this.state.editProfile })}>
            <Text style={{padding: 10, fontSize: 20}}>
              {this.state.editProfile? "Save" : "Edit" }
            </Text>
          </TouchableOpacity>
        </View>

         { this.state.geolocation && 
            <MapContainer username={this.state.username} geolocation={this.state.geolocation.coords} /> }
          
        <ScrollView style={{marginTop: 25}}>
          {numTrips}
        </ScrollView>

        <Modal animationType="slide" transparent={false} visible={this.state.modalExit}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalExit(false)
            }}>
            <Logout setModalExit={this.setModalExit} navigation={this.props.navigation} />
        </Modal>

        <Modal animationType="slide" transparent={false} visible={this.state.modalAvatar}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModal(false,"modalAvatar","")
            }}>
            <EditAvatarModal setting={defaultImageSetting}
              currentImage={this.state.image}
              setModal={this.setModal} 
              updateImage={this.updateImage} />
        </Modal>
        
    </React.Fragment>
        )
    }
}


import React, { Component } from 'react';
import { AsyncStorage, View, Text, Button } from 'react-native';
import { createBottomTabNavigator, createAppContainer, createStackNavigator } from 'react-navigation';
import { } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { serverURL, tokenName } from './config/envConst';
import Profile from './Profile';
import Logout from './screens/Logout';


class HomeScreen extends Component {

    _signOutAsync = async () => {
      await AsyncStorage.removeItem(tokenName)
      this.props.navigation.navigate('Splash');
    };
  
    render() {
      return(
        <View>
          <Text>Home</Text>
          <Button onPress={()=>this.props.navigation.navigate('Other')} title="Go to Other"/>
          <Button onPress={this._signOutAsync} title="Log Out"/>
        </View>
      )
    }
  
  }
  
class OtherScreen extends Component {

    _signOutAsync = async () => {
        await AsyncStorage.removeItem(tokenName)
        this.props.navigation.navigate('Splash');
    }

    render() {
        return(
        <View>
            <Text>Other</Text>
            <Button onPress={()=>this.props.navigation.navigate('Profile')} title="Go to Home"/>
        </View>
        )
    }
}
  

const MainContentStack = createBottomTabNavigator({ 
    Profile: {
        screen: Profile,
        navigationOptions: () => ({
            tabBarIcon: () => (
              <Ionicons name="ios-person" size={28} color="rgb(36,152,219)" />
            ),
            title: {fontSize: 20}
        }),
    }, 
    Trips: {
        screen: OtherScreen,
    },
    Logout: {
        screen: Logout,
        navigationOptions: () => ({
            tabBarIcon: () => (
              <Ionicons name="ios-log-out" size={28} color="rgb(36,152,219)" />
            ),
            title: {fontSize: 20}
        }),
    },
},
{
    tabBarOptions: {
        activeTintColor: 'rgb(248,248,248)', 
        inactiveTintColor: 'rgb(143,154,186)',  
        style: {
            backgroundColor: 'rgb(49,90,158)', 
        },
        labelStyle: {
          fontSize: 16, fontFamily: 'Avenir',
        }
    }
},
)
  


export default MainContent = createAppContainer(MainContentStack)


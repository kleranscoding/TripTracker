
import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';
import { createBottomTabNavigator, createAppContainer, createStackNavigator } from 'react-navigation';
import { } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { serverURL, tokenName } from './config/envConst';
import Profile from './Profile';
import TripContainer from './TripContainer';
import Logout from './screens/Logout';


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
        screen: TripContainer,
        navigationOptions: () => ({
            tabBarIcon: () => (
              <Ionicons name="ios-briefcase" size={28} color="rgb(36,152,219)" />
            ),
            title: {fontSize: 20}
        }),
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
    initialRouteName: 'Trips',
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


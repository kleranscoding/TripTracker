
import React, { Component } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { createBottomTabNavigator, createAppContainer, } from 'react-navigation';
import { Appbar } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import Profile from './Profile';
import TripScreen from './TripContainer';
import Favorites from './Favorites';

const styles = StyleSheet.create({
    appbarHeader:{
      backgroundColor: 'rgb(36,152,216)',
    },
    contentTitle: {
      fontSize: 24, fontFamily: 'Avenir',
    },
})

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
        screen: TripScreen,
        navigationOptions: () => ({
            tabBarIcon: () => (
              <Ionicons name="ios-briefcase" size={28} color="rgb(36,152,219)" />
            ),
            title: {fontSize: 20}
        }),
    },
    Favorites: {
        screen: Favorites,
        navigationOptions: () => ({
            tabBarIcon: () => (
              <Ionicons name="ios-star" size={28} color="rgb(36,152,219)" />
            ),
            title: {fontSize: 20}
        }),
    },
},
{
    initialRouteName: 'Favorites',
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


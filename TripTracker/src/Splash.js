import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { Appbar } from 'react-native-paper';
import { createBottomTabNavigator } from 'react-navigation';
import { Ionicons } from '@expo/vector-icons';

import Auth from './screens/Auth';


const styles = StyleSheet.create({
  appbarHeader:{
    backgroundColor: 'rgb(36,152,216)',
  },
  contentTitle: {
    fontSize: 36, fontFamily: 'Avenir',
  },
})

class Intro extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Appbar.Header statusBarHeight={20} style={styles.appbarHeader}>
            <Appbar.Content title="Trip Tracker" titleStyle={styles.contentTitle} />
          </Appbar.Header>
        <Image resizeMode="contain" source={require('../assets/travel_logo.png')}/>
      </React.Fragment>)
  }
}

export default Splash = createBottomTabNavigator({
    Home: {
      screen: Intro,
      navigationOptions: () => ({
        tabBarIcon: () => (
          <Ionicons name="ios-home" size={28} color="rgb(36,152,219)" />
        ),
        title: {fontSize: 20}
      }),
    }, 
    "Login/Register": {
      screen: Auth,
      navigationOptions: () => ({
        tabBarIcon: () => (
          <Ionicons name="ios-log-in" size={28} color="rgb(36,152,219)" />
        )
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

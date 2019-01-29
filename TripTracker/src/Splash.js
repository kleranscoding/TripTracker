import React from 'react';
import { StyleSheet, ScrollView, Text, Image } from 'react-native';
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
        <ScrollView style={{paddingTop: 30, backgroundColor: 'rgba(36,152,216,0.25)'}}>
          <Image resizeMode="contain" style={{justifyContent: 'center', width: '100%', height: 200}}
              source={require('../assets/travel_logo.png')}/>
          <Text style={{margin: 20, fontSize: 18, padding: 5, textAlign: 'center',}}>
            Sur casernes eut pic criaient couvrent defoncat heureuse. Bon oeil aux mats tuer chez poil peur. Saut poil il fils un nous je eu idee. Si mais haut oh ah quoi loin. Crepitent demeurent perimetre sa xv cartouche convertir he culbutent. Cercle qu valoir ca bruits le ca. Oeufs feu dit sorte rente trois ecole mur moins. 
          </Text>
        </ScrollView>
        
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

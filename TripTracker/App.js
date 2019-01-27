import React, {Component } from 'react';
import { AppRegistry } from 'react-native';
import { AsyncStorage, StyleSheet, Text, View, Button } from 'react-native';
import { DefaultTheme, Appbar, Provider as PaperProvider } from 'react-native-paper';
import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation';

import AuthLoading from './src/AuthLoading';
import Splash from './src/Splash'
import { tokenName } from './envconst'

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2498db',
    accent: '#f1c40f',
  }
}

const styles = StyleSheet.create({
  appbarHeader: {
    backgroundColor: 'rgba(36,152,219,0.8)'
  },
  contentTitle: {
    fontSize: 36,
  }
})

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
  };

  render() {
    return(
      <View>
        <Text>Other</Text>
        <Button onPress={()=>this.props.navigation.navigate('Home')} title="Go to Home"/>
        <Button onPress={this._signOutAsync} title="Log Out"/>
      </View>
    )
  }
}


const MainContentStack = createStackNavigator({ 
  Home: HomeScreen, Other: OtherScreen 
});

const AppContainer = createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoading,
    MainContent: MainContentStack,
    Splash: Splash,
  },
  {
    initialRouteName: 'AuthLoading',
  },
));

export default function Main() {

  return (
    <PaperProvider theme={theme}>
      <AppContainer />
    </PaperProvider>
  );
}

AppRegistry.registerComponent('main', () => Main);

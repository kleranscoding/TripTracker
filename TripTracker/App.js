import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { AsyncStorage, StyleSheet, } from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { createSwitchNavigator, createAppContainer, } from 'react-navigation';

import AuthLoading from './src/AuthLoading';
import Splash from './src/Splash'


import MainContent from './src/MainContent';

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
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
})

const AppContainer = createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoading,
    MainContent: MainContent,
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

import React from 'react';
import { AsyncStorage, Alert, StyleSheet, Text, View, Image } from 'react-native';
import { TouchableHighlight } from 'react-native';
import { Appbar, Modal, Button } from 'react-native-paper';
import { createBottomTabNavigator } from 'react-navigation';

import LoginModal from './screens/LoginModal';
import Login from './screens/Login';
import Auth from './screens/Auth';
import Nav from './Nav'
import { serverURL } from '../envconst'

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
    }, 
    "Login/Register": {
      screen: Auth,
    }, 
})


/*
export default class Splash extends React.Component {

  state = {
    text: '', isLoggedIn: false,
    loginModalVisible: false,
    index: 0,
    routes: [
      {'key': 'home', 'title': 'Home', 'icon': 'home'},
      {'key': 'login', 'title': 'Login/Sign Up', 'icon': 'launch'},
      //{'key': 'signup', 'title': 'Sign Up', 'icon': 'add'},
    ],
  }

  _handleIndexChange = index => this.setState({ index });

  _renderScene = ({route}) => {
    switch (route.key) {
      case 'home':
        return <Intro />
      case 'login':
        return (<Auth />)
    }
}

  setModalVisible = (visible)=> {
    this.setState({loginModalVisible: visible});
  }

  _showToken = async() => {
    try {
      const token = await AsyncStorage.getItem('token') || "none";
      console.log(token)
      Alert.alert(token)
    } catch (err) {
      console.log(err)
    }
    
  }

  render() {
    return (
      <React.Fragment>

        <BottomNavigation style={{backgroundColor: '#a4fa8e'}}
          navigationState={this.state}
          onIndexChange={this._handleIndexChange}
          renderScene={this._renderScene}
        />

        <Modal 
          animationType="slide"
          transparent={false}
          visible={this.state.loginModalVisible}
          onRequestClose={() => { Alert.alert('Modal has been closed.');}}>
          <LoginModal setModalVisible={this.setModalVisible} modalVisible={this.state.loginModalVisible} />
        </Modal>

      </React.Fragment>
    );
  }
}
//*/

//*
const styles = StyleSheet.create({
  appbarHeader:{
    backgroundColor: 'rgb(36,152,216)',
  },
  contentTitle: {
    fontSize: 36,
  },
})
//*/

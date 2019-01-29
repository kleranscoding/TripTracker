import React, { Component } from 'react';
import { Button, Image, View, Text } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import Login from './Login';
import Register from './Register'


class LoginScreen extends Component {
    static navigationOptions = {
        title: 'Login',
        headerTintColor: '#fafafa',
        headerTitleStyle: {
            fontSize: 24, fontFamily: 'Avenir',
        },
        headerStyle: {
            backgroundColor: 'rgba(36,152,219,0.5)'
        }
    }

    render() {
      return( 
    <React.Fragment>
      <View style={{marginBottom: 50}}>
        <Login navigation={this.props.navigation}/>
        <Button title="Create a new account?"
          onPress={()=>this.props.navigation.navigate('Register')} 
        />
      </View>
    </React.Fragment>)
    }
}

class RegisterScreen extends Component {
    static navigationOptions = {
        title: 'Register',
        headerTintColor: '#fafafa',
        headerTitleStyle: {
            fontSize: 24, fontFamily: 'Avenir',
        },
        headerStyle: {
            backgroundColor: 'rgba(36,152,219,0.5)'
        }
    }
    
    render() {
      return(
    <React.Fragment>
      <View style={{marginBottom: 50}}>
        <Register navigation={this.props.navigation}/>
        <Button title="Already have an account?"
          onPress={()=>this.props.navigation.navigate('Login')} 
        />
      </View>
    </React.Fragment>)
    } 
}

const AuthStack = createStackNavigator({
      Login: {
        screen: LoginScreen,
      },
      Register: {
        screen: RegisterScreen,
      },
    },
    {
      initialRouteName: 'Login',
    },
);

export default Auth = AuthStack

/*
const AuthContainer = createAppContainer(AuthStack);

export default class Auth extends React.Component {
  render() {
    return <AuthContainer />;
  }
}
//*/

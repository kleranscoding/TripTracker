import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, Modal, View, Text } from 'react-native';
import { createBottomTabNavigator, createAppContainer, createStackNavigator } from 'react-navigation';
import { Portal, Appbar, Button } from  'react-native-paper';

import { serverURL, tokenName } from '../config/envConst';


const styles = StyleSheet.create({
    appbarHeader:{
      backgroundColor: 'rgb(36,152,216)',
    },
    contentTitle: {
      fontSize: 24, fontFamily: 'Avenir',
    },
    modalLogout: {
        backgroundColor: 'rgba(49,90,158,0)',
        flex: 1,
        justifyContent: 'center',
    },
    modalText: {
        textAlign: 'center',
        fontSize: 24, fontFamily: 'Avenir',
        color: 'rgb(36,152,219)'
    },
    modalBtnCancel: {
        backgroundColor: 'rgb(194,214,214)',
        borderRadius: 25,
        margin: 20,
    },
    modalBtnConfirm: {
        backgroundColor: 'rgb(49,90,158)',
        borderRadius: 25,
        margin: 20,
    }
})

export default class Logout extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible: true,
        }
    }
    
    componentDidMount = () => { 
        // /this.setModalVisible(true) 
    }

    _signOutAsync = async () => {
        await AsyncStorage.removeItem(tokenName)
        this.props.navigation.navigate('Splash');
    }
    
    _cancel = () => {
        this.setModalVisible(false);
        this.props.navigation.goBack()
    }

    setModalVisible = (visible) => { this.setState({ modalVisible: visible}) }

    render() {
        return(
    //<Modal animationType="slide" transparent={false} visible={this.state.modalVisible} onRequestClose={() => { Alert.alert('Modal has been closed.'); this.setModalVisible(false) }}>
        <View style={styles.modalLogout}>
            <Text style={styles.modalText}>
                Are you sure you want to log out?
            </Text>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Button onPress={this._cancel} style={styles.modalBtnCancel}>
                    <Text>Cancel</Text>
                </Button>
                <Button onPress={this._signOutAsync} style={styles.modalBtnConfirm}>
                    <Text style={{color: 'white'}}>Log Out</Text>
                </Button>
            </View>
        </View>
    //</Modal>
        )
    }
} 
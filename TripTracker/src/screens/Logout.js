import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, Modal, View, Text } from 'react-native';
import { createBottomTabNavigator, createAppContainer, createStackNavigator } from 'react-navigation';
import { Portal, Appbar, Button, } from  'react-native-paper';

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
    
    
    _signOutAsync = async () => {
        this.props.setModalExit(false)
        await AsyncStorage.removeItem(tokenName)
        this.props.navigation.navigate('Splash')
    }
    
    _cancel = () => {
        this.props.setModalExit(false);
    }

    render() {
        return(
    //<Modal animationType="slide" transparent={false} visible={this.state.modalVisible} onRequestClose={() => { Alert.alert('Modal has been closed.'); this.setModalVisible(false) }}>
    <React.Fragment>
        <Appbar.Header statusBarHeight={20} style={styles.appbarHeader}>
            <Appbar.Content title="Log Out" titleStyle={styles.contentTitle} />
        </Appbar.Header>
        <View style={styles.modalLogout}>
            <Text style={styles.modalText}>
                Are you sure you want to log out?
            </Text>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Button onPress={this._cancel} style={styles.modalBtnCancel}>
                    <Text>Cancel</Text>
                </Button>
                <Button onPress={this._signOutAsync} style={styles.modalBtnConfirm}>
                    <Text style={{color: 'white'}}>Sign Off</Text>
                </Button>
            </View>
        </View>
    </React.Fragment>
    //</Modal>
        )
    }
} 
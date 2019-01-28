
import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, Image } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar } from  'react-native-paper';

import { serverURL, tokenName } from './config/envConst';

const styles = StyleSheet.create({
    appbarHeader:{
      backgroundColor: 'rgb(36,152,216)',
    },
    contentTitle: {
      fontSize: 24, fontFamily: 'Avenir',
    },
})


export default class Profile extends Component {

    static navigationOptions = {
        title: 'Profile'
    }

    state = {
        username: '', email: '', image: '',
    }

    _getToken = async() => {
        return await AsyncStorage.getItem(tokenName)
    }

    componentDidMount = () => {
        this._getToken().then(token=>{
        
            fetch(serverURL+'/api/users/profile',{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res=>{
                console.log(res)
                if (res.status===200) {
                    res.json().then(data=>{
                        this.setState({
                            username: data.username, email: data.email, image: data.image,
                        })
                    })
                }
                
            }).catch(err=>{ console.log(err) })
        
        }).catch(error=>{
            console.log("get token error:",error)
        })
    }

    render() {
        
        return(
    <React.Fragment>
        
        <Appbar.Header statusBarHeight={20} style={styles.appbarHeader}>
            <Appbar.Content title="Profile" titleStyle={styles.contentTitle} />
        </Appbar.Header>
        
        <View style={{flex: 1, alignContent: 'center'}}>
            <Image source={{uri: serverURL+'/'+this.state.image}} style={{width: 125, height: 125,}}/>
            <Text>{this.state.username}</Text>
            <Text>{this.state.email}</Text>
        </View>
    </React.Fragment>
        )
    }
}

import React, { Component } from 'react';
import { Alert, View, Text, TextInput, StyleSheet } from 'react-native';
import { AsyncStorage, TouchableHighlight } from 'react-native';
import { Button } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import {serverURL, tokenName, pwdLen, regexEmail, regexWhitespace, errorMsg} from '../../envconst'

const styles = StyleSheet.create({
    "login": {
        backgroundColor: "white",
        padding: 20,
        marginTop: 30,
        height: '90%',
    },
    "login_btn": {
        marginTop: 25,
        borderRadius: 25,
        backgroundColor: 'rgba(36,152,219,0.75)',
        marginLeft:'25%', width: '50%',
    },
    "input": {
        marginTop: 15, marginBottom: 15,
        borderBottomColor: 'rgba(5,5,5,0.25)', borderBottomWidth: 1,
        fontSize: 18,
    },
    "inputErr": {
        borderColor: 'rgba(255,0,0,0.5)', borderWidth: 1, borderRadius: 5,
        marginTop: 15, marginBottom: 15,
        padding: 5,
        fontSize: 18,
        
    },
    errorText: {
        color: 'rgba(255,0,0,0.5)',
    }
})

const appToken = tokenName

function containWhiteSpace(text) { return regexWhitespace.test(text) }

function validateEmail(text) { return regexEmail.test(text.toLowerCase()) }

export default class Login extends Component {

    state = {
        email: '', password: '',
        msgEmail: '', msgPwd: '',
        styleEmail: styles["input"], stylePwd: styles["input"], 
    }

    login = (e) => {
        e.preventDefault()
        let errEmail= true, errPwd= true
        let email= this.state.email,password= this.state.password
        console.log(email,password)
        // validate email
        if (!email || !validateEmail(email)) {
            this.setState({ msgEmail: errorMsg.emptyEmail, styleEmail: styles["inputErr"], })
        } else if (containWhiteSpace(email)) {
            this.setState({ msgEmail: errorMsg.whiteSpace, styleEmail: styles["inputErr"], })
        } else {
            errEmail= false
        }
        // validate password
        if (password.length<pwdLen) {
            this.setState({ msgPwd: errorMsg.emptyPwd, stylePwd: styles["inputErr"], })
        } else if (containWhiteSpace(password)) {
            this.setState({ msgPwd: errorMsg.whiteSpace, stylePwd: styles["inputErr"],})
        } else {
            errPwd= false
        }
        console.log(errEmail , errPwd)
        // final validation
        if (errEmail || errPwd) return
        Alert.alert("success")
        //*
        fetch(serverURL+'/api/users/login',{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": email, "password": password,
            }),
        })
        .then(res=>{
            if (res.status!==200) { return console.log(res._bodyText) }
            console.log("user found")
            this._loginAsync(res)
            this._showToken()
        })
        .catch(err=>{ console.log(err) })
        //*/
    }

    _loginAsync = async(res) => {
        await AsyncStorage.setItem(appToken,res.headers.map['x-token'])
        this.props.navigation.navigate('MainContent');
    }

    _showToken = async() => {
        try {
            const token = await AsyncStorage.getItem(appToken)
            console.log(token)
        } catch(err) {console.log(err)}
    }

    handleInput = (evt,name) => {
        this.setState({ [name]: evt.nativeEvent.text })
    }

    onFocus = (msgName,styleName) => {
        this.setState({ [msgName]: '', [styleName]: styles["input"], })
    }

    onBlurEmail = () => {
        let email= this.state.email
        if (containWhiteSpace(email)) {
            this.setState({ 
                msgEmail: errorMsg.whiteSpace, 
                styleEmail: styles["inputErr"],
            })
            return
        } else if (!validateEmail(email)) {
            this.setState({ 
                msgEmail: errorMsg.emptyEmail, 
                styleEmail: styles["inputErr"],
            })
            return
        } 
    }

    onBlurPwd = () => {
        let password= this.state.password
        if (containWhiteSpace(password)) {
            this.setState({ 
                msgPwd: errorMsg.whiteSpace, 
                stylePwd: styles["inputErr"],
            })
            return
        } else if (password.length<pwdLen ) {
            this.setState({ 
                msgPwd: errorMsg.emptyPwd,
                stylePwd: styles["inputErr"], 
            })
            return
        }
    }

    render() {

        return (

        <KeyboardAwareScrollView style={styles.login}>
          
          <Text style={{textAlign: 'center'}}>
              Sign in with Email
          </Text>
          <TextInput name="email" type="email" style={this.state.styleEmail} 
            onFocus={()=>this.onFocus("msgEmail","styleEmail")} onBlur={this.onBlurEmail} autoCapitalize = 'none'
            onChange={(e)=>this.handleInput(e,"email")} placeholder='Email' />
          <Text style={styles.errorText}>
            {this.state.msgEmail}
          </Text>
          <TextInput name="password" type="password" style={this.state.stylePwd} secureTextEntry={true}
            onFocus={()=>this.onFocus("msgPwd","stylePwd")} onBlur={this.onBlurPwd} autoCapitalize = 'none'
            onChange={(e)=>this.handleInput(e,"password")} placeholder='Password' />
          <Text style={styles.errorText}>
            {this.state.msgPwd}
          </Text>
          <Button onPress={this.login} style={styles["login_btn"]}>
            <Text style={{color: 'rgb(255,255,255)'}}>Log In</Text>
          </Button>
          
        </KeyboardAwareScrollView>
        )
    }
}

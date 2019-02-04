import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, 
    TouchableHighlight, Alert, TouchableOpacity, Picker, Dimensions, } from 'react-native';
import { Appbar, Button, TextInput, } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import CalendarPicker from 'react-native-calendar-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Categories, serverURL, tokenName, regexWhitespaceOnly, currencyInfo } from './config/envConst';


/**
 * STYLESHEETS
 */
const modalStyles = StyleSheet.create({
    newSpendGreeting: {
        textAlign: 'center', 
        fontSize: 24, fontFamily: 'Avenir', color: 'rgb(255,255,255)',
    },
    closeModalText: {
        marginRight: 5, 
        textAlign: 'right', fontSize: 18, color: 'rgb(255,255,255)',
    },
    modalHeader: {
        marginBottom: 20, 
        paddingBottom: 20, paddingTop: 35, backgroundColor: 'rgb(36,152,219)' 
    },
    "create_btn": {
        marginTop: 25, marginLeft:'25%', 
        borderRadius: 25,
        backgroundColor: 'rgba(36,152,219,0.75)',
        width: '50%',
    },
    "create_btn_text": {
        padding: 10, 
        textAlign: 'center', fontSize: 20, color: 'rgb(255,255,255)'
    },
})


/**
 * FUNCTIONS AND CONSTANTs 
 */
const selectText = ' (selected)'

const catLabels = Categories.map(cat=>{ return cat.label })
const currencyList = currencyInfo

function validateWhtieSpaceOnly(text) { return regexWhitespaceOnly.test(text) }

function padZero(num) { return (num>=0 && num<=9)? `0${num}`:`${num}`; }

function dateToString(selectedDate) {
    let date= new Date(selectedDate)
    return `${date.getFullYear()}-${padZero(date.getMonth()+1)}-${padZero(date.getDate())}`
}

_getToken = async() => { return await AsyncStorage.getItem(tokenName) }


/**
 * NEWSPEND MODAL
 */
export default class NewSpendModal extends Component {
    constructor() {
        super()
        this.location= ''
        this.formatAddr= ''
        this.geocode = {}
        this.state = {
            catIndex: null,
            name: '', category: '', date: '',
            amount: '', currency: 'USD', note: '',
            catLabels: Categories.map(cat=>{ return cat.label }),
            catLabel: '',
            currencyList: currencyInfo,
            resizeCurr: false, resizeCat: false,
            openCalendar: false
        }
    }

    submitSpendInfo = () => {
        let errDate= true, errName= true, errAmt= true, errCat= true
        let errMsgDate= '', errMsgName= '', errMsgAmt='', errMsgCat = ''
        if (!this.state.date) {
            errMsgDate= '- Please select a date'
        } else {
            errDate= false
        }
        if (!this.state.name || validateWhtieSpaceOnly(this.state.name)) {
            errMsgName= '- Please describe this expense'
        } else {
            errName= false
        }
        if (!this.state.amount) {
            errMsgAmt= '- Please enter an amount'
        } else {
            errAmt= false
        }
        if (this.state.catIndex===null) {
            errMsgCat = "- Please select a category"
        } else {
            errCat= false
        }
        if (errDate || errName || errAmt || errCat) {
            Alert.alert("Hang On!\n"+
            errMsgName+"\n"+errMsgAmt+"\n"+errMsgDate+"\n"+errMsgCat)
            return
        }
        //console.log(this.state.date);console.log(this.state.name);console.log(this.state.amount);console.log(this.state.currency);console.log(this.state.category);console.log(this.state.note || 'empty string')
        _getToken().then(token=>{
            
            fetch(serverURL+'/api/spendings/new',{
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "location": this.props.locId,
                    "name": this.state.name.trim(), "date": this.state.date, "category": this.state.category,
                    "currency": this.state.currency, "amount": this.state.amount, "note": this.state.note,
                }),
            }).then(res=>{
                if (res.status===200) {
                  res.json().then(data=>{
                    console.log("add spends: ")
                    //console.log(data)
                    this.props.setModalVisible(false)
                    this.props.addSpends(data)
                  })
                }
            }).catch(err=>{ console.log(err) })
        }).catch(error=>{ console.log("get token error:",error) })
    }

    selectCategory = (index) => {
        this.setState({ 
            catIndex: index,
            category: Categories[index].label,
            resizeCat: false,
            catLabel: catLabels[index]+selectText
        })
    }

    onDateChange = (date, type) => { 
        this.setState({ 
            date: dateToString(date), openCalendar: false,
        }) 
    }

    resizeSelector = (name) => {
        if (this.state[name]) {
            this.setState({ [name]: false, })
        } else {
            this.setState({ [name]: true, })
        }
    }

    resizeCurrency = () => {
        if (this.state.resizeCurr) {
            this.setState({ resizeCurr: false, })
        } else {
            this.setState({ resizeCurr: true, })
        }
    }

    resizeCat = () => {
        if (this.state.resizeCat) {
            this.setState({ resizeCat: false, })
        } else {
            this.setState({ resizeCat: true, })
        }
    }

    render() {
        // create category button group
        let catButtonGrp = []
        Categories.map((cat,index)=>{
            return catButtonGrp.push(
            <View key={index} style={{alignSelf: 'flex-start'}}>
                <Button icon={cat.icon} ref={"cat_"+index}
                    onPress={()=>this.selectCategory(index)}>
                    <Text style={{color: 'rgb(36,152,219)', textAlign: 'left', padding: 5, fontSize: 18}}>
                        {this.state.catLabels[index]}
                    </Text>
                </Button>
            </View>
            )
        })
        // create currency picker group
        let currencyGrp = currencyList.map((currency,index)=>{
            return (<Picker.Item itemStyle={{ color: "rgb(255,255,255)", fontSize:16 }}
                key={index} label={currency[1]+" ("+currency[0]+")"} value={currency[0]} />)
        })


        return (
    <React.Fragment>
      <View style={modalStyles.modalHeader}>
        <TouchableHighlight onPress={()=>this.props.setModalVisible(false)}>
          <Text style={modalStyles.closeModalText}>
            Close &times;
          </Text>
        </TouchableHighlight>
        <Text style={modalStyles.newSpendGreeting}>
            New Expense Info
        </Text>
      </View>
      
      <KeyboardAwareScrollView>
        
        {/* <View >
            <CalendarPicker
                startFromMonday={true}
                allowRangeSelection={false}
                todayBackgroundColor="#f2e6ff"
                selectedDayColor="#7300e6"
                selectedDayTextColor="#FFFFFF"
                onDateChange={this.onDateChange}
            />
    
            <View>
            <Text>SELECTED DATE:{ this.state.date }</Text>
            </View>
        </View> */}

        <View style={{margin: 10}}>
            <Text style={{margin: 10, fontSize: 16, fontFamily: 'Avenir', color: 'rgb(49,90,158)'}}>
                DATE: {' '+this.state.date }
            </Text>
        </View>

        <TouchableOpacity style={{
                margin: 10, backgroundColor: 'rgb(36,152,219)',
                borderColor: 'silver', borderWidth: 1, borderRadius: 10, padding: 5
            }}
            onPress={()=>this.setState({openCalendar: !this.state.openCalendar})}>
            <Text style={{
                textAlign: 'center', fontSize: 20, fontFamily: 'Avenir', color: 'rgb(255,255,255)'}}
            >
                {this.state.openCalendar? 'Close ' : 'Open '} Calendar
            </Text>
        </TouchableOpacity>
        
        {this.state.openCalendar && 
        <View style={{borderColor: 'silver', borderWidth: 1, margin: 10, borderRadius: 10}}>
            <CalendarPicker
                startFromMonday={true}
                todayBackgroundColor="rgb(49,90,158)"
                selectedDayColor="rgb(49,90,158)"
                selectedDayTextColor="rgb(255,255,255)"
                onDateChange={this.onDateChange}
            />
        </View>}

        <TextInput label='What did you spend on?' mode="outlined" 
            onChangeText={text => this.setState({ name: text })}
            style={{margin: 10, borderRadius: 10, backgroundColor: 'rgb(255,255,255)', fontFamily: 'Avenir' }} />
        
        <View style={{flexDirection: this.state.resizeCurr? 'column' : 'row', alignContent: 'center', margin: 5}}>
          <View style={{width: this.state.resizeCurr? '100%' : '42%', justifyContent: 'center', }}>
            <TouchableOpacity onPress={this.resizeCurrency} 
                style={{backgroundColor: 'rgb(36,152,219)', borderRadius: 10, padding: 5, margin: 5 }}>
                <Text style={{textAlign: 'center',color: 'rgb(255,255,255)', fontSize: 18, fontFamily: 'Avenir'}}>
                    Selected: {this.state.currency}
                </Text>
            </TouchableOpacity>
            {this.state.resizeCurr && 
                <Picker style={{backgroundColor: 'rgb(255,255,255)'}}
                    selectedValue={this.state.currency} mode="dropdown"
                    onValueChange={(itemVal, itemIndex) => {
                        this.setState({currency: itemVal, resizeCurr: false })
                }}>
                    {currencyGrp}
                </Picker>}
          </View>
          <View style={{width: this.state.resizeCurr? '100%' : '50%'}}>
            <TextInput label='How much is that?' mode="outlined" keyboardType='numeric'
              onChangeText={text => this.setState({ amount: text })}
              style={{margin: 10, borderRadius: 10, backgroundColor: 'rgb(255,255,255)', fontFamily: 'Avenir' }} />
          </View>
        </View>
        
        
        <View style={{padding: 10, backgroundColor: 'rgb(36,152,219)', margin: 20, borderRadius: 10}}>
            <TouchableOpacity onPress={this.resizeCat} >
                <Text style={{color: 'rgb(255,255,255)', fontSize: 18, fontFamily: 'Avenir'}}>
                    {this.state.resizeCat? 'Select a category' : 
                        this.state.category!=='' ? 
                        'Category: '+this.state.category+' selected': 'Select a category'}
                </Text>
            </TouchableOpacity>
            {this.state.resizeCat && 
                <View style={{backgroundColor: 'rgb(255,255,255)', borderWidth: 1, borderColor: 'silver'}}>
                    {catButtonGrp}
                </View>}
 
        </View>
        
        <TextInput label='A little more about it maybe? (optional)' mode="outlined" multiline={true}
            onChangeText={text => this.setState({ note: text })}
            style={{margin: 20, borderRadius: 10, backgroundColor: 'rgb(255,255,255)', fontFamily: 'Avenir' }} />
    
        {/* <TouchableOpacity onPress={this.submitSpendInfo} style={modalStyles["create_btn"]}>
            <Text style={modalStyles["create_btn_text"]}>
                Add Expense
            </Text>
        </TouchableOpacity> */}

        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 50, marginBottom: 100}}>
            <Button onPress={()=>this.props.setModalVisible(false)} 
                style={{marginLeft: 10, marginRight: 10, borderColor: 'silver', borderWidth: 1, borderRadius: 10}}
            >
                <Text>Cancel</Text>
            </Button>
            <Button onPress={this.submitSpendInfo} 
                style={{backgroundColor: 'rgb(49,90,158)', borderRadius: 10, marginLeft: 10, marginRight: 10 }}>
                <Text style={{color: 'white'}}>Add Expense</Text>
            </Button>
        </View>

      </KeyboardAwareScrollView>
   
    </React.Fragment>
        )
    }
}


import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, 
    TouchableHighlight, Alert, TouchableOpacity, Picker, Dimensions, } from 'react-native';
import { Button, TextInput, } from  'react-native-paper';
import ModalDatePicker from 'react-native-datepicker-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Categories, serverURL, tokenName, regexWhitespaceOnly, currencyInfo } from './config/envConst';

/**
 * STYLESHEETS
 */
const modalStyles = StyleSheet.create({
    newLocGreeting: {
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
    datepicker: {
        justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center',
        borderColor: 'silver', borderWidth: 1, margin: 10,
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
const currencyList = currencyInfo
const catLabels = Categories.map(cat=>{ return cat.label })

function validateWhtieSpaceOnly(text) { return regexWhitespaceOnly.test(text) }

_getToken = async() => { return await AsyncStorage.getItem(tokenName) }


export default class EditSpendModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            name: props.selectOnEdit.name, category: props.selectOnEdit.category, date: props.selectOnEdit.date,
            amount: props.selectOnEdit.amount, currency: props.selectOnEdit.currency, note: '',
            catLabels: Categories.map(cat=>{ return cat.label }),
            catLabel: '',
            currencyList: currencyInfo,
            resizeCurr: false, resizeCat: false,
        }
    }
    
    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    submitEditSpendInfo = () => {
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
        if (this.state.category==='') {
            errMsgCat = "- Please select a category"
        } else {
            errCat= false
        }
        if (errDate || errName || errAmt || errCat) {
            Alert.alert("Hang On!\n"+
            errMsgName+"\n"+errMsgAmt+"\n"+errMsgDate+"\n"+errMsgCat)
            return
        }
        console.log(this.state.date);console.log(this.state.name);console.log(this.state.amount);console.log(this.state.currency);console.log(this.state.category);console.log(this.state.note || 'empty string')
        //*
        _getToken().then(token=>{
            
            //*
            fetch(serverURL+'/api/spendings/edit/'+this.props.selectOnEdit.id, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "name": this.state.name.trim(), "date": this.state.date, "category": this.state.category,
                    "currency": this.state.currency, "amount": this.state.amount, "note": this.state.note,
                }),
            }).then(res=>{
                if (res.status===200) {
                  res.json().then(data=>{
                    console.log("edit spends: ")
                    console.log(data)
                    this.props.editSpending(data)

                  })
                }
            }).catch(err=>{ console.log(err) })
        }).catch(error=>{
            console.log("get token error:",error)
        })
        //*/
    }

    selectCategory = (index) => {
        
        this.setState({ 
            catIndex: index,
            category: Categories[index].label,
            resizeCat: false,
            catLabel: catLabels[index]+selectText
        })
    }

    setDate = (newDate)=> { this.setState({chosenDate: newDate}); }

    updateDate = (name,date) => { this.setState({ [name]: date }) }

    resizeSelector = (name) => {
        if (this.state[name]) {
            this.setState({
                [name]: false,
                
            })
        } else {
            this.setState({
                [name]: true,
                
            })
        }
    }

    resizeCurrency = () => {
        if (this.state.resizeCurr) {
            this.setState({
                resizeCurr: false,
                
            })
        } else {
            this.setState({
                resizeCurr: true,
                
            })
        }
    }

    resizeCat = () => {
        if (this.state.resizeCat) {
            this.setState({
                resizeCat: false,
                
            })
        } else {
            this.setState({
                resizeCat: true,
                
            })
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
                    <Text style={{color: 'rgb(255,255,255)', textAlign: 'left', padding: 5, fontSize: 18}}>
                        {this.state.catLabels[index]}
                    </Text>
                </Button>
            </View>
            )
        })
        // create currency picker group
        let currencyGrp = currencyList.map((currency,index)=>{
            return (<Picker.Item itemStyle={{ color: "rgb(255,255,255)", fontSize:14 }}
                key={index} label={currency[1]+" ("+currency[0]+")"} value={currency[0]} />)
        })

        console.log(this.props)

        return (
    <React.Fragment>
      <View style={modalStyles.modalHeader}>
        <TouchableHighlight onPress={()=>this.props.setModalEdit(false,"modalEdit","selectOnEdit")}>
          <Text style={modalStyles.closeModalText}>
            Close &times;
          </Text>
        </TouchableHighlight>
        <Text style={modalStyles.newLocGreeting}>
            Edit Expense Info
        </Text>
      </View>

    <ScrollView>
      <KeyboardAwareScrollView style={{marginBottom: 100}}>
        
        <View style={modalStyles.datepicker}>
            <Text style={{fontSize: 18, margin: 10}}>Date: </Text>
            <ModalDatePicker startDate={new Date(this.state.date)}
                renderDate={({ year, month, day, date }) => {
                    let selectedDate = "Click here to select a date"
                    if (date) { 
                        selectedDate = `${year}-${month}-${day}` 
                    } else {
                        selectedDate = this.props.selectOnEdit.date
                    }
                    return <Text style={{fontSize: 18}}>{selectedDate}</Text>
                }}
                onDateChanged={({ year, month, day, date }) => {
                    if (date) {
                        this.updateDate("date",`${year}-${month}-${day}`)
                    }
                }}
            />
        </View>

        <TextInput label='What did you spend on?' mode="outlined" 
            onChangeText={text => this.setState({ name: text })}
            defaultValue={this.state.name}
            value={this.state.name}
            style={{margin: 10, borderRadius: 10, backgroundColor: 'rgb(255,255,255)' }} />
        
        <View style={{flexDirection: this.state.resizeCurr? 'column' : 'row', alignContent: 'center', }}>
          <View style={{width: this.state.resizeCurr? '100%' : '40%', padding: 10, flex: 1, backgroundColor: 'rgb(49,90,158)', margin: 5}}>
            <TouchableOpacity onPress={()=>this.resizeSelector("resizeCurr")}>
                <Text style={{color: 'rgb(255,255,255)', fontSize: 18, fontFamily: 'Avenir'}}>
                    Currency: {this.state.currency+" selected"}
                </Text>
            </TouchableOpacity>
            {this.state.resizeCurr && 
                <Picker style={{backgroundColor: 'rgb(255,255,255)'}}
                    selectedValue={this.state.currency} mode="dropdown"
                    onValueChange={(itemVal, itemIndex) => {
                        this.setState({
                            currency: itemVal,
                            resizeCurr: false, 
                        })
                }}>
                    {currencyGrp}
                </Picker>}
          </View>
          <View style={{width: this.state.resizeCurr? '100%' : '50%'}}>
            <TextInput label='How much is that?' mode="outlined" keyboardType='numeric'
              onChangeText={text => this.setState({ amount: text })}
              defaultValue={this.props.selectOnEdit.amount+''}
              //value={this.props.selectOnEdit.amount+''}
              style={{margin: 10, borderRadius: 10, backgroundColor: 'rgb(255,255,255)' }} />
          </View>
        </View>
        
        
        <View style={{padding: 20, flex: 1, backgroundColor: 'rgb(49,90,158)', margin: 20}}>
            <TouchableOpacity onPress={()=>this.resizeSelector("resizeCat")} style={{backgroundColor: 'rgba(49,90,158,0.5)'}}>
                <Text style={{color: 'rgb(255,255,255)', fontSize: 18, fontFamily: 'Avenir'}}>
                    {this.state.resizeCat? this.state.category+' selected' : 
                        this.state.category!=='' ? 
                        'Category: '+this.state.category+' selected': 'Select a category'}
                </Text>
            </TouchableOpacity>
            {this.state.resizeCat && catButtonGrp}
 
        </View>
        
        <TextInput label='A little more about it maybe? (optional)' mode="outlined" multiline={true}
            onChangeText={text => this.setState({ note: text })}
            defaultValue={this.state.note}
            value={this.state.note}
            style={{margin: 20, borderRadius: 10, backgroundColor: 'rgb(255,255,255)' }} />
    
        <TouchableOpacity onPress={this.submitEditSpendInfo} style={modalStyles["create_btn"]}>
            <Text style={modalStyles["create_btn_text"]}>
                Update Expense
            </Text>
        </TouchableOpacity>

      </KeyboardAwareScrollView>
    </ScrollView>
    </React.Fragment>
        )
    }
}
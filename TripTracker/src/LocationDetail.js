import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, Image,
    TouchableHighlight, Modal, Alert, TouchableOpacity, 
    FlatList, Picker, Dimensions, } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Appbar, Button, TextInput, Card, Title, Paragraph  } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
import ModalDatePicker from 'react-native-datepicker-modal';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SwipeListView } from 'react-native-swipe-list-view';

import { Categories, serverURL, tokenName, regexWhitespaceOnly, currencyInfo } from './config/envConst';
import { GOOGLAPI } from '../envAPI.js';

import EditSpendModal from './EditSpendModal';

/**
 * STYLESHEETS
 */
const styles = StyleSheet.create({
    imgSmall: {
        width: '50%', height: 75,
    },
    img: {
        width: '100%', height: 200,
    },
    imgViewSmall: {
        height: 100, 
    },
    imgView: {
        height: 250, 
    },
    spendInfo: {
        marginTop: 5,
        textAlign: 'center',
        fontSize: 20, fontFamily: 'Avenir',
    },
    rowFront: {
		alignItems: 'flex-start',
		backgroundColor: 'rgb(255,255,255)',
		borderBottomColor: 'silver',
		borderBottomWidth: 1,
		justifyContent: 'center',
        height: 75,
        padding: 10,
	},
	rowBack: {
		alignItems: 'center',
		backgroundColor: 'transparent',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 15,
    },
})

const spendStyles = StyleSheet.create({
    addNewBtn: {
        marginTop: 10 , marginLeft: 5, 
        borderRadius: 20, width: '36%', 
        backgroundColor: 'rgb(49,90,158)'
    },
    editBtn: {
        marginTop: 10 , marginLeft: 5, 
        borderRadius: 20, width: '25%', 
        backgroundColor: 'rgb(49,90,158)'
    },
    deleteBtn: {
        marginTop: 10 , marginLeft: 5, 
        borderRadius: 20, width: '25%', 
        backgroundColor: 'rgb(255,0,0)'
    },
})

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
    "datepicker_err": {
        borderColor: 'rgb(255,0,0)', borderWidth: 1, borderRadius: 5,
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
const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const catLabels = Categories.map(cat=>{ return cat.label })
const currencyList = currencyInfo

function validateWhtieSpaceOnly(text) { return regexWhitespaceOnly.test(text) }

_getToken = async() => { return await AsyncStorage.getItem(tokenName) }

/**
 * MAPCONTAINER
 */
class MapContainer extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            region: {
                latitude: props.geocode.lat? parseFloat(props.geocode.lat): 0,
                longitude: props.geocode.lng? parseFloat(props.geocode.lng): 0,
                latitudeDelta: 0.0922,longitudeDelta: 0.0421,
            },
        }
    }
    
    render() {
        return(
            <MapView style={{marginLeft: 15, marginRight: 15, height: 150, }} 
                initialRegion = {this.state.region} >
                <Marker
                    coordinate={this.state.region}
                    title={this.props.location} />
            </MapView>
        )
    }
}

/**
 * SPENDING CONTAINER
 */
class SpendingContainer extends Component {
    
    render() {
        let numSpends = this.props.spendings.length>0 ? 
            this.props.spendings.length > 1 ?
                <Text style={styles.spendInfo}>{`${this.props.spendings.length} spendings`}</Text> :
                <Text style={styles.spendInfo}>{`${this.props.spendings.length} spending`}</Text> :
            <Text style={styles.spendInfo}>You don't have any expense at this location yet</Text>
        
        return(
        <React.Fragment>
            {numSpends}
        </React.Fragment>
        )
    }
}

/**
 * NEWSPEND MODAL
 */
class NewSpendModal extends Component {
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
        }
    }
    
    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

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
        //*
        this._getToken().then(token=>{
            
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
        <Text style={modalStyles.newLocGreeting}>
            New Expense Info
        </Text>
      </View>
      
      <ScrollView >
      <KeyboardAwareScrollView style={{marginBottom: 100}}>
        
        <View style={modalStyles.datepicker}>
            <Text style={{fontSize: 18, margin: 10}}>Date: </Text>
            <ModalDatePicker startDate={new Date()}
                renderDate={({ year, month, day, date }) => {
                    let selectedDate = "Click here to select a date"
                    if (date) { 
                        selectedDate = `${year}-${month}-${day}` 
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
            style={{margin: 10, borderRadius: 10, backgroundColor: 'rgb(255,255,255)' }} />
        
        <View style={{flexDirection: this.state.resizeCurr? 'column' : 'row', alignContent: 'center', }}>
          <View style={{width: this.state.resizeCurr? '100%' : '40%', padding: 10, flex: 1, backgroundColor: 'rgb(49,90,158)', margin: 5}}>
            <TouchableOpacity onPress={this.resizeCurrency}>
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
              style={{margin: 10, borderRadius: 10, backgroundColor: 'rgb(255,255,255)' }} />
          </View>
        </View>
        
        
        <View style={{padding: 20, flex: 1, backgroundColor: 'rgb(49,90,158)', margin: 20}}>
            <TouchableOpacity onPress={this.resizeCat} style={{backgroundColor: 'rgba(49,90,158,0.5)'}}>
                <Text style={{color: 'rgb(255,255,255)', fontSize: 18, fontFamily: 'Avenir'}}>
                    {this.state.resizeCat? 'Select a category' : 
                        this.state.category!=='' ? 
                        'Category: '+this.state.category+' selected': 'Select a category'}
                </Text>
            </TouchableOpacity>
            {this.state.resizeCat && catButtonGrp}
 
        </View>
        
        <TextInput label='A little more about it maybe? (optional)' mode="outlined" multiline={true}
            onChangeText={text => this.setState({ note: text })}
            style={{margin: 20, borderRadius: 10, backgroundColor: 'rgb(255,255,255)' }} />
    
        <TouchableOpacity onPress={this.submitSpendInfo} style={modalStyles["create_btn"]}>
            <Text style={modalStyles["create_btn_text"]}>
                Add Expense
            </Text>
        </TouchableOpacity>

      </KeyboardAwareScrollView>
    </ScrollView>    
    </React.Fragment>
        )
    }
}


/**
 * LOCATIONDETAIL
 */
export default class LocationDetail extends Component {

    constructor(props) {
        super(props)
        this.state = { 
            selectOnDelete: {}, selectOnEdit: {},
            locDetails: props.navigation.getParam("location"),
            resize: false,
            modalVisible: false, modalDelete: false, modalEdit: false,
            imgView: styles.imgView, imgSize: styles.imgSmall,
        }
    }

    static navigationOptions =({navigation})=> {
        return {
            title: navigation.getParam('location').location,
            headerTintColor: '#fafafa',
            headerTitleStyle: {
                fontSize: 24, fontFamily: 'Avenir',
            },
            headerStyle: {
                backgroundColor: 'rgba(36,152,219,0.5)'
            }
        }
    }

    componentDidMount = () => {
        this._getLocDetails()
    }

    _getToken = async() => { return await AsyncStorage.getItem(tokenName) }

    _getLocDetails = () => {
        this._getToken().then(token=>{
            const locId = this.props.navigation.getParam('locId', null)
            if (!locId) {
                this.props.navigation.goBack()
            }
            fetch(serverURL+'/api/locations/'+locId,{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, },
            }).then(res=>{
                if (res.status===200) {
                  res.json().then(data=>{
                    this.setState({ locDetails: data })
                  })
                }
            }).catch(err=>{ console.log(err) })
        }).catch(error=>{
            console.log("get token error:",error)
        })
    }

    setModalVisible = (visible) => { this.setState({modalVisible: visible}) }


    setModal = (visible,modalType,selectOnType) => {
        this.setState({
            [modalType]: visible, [selectOnType]: {},
        })
    }

    setModalDelete = (visible) => { 
        this.setState({
            modalDelete: visible, selectOnDelete: {},
        }) 
    }

    setModalEdit = (visible) => { 
        this.setState({
            modalEdit: visible, selectOnEdit: {},
        }) 
    }

    resizeImg = () => {
        if (this.state.resize) {
            this.setState({
                imgView: styles.imgViewSmall,
                imgSize: styles.imgSmall,
                resize: false,
            })
        } else {
            this.setState({
                imgView: styles.imgView,
                imgSize: styles.img,
                resize: true,
            })
        }
    }

    addSpends = (spend) => {
        let spendings = this.state.locDetails.spendings
        spendings.push(spend)
        this.setState(prevState=>({ 
            ...prevState.locDetails, spendings 
        }))
    }

    _onDeleteSpending = (index) => {
        this.setState({
            selectOnDelete: this.state.locDetails.spendings[index], 
            modalDelete: true,
        })
    }

    _onEditSpending = (index) => {
        this.setState({
            selectOnEdit: this.state.locDetails.spendings[index], 
            modalEdit: true,
        })
    }

    _removeSpending = (data) => {
        let filteredSpendings = this.state.locDetails.spendings.filter(spend=>{
            return (spend.id!==data.id)
        })
        this.setState(prevState=>({
            locDetails: { ...prevState.locDetails, spendings: filteredSpendings, },
            modalDelete: false,
        }))
    }

    _editSpending = (data) => {
        let filteredSpendings = []
        this.state.locDetails.spendings.map(spend=>{
            let origSpend= spend
            if (spend.id===data.id) {
                origSpend.name= data.name 
                origSpend.date= data.date
                origSpend.amount= data.amount
                origSpend.currency= data.currency
                origSpend.category= data.category
                origSpend.note= data.note
            }
            return filteredSpendings.push(origSpend)
        })
        this.setState(prevState=>({
            locDetails: { ...prevState.locDetails, spendings: filteredSpendings, },
            modalEdit: false,
        }))
    }

    render() {

        let allSpendings = []
        if (this.state.locDetails.spendings) {
            this.state.locDetails.spendings.map((spend,index)=>{
                return allSpendings.push({key: index.toString(), spend: spend})
            })
        }

        return(
    <React.Fragment>
        <View >
            <MapContainer location={this.state.locDetails.location} 
                geocode={this.state.locDetails.geocode} />
        </View>
        
        <View style={{margin: 10, flexDirection: 'row', justifyContent: ''}}>
            <TouchableOpacity style={spendStyles.addNewBtn} onPress={()=>this.setModalVisible(true)}>
                <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 14 }}>
                    + Expenses
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={spendStyles.editBtn} >
                <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 14 }}>
                    Edit
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={spendStyles.deleteBtn} >
                <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 14 }}>
                    DELETE
                </Text>
            </TouchableOpacity>
        </View>

        <View style={{margin: 5}}>
        {this.state.locDetails.spendings!==undefined?
            <SpendingContainer spendings={this.state.locDetails.spendings} />:null}
        </View>

        <SwipeListView
            useFlatList
            data={allSpendings}
            renderItem={ (data, rowMap) => {
                let spend = data.item.spend
                return(
                <View style={styles.rowFront}>
                    
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir'}}>
                        {spend.name}
                      </Text>
                        <Text>{spend.currency+' '+spend.amount}</Text>
                        <Text>{spend.category}</Text>
                    </View>
                    <View style={{alignSelf: 'flex-end', flexDirection: 'column'}}>
                      <Text>Date: {spend.date}</Text> 
                    </View>
                </View >)
            }}
            renderHiddenItem={ (data, rowMap) => {
                let index = parseInt(data.item.key)
                return(
                <View style={styles.rowBack}>
                    <Button style={{borderRadius: 5 }} 
                        onPress={()=>this._onEditSpending(index)}>
                        <Text>Edit</Text>
                    </Button>
                    <Button style={{borderRadius: 5,  }} 
                        onPress={()=>this._onDeleteSpending(index)}>
                        <Text style={{color: 'rgb(255,0,0)'}}>Delete</Text>
                    </Button>
                </View>
            )}}
            leftOpenValue={80}
            rightOpenValue={-80}
        />

        <Modal animationType="slide" transparent={false} visible={this.state.modalVisible}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalVisible(false)
            }}>
            <NewSpendModal setModalVisible={this.setModalVisible} addSpends={this.addSpends} locId={this.state.locDetails.id} />
        </Modal>

        <Modal animationType="slide" transparent={false} visible={this.state.modalDelete}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalDelete(false)
            }}>
            <DeleteSpendModal selectOnDelete={this.state.selectOnDelete} 
                setModalDelete={this.setModalDelete}
                removeSpending={this._removeSpending} />
        </Modal>

        <Modal animationType="slide" transparent={false} visible={this.state.modalEdit}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModal(false,"modalEdit","selectOnEdit")
            }}>
            <EditSpendModal selectOnEdit={this.state.selectOnEdit} 
                setModalEdit={this.setModal}
                editSpending={this._editSpending} />
        </Modal>

    </React.Fragment>
        )
    }
}

/**
 * DELETESPEND MODAL
 */
class DeleteSpendModal extends Component {

    _cancelDelete = () => {
        this.props.setModalDelete(false);
    }

    _deleteSpending = () => {
        _getToken().then(token=>{
            etch(serverURL+'/api/spendings/delete/'+this.props.selectOnDelete.id,{
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, },
            }).then(res=>{
                res.json().then(data=>{
                    this.props.removeSpending(data)
                })
            })
        }) 
    }

    render() {
        return (
            <React.Fragment>
                <View style={modalStyles.modalHeader}>
                    <TouchableHighlight onPress={()=>this.props.setModalDelete(false)}>
                    <Text style={modalStyles.closeModalText}>
                        Close &times;
                    </Text>
                    </TouchableHighlight>
                    <Text style={modalStyles.newLocGreeting}>
                        {'Warning: Deleting\n'+this.props.selectOnDelete.name}
                    </Text>
                </View>
                <View >
                    <Text >
                        {'Are you sure you want to delete\n'+this.props.selectOnDelete.name}?
                    </Text>
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <Button onPress={this._cancelDelete} >
                            <Text>Cancel</Text>
                        </Button>
                        <Button onPress={this._deleteSpending} 
                            style={{backgroundColor: 'red', borderRadius: 10, }}>
                            <Text style={{color: 'white'}}>Delete</Text>
                        </Button>
                    </View>
                </View>

            </React.Fragment>
        )
    }
}
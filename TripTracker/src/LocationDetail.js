import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, StatusBar, 
    TouchableHighlight, Modal, Alert, TouchableOpacity, Dimensions, } from 'react-native';
import { Appbar, Button, TextInput, Card, Title, Paragraph  } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SwipeListView } from 'react-native-swipe-list-view';
import PureChart from 'react-native-pure-chart';

import { serverURL, tokenName, regexWhitespaceOnly, 
    Categories, CategoryPieChart, currencyInfo } from './config/envConst';

import EditSpendModal from './EditSpendModal';
import EditLocModal from './EditLocModal';
import NewSpendModal from './NewSpendModal';


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
        fontSize: 16, fontFamily: 'Avenir',
    },
    rowFront: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: 105,
        padding: 5,
		backgroundColor: 'rgb(255,255,255)',
		borderBottomColor: 'silver', borderBottomWidth: 1,
	},
	rowBack: {
        flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: 'transparent',
        paddingLeft: 5, paddingRight: 5,
        borderBottomColor: 'silver', borderBottomWidth: 1,
    },
})

const spendStyles = StyleSheet.create({
    addNewBtn: {
        marginTop: 10, marginLeft: 5, 
        borderRadius: 20, width: '36%', 
        backgroundColor: 'rgb(49,90,158)'
    },
    editBtn: {
        marginTop: 10, marginLeft: 5, 
        borderRadius: 20, width: '25%', 
        backgroundColor: 'rgb(49,90,158)'
    },
    deleteBtn: {
        marginTop: 10, marginLeft: 5, 
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

function padZero(num) { return (num>=0 && num<=9)? `0${num}`:`${num}`; }

function dateToString(selectedDate) {
    let date= new Date(selectedDate)
    return `${date.getFullYear()}-${padZero(date.getMonth()+1)}-${padZero(date.getDate())}`
}

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

    onRegionChange = (region) => { this.setState({ region }) }
    
    render() {
        console.log(this.props.geocode)
        console.log(this.state.region)
        return(
        <React.Fragment>
            <View style={modalStyles.modalHeader}>
                <TouchableHighlight onPress={()=>this.props.setModalMap(false,"modalMap","")}>
                    <Text style={modalStyles.closeModalText}>
                    Close &times;
                    </Text>
                </TouchableHighlight>
                <Text style={modalStyles.newLocGreeting}>
                    Map 
                </Text>
            </View>
            <ScrollView>
            <View style={{flex: 1, justifyContent: 'center'}}>
                <Text style={{margin: 10, color: 'rgb(49,90,158)', fontSize: 18, fontFamily: 'Avenir'}}>
                    {this.props.location}
                </Text>
                <MapView style={{margin: 15, height: 400}} 
                    initialRegion={this.state.region} >
                    <Marker
                        coordinate={this.state.region}
                        title={this.props.location} />
                </MapView>
            </View>
            </ScrollView>
        </React.Fragment>
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
                <Text style={styles.spendInfo}>{`${this.props.spendings.length} expenses`}</Text> :
                <Text style={styles.spendInfo}>{`${this.props.spendings.length} expense`}</Text> :
            <Text style={styles.spendInfo}>You don't have any expense at this location yet</Text>
        
        return(
        <React.Fragment>
            {numSpends}
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
        /*
        this.focusListener = this.props.navigation.addListener('didFocus',payload => {
            //console.debug('didFocus');
            this._getLocDetails()
        })
        //*/
        this.state = { 
            typeFlatList: true, 
            selectOnDelete: {}, selectOnEdit: {},
            locDetails: props.navigation.getParam("locDetails"),
            resize: false, showChart: false,
            modalVisible: false, modalDelete: false, modalEdit: false,
            modalEditLoc: false, 
            modalChart: false, modalMap: false, 
            imgView: styles.imgView, imgSize: styles.imgSmall,
        }
    }

    static navigationOptions =({navigation})=> {
        return {
            title: navigation.getParam('locDetails').location,
            headerTintColor: '#fafafa',
            headerTitleStyle: {
                fontSize: 24, fontFamily: 'Avenir',
            },
            headerStyle: {
                backgroundColor: 'rgba(36,152,219,0.5)'
            }
        }
    }

    componentDidMount = () => { this._getLocDetails() }

    //componentWillUnmount = () => { this.focusListener.remove() }

    _getLocDetails = () => {
        _getToken().then(token=>{
            const locId = this.props.navigation.getParam('locId', null)
            if (!locId) {
                this.props.navigation.goBack()
            }
            console.log("loc details= ")
            fetch(serverURL+'/api/locations/'+locId,{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, },
            }).then(res=>{
                if (res.status===200) {
                  res.json().then(data=>{
                    this.setState({ locDetails: data })
                    console.log("done getting loc details")
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

    closeRow = (rowMap, rowKey) => {
		if (rowMap[rowKey]) { rowMap[rowKey].closeRow() }
    }


    _onDeleteSpending = (index,rowMap) => {
        this.setState({
            selectOnDelete: this.state.locDetails.spendings[index], 
            modalDelete: true,
        })
        this.closeRow(rowMap,index)
    }

    _onEditSpending = (index,rowMap) => {
        this.setState({
            selectOnEdit: this.state.locDetails.spendings[index], 
            modalEdit: true,
        })
        this.closeRow(rowMap,index)
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

    _onEditLoc = () => {
        this.setState({
            selectOnEdit: this.state.locDetails, 
            modalEditLoc: true,
        })
    }

    _editLoc = (data) => {
        let locDetails = this.state.locDetails
        locDetails.location= data.location
        locDetails.geocode= data.geocode
        locDetails.formatAddress= data.formatAddress
        locDetails.startDate= data.startDate
        locDetails.endDate= data.endDate
        //console.log(locDetails)
        this.setState({
            locDetails,
            modalEditLoc: false, 
        })
        //console.log(this.props.navigation)
        this.props.navigation.setParams({ locDetails })
    }

    toggleView = () => { this.setState({typeFlatList: !this.state.typeFlatList}) }


    render() {
        let spendingCat= {}
        catLabels.map(cat=>{ spendingCat[cat]= [] })
        // convert spendings as FlatList
        let allSpendings = [] 
        if (this.state.locDetails.spendings) {
            this.state.locDetails.spendings.map((spend,index)=>{
                spendingCat[spend.category].push({
                    'key': spendingCat[spend.category].length+1,'data':spend
                })
                allSpendings.push({key: index.toString(), spend: spend})
            })
        }
        console.log(spendingCat)
        // convert object to SectionList
        let sectionSpendings= []
        for (let key in spendingCat) {
            sectionSpendings.push({'title': key, 'data': spendingCat[key]})
        }
        //console.log(sectionSpendings)
        return(
    <React.Fragment>
        
            <View style={{marginLeft: 15, marginRight: 15, marginTop: 15, marginBottom: 10}}>
                <Text style={{fontSize: 18, fontFamily: 'Avenir', color: 'rgb(49,90,158)'}}>
                    {this.state.locDetails.location}
                </Text>
            </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            {allSpendings.length>0 && 
                <TouchableOpacity style={{ margin: 10, borderRadius: 10}}
                    onPress={()=>{this.setState({modalChart: true})}}>
                    <Text style={{
                        textAlign: 'center', padding: 10, color: 'rgb(36,152,219)', 
                        fontSize: 18, fontFamily: 'Avenir', 
                    }}>
                        Expense Graph
                    </Text>
                </TouchableOpacity>}

            <TouchableOpacity style={{backgroundColor: '', margin: 10, borderRadius: 10}}
                onPress={()=>{this.setState({modalMap: true})}}>
                <Text style={{
                    textAlign: 'center', padding: 10, color: 'rgb(36,152,219)', 
                    fontSize: 18, fontFamily: 'Avenir', 
                }}>
                    Open Map
                </Text>
            </TouchableOpacity>
            
        </View>
        
        <View style={{flexDirection: 'row', alignContent: 'flex-end'}}>
            {/* <TouchableOpacity style={spendStyles.deleteBtn} onPress={this.toggleView}>
                <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 14 }}>
                    Change to {!this.state.typeFlatList ? 'Normal View' : 'Category View'}
                </Text>
            </TouchableOpacity> */}
            
            {/* <TouchableOpacity style={{backgroundColor: 'rgb(36,152,219)', margin: 5, borderRadius: 10}}
                onPress={this.toggleView}>
                <Text style={{
                    textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', 
                    fontSize: 16, fontFamily: 'Avenir', 
                }}>
                    {!this.state.typeFlatList ? 'Normal View' : 'Category View'}
                </Text>
            </TouchableOpacity> */}

            {/* <TouchableOpacity style={spendStyles.editBtn} onPress={()=>this._onEditLoc()}>
                <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 14 }}>
                    Edit
                </Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={{backgroundColor: 'rgb(36,152,219)', margin: 5, borderRadius: 10}}
                onPress={()=>this._onEditLoc()}>
                <Text style={{
                    textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', 
                    fontSize: 16, fontFamily: 'Avenir', 
                }}>
                    Edit Location
                </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={spendStyles.addNewBtn} onPress={()=>this.setModalVisible(true)}>
                <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 14 }}>
                    + Expenses
                </Text>
            </TouchableOpacity> */}
            <TouchableOpacity //style={locStyles.addNewBtn} 
                style={{backgroundColor: 'rgb(49,90,158)', margin: 5, borderRadius: 20}}
                onPress={()=>this.setModalVisible(true)}>
                    <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', 
                        fontSize: 16, fontFamily: 'Avenir',
                    }}>
                        + Expense
                    </Text>
              </TouchableOpacity>
        </View>

        <View style={{margin: 5}}>
          {this.state.locDetails.spendings!==undefined?
            <SpendingContainer spendings={this.state.locDetails.spendings} />:null}
        </View>

        {!this.state.typeFlatList && 
        <SwipeListView
            useSectionList sections={sectionSpendings}
            friction={5} tension={10}
            disableRightSwipe={true}
            disableLefttSwipe={true}
            renderItem={ (data, rowMap) => {
                let spend = data.item.data
                return(
                <View style={styles.rowFront}>
                    
                  {/* <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <View style={{flex: 1, flexDirection: 'column'}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir'}}>
                        {spend.name}
                      </Text>
                      <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                        <Text>on {spend.date.split('-').join('/')}</Text>
                      </View>
                    </View>
                    <View style={{alignSelf: 'flex-end', flexDirection: 'column'}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir'}}>
                        {spend.currency+' '+spend.amount}
                      </Text>
                    </View>
                  </View> */}
                  <View style={{flexDirection: 'column'}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir', paddingLeft: 10, paddingRight: 10}}>
                        {spend.name}
                      </Text>
                      <Text style={{color: 'rgb(49,90,158)', fontSize: 14, fontFamily: 'Avenir', paddingLeft: 10, paddingRight: 10}}>
                        on {spend.date.split('-').join('/')}
                      </Text>
                    </View>
                    <View style={{position: 'absolute', right: 5}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir'}}>
                        {spend.currency+' '+spend.amount}
                      </Text>
                    </View>
                    
                </View >)
            }}
            renderHiddenItem={ (data, rowMap) => {
                //console.log(data)
                let index = parseInt(data.index)
                console.log(index)
                return(
                <View style={styles.rowBack}>
                    {/* <Button style={{borderRadius: 5 }} 
                        onPress={()=>this._onEditSpending(index)}>
                        <Text>Edit</Text>
                    </Button>
                    <Button style={{borderRadius: 5,  }} 
                        onPress={()=>this._onDeleteSpending(index)}>
                        <Text style={{color: 'rgb(255,0,0)'}}>Delete</Text>
                    </Button> */}
                    <TouchableOpacity style={{borderRadius: 5, }} onPress={()=>this._onEditSpending(index,rowMap)}>
                        <View style={{flexDirection: 'column', marginLeft: 10}}>
                            <Text style={{color: 'rgb(49,90,158)', margin: 5, fontSize: 16, fontFamily: 'Avenir', textAlign: 'center'}}> 
                                Edit
                            </Text>
                            <Text style={{color: 'rgb(49,90,158)', margin: 5, fontSize: 16, fontFamily: 'Avenir', textAlign: 'center'}}> 
                                Expense
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{borderRadius: 5, backgroundColor: 'red',padding: 5, marginRight: 5}} 
                        onPress={()=>this._onDeleteSpending(index,rowMap)}>
                        <View style={{flexDirection: 'column', }}>
                            <Text style={{color: 'rgb(255,255,255)', margin: 5, fontSize: 16, fontFamily: 'Avenir'}}> 
                                DELETE
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>)
            }}
            renderSectionHeader={({section}) => <Text>{section.title}</Text>}
            leftOpenValue={80}
            rightOpenValue={-80}
        />}

        {this.state.typeFlatList &&
        <SwipeListView
            useFlatList data={allSpendings}
            friction={5} tension={10}
            renderItem={ (data, rowMap) => {
                let spend = data.item.spend
                return(
                <View style={styles.rowFront}>
                    
                    <View style={{flexDirection: 'column'}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir', paddingLeft: 10, paddingRight: 10}}>
                        {spend.name}
                      </Text>
                      <Text style={{color: 'rgb(49,90,158)', fontSize: 14, fontFamily: 'Avenir', paddingLeft: 10, paddingRight: 10}}>
                        on {spend.date.split('-').join('/')}
                      </Text>
                      <Text style={{color: 'rgb(49,90,158)', fontSize: 14, fontFamily: 'Avenir', paddingLeft: 10, paddingRight: 10}}>
                        {spend.category}
                      </Text>
                    </View>
                    <View style={{position: 'absolute', right: 5}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir'}}>
                        {spend.currency+' '+spend.amount}
                      </Text>
                    </View>
                    
                </View >)
            }}
            renderHiddenItem={ (data, rowMap) => {
                let index = parseInt(data.item.key)
                return(
                <View style={styles.rowBack}>
                    {/* <Button style={{borderRadius: 5 }} 
                        onPress={()=>this._onEditSpending(index,rowMap)}>
                        <Text>Edit</Text>
                    </Button>
                    <Button style={{borderRadius: 5,  }} 
                        onPress={()=>this._onDeleteSpending(index,rowMap)}>
                        <Text style={{color: 'rgb(255,0,0)'}}>Delete</Text>
                    </Button> */}
                    <TouchableOpacity style={{borderRadius: 5, }} onPress={()=>this._onEditSpending(index,rowMap)}>
                        <View style={{flexDirection: 'column', marginLeft: 10}}>
                            <Text style={{color: 'rgb(49,90,158)', margin: 5, fontSize: 16, fontFamily: 'Avenir', textAlign: 'center'}}> 
                                Edit
                            </Text>
                            <Text style={{color: 'rgb(49,90,158)', margin: 5, fontSize: 16, fontFamily: 'Avenir', textAlign: 'center'}}> 
                                Expense
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{borderRadius: 5, backgroundColor: 'red',padding: 5, marginRight: 5}} 
                        onPress={()=>this._onDeleteSpending(index,rowMap)}>
                        <View style={{flexDirection: 'column', }}>
                            <Text style={{color: 'rgb(255,255,255)', margin: 5, fontSize: 16, fontFamily: 'Avenir'}}> 
                                DELETE
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}}
            leftOpenValue={100}
            rightOpenValue={-100}
        />}

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

        <Modal animationType="slide" transparent={false} visible={this.state.modalEditLoc}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModal(false,"modalEditLoc","")
            }}>
            <EditLocModal selectOnEdit={this.state.selectOnEdit} 
                setModalEdit={this.setModal}
                editLoc={this._editLoc} />
        </Modal>

        <Modal animationType="slide" transparent={false} visible={this.state.modalChart}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModal(false,"modalChart","")
            }}>
            <PieChartModal spendingCat={spendingCat} setModalChart={this.setModal} />
        </Modal>

        <Modal animationType="slide" transparent={false} visible={this.state.modalMap}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModal(false,"modalMap","")
            }}>
            <MapContainer location={this.state.locDetails.location} 
                geocode={this.state.locDetails.geocode} 
                setModalMap={this.setModal}/>
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
            fetch(serverURL+'/api/spendings/delete/'+this.props.selectOnDelete.id,{
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
            /*
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
            //*/

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

                <Text style={{fontSize: 24, textAlign: 'center', fontFamily: 'Avenir', color: 'rgb(49,90,158)'}}>
                    {'Are you sure you want to delete\n'+this.props.selectOnDelete.name}?
                </Text>

                <View style={{flex: 1, justifyContent: 'center'}}>
                    
                    <View style={{flexDirection: 'row', justifyContent: 'center' }}>
                        <Button onPress={this._cancelDelete} 
                            style={{marginLeft: 10, marginRight: 10, borderColor: 'silver', borderWidth: 1, borderRadius: 10}}
                        >
                            <Text>Cancel</Text>
                        </Button>
                        <Button 
                            onPress={this._deleteSpending} 
                            style={{backgroundColor: 'red', borderRadius: 10, marginLeft: 10, marginRight: 10 }}>
                            <Text style={{color: 'white'}}>DELETE</Text>
                        </Button>
                    </View>
                </View>

            </React.Fragment>
        )
    }
}



class PieChartModal extends Component {
    render() {
        let sampleData = [], sampleData2= []
        CategoryPieChart.map(catOpt=>{
            let catArr = this.props.spendingCat[catOpt.label]
            let val = 0.0
            catArr.map(spend=>{ 
                console.log(spend.data)
                val+= spend.data.amount 
            })

            sampleData.push({
                'value': val, 'label': catOpt.label, 'color': catOpt.color
            })
            sampleData2.push({
                'y': val, 'x': catOpt.label, 
            })
            
        })
        
        //console.log(sampleData)
        
        let spends = sampleData.filter(spend=>{
            return spend.value>0.0
        })

        let spendInfo = []
        spends.map((spend,index)=>{
            console.log(spend)
            return spendInfo.push(
            <View style={{flexDirection: 'row', alignContent: 'center', paddingBottom: 5, paddingTop: 5}} key={index}>
                <View style={{
                    backgroundColor: spend.color, 
                    borderRadius: '50%', height: 25, width: 25, marginRight: 10}} 
                />
                <Text style={{color: 'rgb(49,90,158)', fontFamily: 'Avenir', fontSize: 20, marginLeft: 10}}>
                    {spend.label+': $'+spend.value }
                </Text>
            </View>
            )
        })

        return (
        <React.Fragment>
            
            <View style={modalStyles.modalHeader}>
                <TouchableHighlight onPress={()=>this.props.setModalChart(false,"modalChart","")}>
                    <Text style={modalStyles.closeModalText}>
                    Close &times;
                    </Text>
                </TouchableHighlight>
                <Text style={modalStyles.newLocGreeting}>
                    Expense Summary
                </Text>
            </View>
            
            <View style={{justifyContent: 'center', alignSelf: 'center'}}>
                <PureChart data={sampleData} type='pie' />
            </View>
            
            <View style={{flex: 1, justifyContent: 'center', alignSelf: 'center', marginTop: 20}}>
                <ScrollView>
                    {spendInfo}
                </ScrollView>
            </View>

        </React.Fragment>
        )
    }
}
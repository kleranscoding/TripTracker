
const index = 0+1

const urls = [
    "http://10.1.6.227:8001",
    "http://10.0.0.152:8001",
    "http://192.168.1.147:8001",
    "http://192.168.1.144:8001",
    "http://localhost:8001",
    "http://10.0.0.159:8001",
]

export const pwdLen = 6
export const imgHgtWdt = 75
export const tokenName = "TripTrackerToken"

export const regexWhitespace = /\s/g
export const regexWhitespaceOnly = /^\s+$/
export const regexUsername = /[a-zA-Z0-9]{2,}/i
export const regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const serverURL = urls[index]

export const errorMsg = {
    emptyUsername: '* at least 2 alphanumeric characters',
    emptyEmail: '* please enter a valid email address',
    emptyPwd: '* at least 6 characters',
    whiteSpace: '* cannot contain space',
    pwdNotMatched: 'passwords do no match',
    existsEmail: 'email exists'
}

export const currencyInfo = require('./currency.json')

export const Categories = [
    {
        "label": "Accommadtions",
        "icon": "hotel",
    },
    {
        "label": "Transportation",
        "icon": "train",
    },
    {
        "label": "Shopping",
        "icon": "store",
    },
    {
        "label": "Food",
        "icon": "restaurant",
    },
    {
        "label": "Tickets",
        "icon": "receipt",
    }, 
    {
        "label": "Misc.",
        "icon": "receipt",
    },
]

import CryptoJS from "crypto-js";
const secretKey = 'bc665a1f223dba15f5fbf5df08838647';
const iv_secretKey = 'bc66-f223-dba1-8647-2345-fd45-dfg3';
export const API_URL = "http://localhost:5000";
export const CKADITOR_UPLOAD_URL = "http://localhost:5000/ckeditor";
export const API_STORAGE_URL = "http://localhost:5000/uploads";
export const WEBSITE_URL = "http://localhost:3000";
export const WEBSITE_PUBLIC = "";
export const WEBSITE_BASE_URL = "/";
export const WS_URL = "ws://127.0.0.1:8000";
export const new_client =1000;
export const client_disconnected =2000;
export const new_message_receive =3000;
export const receive_binary_data = 4000;
export const new_friend_request =1;
export const cencel_friend_request =2;
export const accept_friend_request =3;
export const reject_friend_request = 4;
export const remove_friend = 5;
export const USER_DETAILS = () => {
    if (!window.sessionStorage.getItem("buserinfo")) {
        return false;
    } else {
        return JSON.parse(window.sessionStorage.getItem("buserinfo"));

    }
}

export const PATHNAME = () => {
    return window.location.pathname;
}

export const SET_LOCAL = (name, data) => {
    if (name == "") {
        return false;
    }
    window.localStorage.setItem(name, data);
    return true;
}
export const GET_LOCAL = (name) => {
    if (name == "") {
        return false;
    }
    return window.localStorage.getItem(name);
}
export const REMOVE_LOCAL = (name) => {
    if (name == "") {
        return false;
    }
     window.localStorage.removeItem(name);
        return true;
}
export const REMOVE_ALL_LOCAL = () => {
    window.localStorage.clear();
    return true;
}
export const SET_SESSION = (name, data) => {
    if (name == "") {
        return false;
    }
    window.sessionStorage.setItem(name, data);
    return true;
}
export const REMOVE_SESSION = (name) => {
    if (name == "") {
        return false;
    }
    window.sessionStorage.removeItem(name);
    return true;
}
export const USER_LOGOUT =  () => {
   window.sessionStorage.removeItem("buserinfo");
   return true; 
}

export const encrypt = (data) => {
    const key_ = CryptoJS.enc.Utf8.parse(secretKey);
    const iv_ = CryptoJS.enc.Utf8.parse(iv_secretKey);
    const encrypted = CryptoJS.AES.encrypt(data,
        key_, {
        iv: iv_,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

export const decrypt = (encryptedData) => {
    const key_ = CryptoJS.enc.Utf8.parse(secretKey);
    const iv_ = CryptoJS.enc.Utf8.parse(iv_secretKey);
    const decrypted = CryptoJS.AES.decrypt(encryptedData,
        key_, {
        iv: iv_,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

export const Truncatetext = ({text='',maxLength=10}) => {
        const str = String(text);
        const max = Number(maxLength) || 100;
        if (str.length <= max) return <p>{str}</p>;
        return str.slice(0, max) + '...';
    }
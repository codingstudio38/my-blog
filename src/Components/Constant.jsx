import CryptoJS from "crypto-js";
const secretKey = 'bc665a1f223dba15f5fbf5df08838647';
const iv_secretKey = 'bc66-f223-dba1-8647-2345-fd45-dfg3';
export const API_URL = "http://10.115.8.53:5000";
export const CKADITOR_UPLOAD_URL = "http://10.115.8.53:5000/ckeditor";
export const API_STORAGE_URL = "http://10.115.8.53:5000/uploads";
export const WEBSITE_URL = "http://localhost:3000";
// set HOST=localhost && set PORT=3000 && npm start
export const WEBSITE_PUBLIC = "http://localhost:3000";
export const WEBSITE_BASE_URL = "/";
export const WS_URL = "ws://10.115.8.53:8000";
export const new_client = 1000;
export const client_disconnected = 2000;
export const new_message_receive = 3000;
export const receive_binary_data = 4000;
export const user_is_typing = 5000;
export const new_friend_request = 1;
export const cancel_friend_request = 2;
export const accept_friend_request = 3;
export const reject_friend_request = 4;
export const remove_friend = 5;
export const blog_post_status = 6;
export const new_chat_message = 200;
export const new_comment = 7;
export const new_like = 8;
export const new_share = 9;

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
export const USER_LOGOUT = () => {
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

export const Truncatetext = ({ text = '', maxLength = 10 }) => {
    const str = String(text);
    const max = Number(maxLength) || 100;
    if (str.length <= max) return str;
    return str.slice(0, max) + '...';
}
var auto_reload_friendlist = [];
export const subscribe_auto_reload_friendlist = (callback) => {
  auto_reload_friendlist.push(callback);
  return () => {
    auto_reload_friendlist = auto_reload_friendlist.filter((fn) => fn !== callback);
  };
};
export const call_auto_reload_friendlist = () => {
  auto_reload_friendlist.forEach((cb) => cb())
  return true;
};

var auto_read_notifications = [];
export const subscribe_auto_read_notificationsFn = (callback) => {
  auto_read_notifications.push(callback);
  return () => {
    auto_read_notifications = auto_read_notifications.filter((fn) => fn !== callback);
  };
};
export const call_auto_read_notificationsFn = (data) => {
  auto_read_notifications.forEach((cb) => cb(data))
  return true;
};

var auto_read_notificationsForn = [];
export const subscribe_auto_read_notificationsFnHeader = (callback) => {
  auto_read_notificationsForn.push(callback);
  return () => {
    auto_read_notificationsForn = auto_read_notificationsForn.filter((fn) => fn !== callback);
  };
};
export const call_auto_read_notificationsFnHeader = (data) => {
  auto_read_notificationsForn.forEach((cb) => cb(data))
  return true;
};

var auto_refresh_notifications = [];
export const subscribe_auto_refresh_notifications = (callback) => {
  auto_refresh_notifications.push(callback);
  return () => {
    auto_read_notificationsForn = auto_read_notificationsForn.filter((fn) => fn !== callback);
  };
};
export const call_auto_refresh_notifications = () => {
  auto_refresh_notifications.forEach((cb) => cb())
  return true;
};

var myusers = [];
export const subscribe_FindUserById = (alluser) => {
  myusers = alluser;
  return true;
};
export const call_FindUserById = (id) => {
  return myusers.filter((user)=>{
        return user._id==id;
    })
};
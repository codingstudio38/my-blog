import swal from 'sweetalert';
import { WEBSITE_URL,USER_LOGOUT } from './../Components/Constant';
import Websocket from "./../Services/WebSocketService";
export async function Post_Without_Htoken(myform, url, headers) {
  // return new Promise((resolve, reject) => {
  //     try {
  //         const response = fetch(url, {
  //             method: 'POST',
  //             headers: headers,
  //             body: myform,
  //         });
  //         resolve(response);
  //     } catch (error) {
  //         reject(error);
  //     }
  // })
  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: myform,
  });
  //// if (!response.ok) {}
  let res = "";
  switch (response.status) {
    case 200:
      res = response;
      break;
    case 500:
      swal({
        title: `500:- ${response.statusText}`,
        icon: "error",
      })
      break;
    case 400:
      swal({
        title: `400:- ${response.statusText}`,
        icon: "error",
      })
      break;
    case 401:
      swal({
        title: `401:- ${response.statusText}`,
        icon: "error",
      })
      break;
    case 404:
      swal({
        title: `404:- ${response.statusText}`,
        icon: "error",
      })
      break;
    default:
      swal({
        title: `Unknow error:- ${response.statusText}`,
        icon: "error",
      })
      break;
  }
  return res;
}


export async function Post_With_Htoken(myform, url, headers) {
  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: myform,
  });
  let res = "";
  switch (response.status) {
    case 200:
      res = response;
      break;
    case 500:
      swal({
        title: `500:- ${response.statusText}`,
        icon: "error",
      })
      break;
    case 400:
      swal({
        title: `400:- ${response.statusText}`,
        icon: "error",
      })
      break;
    case 401:
      USER_LOGOUT()
      swal({
        title: `401:- Unauthorized. ${response.statusText}!`,
        icon: "error",
      })
      Websocket.disconnect();
      window.location.href=WEBSITE_URL;
      break;
    case 404:
      swal({
        title: `404:- ${response.statusText}`,
        icon: "error",
      })
      break;
    default:
      swal({
        title: `Unknow error:- ${response.statusText}`,
        icon: "error",
      })
      break;
  }
  return res;
}

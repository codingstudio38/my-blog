import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WEBSITE_BASE_URL } from './Components/Constant';
import Login from './Components/Login';
import Createblog from './Components/Createblog';
import Register from './Components/Register';
import Page404 from './Components/Page404';
import Protected from './Components/Protected';
import Home from './Components/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Adminindex from './Components/Index';
import Profile from './Components/Profile';
import Editprofile from './Components/Editprofile';
import Websocket from './Services/WebSocketService';
import React, { useEffect} from 'react';
import {  USER_DETAILS } from './Components/Constant'
import Findfriends from './Components/Findfriends'
function App() {
  const LOGIN_USER = USER_DETAILS()
   useEffect(() => {
    if (LOGIN_USER !== false) {
            // Websocket.connect();
        }
  }, []);
  return (
    <div>
      <BrowserRouter basename={`${WEBSITE_BASE_URL}`}>
        <Routes>
          <Route index path='' element={<Login />} />
          <Route path='register' element={<Register />} />
          <Route path='/web' element={<Protected Component={Adminindex} />}>
            <Route path='home' element={<Protected Component={Home} />} />
            <Route path='create-blog' element={<Protected Component={Createblog} />} />
            <Route path='my-profile' element={<Protected Component={Profile} />} />
            <Route path='edit-profile' element={<Protected Component={Editprofile} />} />
            <Route path='find-friends' element={<Protected Component={Findfriends} />} />
          </Route>
          <Route path='*' element={<Page404 />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

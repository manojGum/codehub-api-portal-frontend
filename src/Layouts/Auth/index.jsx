import React from 'react'
import Signin from '../../Pages/SignIn/Signin';
import { Routes, Route } from 'react-router-dom';
import SignUp from '../../Pages/SignIn/SignUp';
const Auth = () => {
  return (
    <div>
        <Routes>
          <Route path='/' element={<SignUp />} />  
          <Route path='/sign-in/*' element={<Signin />}/>
        </Routes>
    </div>
  )
}

export default Auth
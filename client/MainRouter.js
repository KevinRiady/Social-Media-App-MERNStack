import React, {Component} from 'react'
import {Route, Switch} from 'react-router-dom'
import Home from './core/Home'
import Users from './user/Users'
import Signup from './user/Signup'
import Signin from './auth/Signin'
import EditProfile from './user/EditProfile'
import Profile from './user/Profile'
import PrivateRoute from './auth/PrivateRoute'
import Menu from './core/Menu'

const MainRouter = () => {
    return ( 
      <div>
        <Menu>
        <Switch>
          <Route exact path="/" component = {Home}/>
          <Route path="/users" component={Users}/>
          <Route path="/signup" component={Signup}/>
          <Route path="/signin" component={Signin}/>
          <PrivateRoute path="/user/edit/:userId" component={EditProfile}/>
          <Route path="/user/:userId" component={Profile}/>
        </Switch>
        </Menu>
      </div>
    )
  }

export default MainRouter

// As we develop more view components, we will update
// the MainRouter and add routes for the new components
// inside the Switch component.

// The switch component helps us to render the first child that 
// matches the request route path.
// Without it, a request at '/' also matches a route at '/contact'
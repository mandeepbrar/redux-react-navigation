import React from 'react';
import {combineReducers} from 'redux';
import {Provider} from 'react-redux'
import { connect } from 'react-redux';
import { StackNavigator, addNavigationHelpers } from 'react-navigation';


class NavigationManager {
  constructor(props) {
    console.log("navigation manager constructor")
    this.props = props
    this.processRoutes = this.processRoutes.bind(this);
    this.getComponent = this.getComponent.bind(this);
    this.getNavigator = this.getNavigator.bind(this);
    this.getRoute = this.getRoute.bind(this);
    this.getRouteStore = this.getRouteStore.bind(this);
    this.getReducer = this.getReducer.bind(this);
    this.connect = this.connect.bind(this)
    this.processRoutes();
    this.navigator = StackNavigator(this.reactNavigationRoutes)
    this.initialState = {
      routeName: this.props.defaultRoute,
      data:{},
      params: {},
      navState: this.navigator.router.getStateForAction(this.navigator.router.getActionForPathAndParams(this.props.defaultRoute)),
      routeStore: this.getRouteStore(this.props.defaultRoute, null)
    };
  }
  connect(store) {
    this.store = store
  }
  getComponent(routeName, route) {
    return class extends React.Component {
      render() {
        return route.component(route, this.props)
      }
    }
  }
  getNavigator() {
    return <NavigationRendererWithState navigator={this.navigator}/>
  }
  redirect(routeName, context) {
  //  this.director.setRoute(routeName);
  }
  getReducer(){
    let manager = this;
    return (state = manager.initialState, action) => {
      console.log("action **********", action, state)
      switch (action.type) {
        case 'Navigation/NAVIGATE':
            const nextState = {
              routeName: action.routeName,
              data:{},
              params: action.params,
              navState: manager.navigator.router.getStateForAction(manager.navigator.router.getActionForPathAndParams(action.routeName))
            };
            nextState.routeStore = manager.getRouteStore(action.routeName, action);
            return nextState;
        default:
          let routeStore = manager.getRouteStore(state.routeStore, action)
          if(routeStore == state.routeStore) {
            return state
          } else {
            return Object.assign({}, state, {
              routeStore: routeStore
            })
          }
      }
      return state
    };
  }
  getRoute(routeName) {
    if (this.props.routes) {
      return this.props.routes[routeName];
    }
    return null;
  }
  processRoutes() {
    let routeNames = Object.keys(this.props.routes);
    this.reactNavigationRoutes = {}
    for (var index in routeNames) {
      let routeName = routeNames[index];
      let route = this.props.routes[routeName];
      let screen = this.getComponent(routeName, route)
      this.reactNavigationRoutes[routeName] = {screen: screen}
    }
  }

  //change redux state as per route reducers
  getRouteStore(routeName, action) {
    let route = this.getRoute(routeName);
    if(route) {
      if(route.reducer) {
        this.routeStoreReducer = route.reducer
      } else if(route.reducers && Object.keys(route.reducers).length >0) {
        this.routeStoreReducer = combineReducers(route.reducers)
      }
      if(this.routeStoreReducer) {
        console.log("route store reducer working =============", action)
        return this.routeStoreReducer({}, action)
      }
    }
    return {};
  }
}

class NavigationRenderer extends React.Component {
  render() {
    const AppNavigator = this.props.navigator
    return (
          <AppNavigator navigation={addNavigationHelpers({
            dispatch: this.props.dispatch,
            state: this.props.navState
          })} />
        );
  }
}


const mapStateToProps = (state, props) => {
  console.log("mapping state ", state, props)
  return {
    navState: state.router.navState,
    navigator: props.navigator
  }
}

const NavigationRendererWithState = connect(mapStateToProps)(NavigationRenderer);

export default NavigationManager;

import React from 'react';
import {combineReducers} from 'redux';
import {Provider} from 'react-redux'
import { connect } from 'react-redux';
import { TabNavigator, DrawerNavigator, StackNavigator, addNavigationHelpers } from 'react-navigation';


class NavigationManager {
  constructor(props) {
    this.props = props
    this.processRoutes = this.processRoutes.bind(this);
    this.getComponent = this.getComponent.bind(this);
    this.getNavigator = this.getNavigator.bind(this);
    this.getRoute = this.getRoute.bind(this);
    this.getRouteStore = this.getRouteStore.bind(this);
    this.getReducer = this.getReducer.bind(this);
    this.connect = this.connect.bind(this)
    this.processRoutes();
    switch (props.type) {
        case 'drawer':
          this.navigator = DrawerNavigator(this.reactNavigationRoutes, props.config)
        break;
        case 'tab':
          this.navigator = TabNavigator(this.reactNavigationRoutes, props.config)
        break;
        default:
          this.navigator = StackNavigator(this.reactNavigationRoutes, props.config)
    }

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
    return route.component(route)
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
          let routeStore = manager.getRouteStore(state.routeName, action, state.routeStore)
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
  getRouteStore(routeName, action, state={}) {
    let route = this.getRoute(routeName);
    if(route) {
      if(route.reducer) {
        this.routeStoreReducer = route.reducer
      } else if(route.reducers && Object.keys(route.reducers).length >0) {
        this.routeStoreReducer = combineReducers(route.reducers)
      }
      if(this.routeStoreReducer) {
        return this.routeStoreReducer(state, action)
      }
    }
    return state;
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
  return {
    navState: state.router.navState,
    navigator: props.navigator
  }
}

const NavigationRendererWithState = connect(mapStateToProps)(NavigationRenderer);

export default NavigationManager;

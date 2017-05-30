'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _reactNavigation = require('react-navigation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NavigationManager = function () {
  function NavigationManager(props) {
    _classCallCheck(this, NavigationManager);

    this.props = props;
    this.processRoutes = this.processRoutes.bind(this);
    this.getComponent = this.getComponent.bind(this);
    this.getNavigator = this.getNavigator.bind(this);
    this.getRoute = this.getRoute.bind(this);
    this.getRouteStore = this.getRouteStore.bind(this);
    this.getReducer = this.getReducer.bind(this);
    this.connect = this.connect.bind(this);
    this.processRoutes();
    switch (props.navigatorType) {
      case 'drawer':
        this.navigator = (0, _reactNavigation.DrawerNavigator)(this.reactNavigationRoutes, props.navigatorConfig);
        break;
      case 'tab':
        this.navigator = (0, _reactNavigation.TabNavigator)(this.reactNavigationRoutes, props.navigatorConfig);
        break;
      default:
        this.navigator = (0, _reactNavigation.StackNavigator)(this.reactNavigationRoutes, props.navigatorConfig);
    }

    this.initialState = {
      routeName: this.props.defaultRoute,
      data: {},
      params: {},
      navState: this.navigator.router.getStateForAction(this.navigator.router.getActionForPathAndParams(this.props.defaultRoute)),
      routeStore: this.getRouteStore(this.props.defaultRoute, null)
    };
  }

  _createClass(NavigationManager, [{
    key: 'connect',
    value: function connect(store) {
      this.store = store;
    }
  }, {
    key: 'getComponent',
    value: function getComponent(routeName, route) {
      return function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class() {
          _classCallCheck(this, _class);

          return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
          key: 'render',
          value: function render() {
            return route.component(route, this.props);
          }
        }]);

        return _class;
      }(_react2.default.Component);
    }
  }, {
    key: 'getNavigator',
    value: function getNavigator() {
      return _react2.default.createElement(NavigationRendererWithState, { navigator: this.navigator });
    }
  }, {
    key: 'redirect',
    value: function redirect(routeName, context) {
      //  this.director.setRoute(routeName);
    }
  }, {
    key: 'getReducer',
    value: function getReducer() {
      var manager = this;
      return function () {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : manager.initialState;
        var action = arguments[1];

        switch (action.type) {
          case 'Navigation/NAVIGATE':
            var nextState = {
              routeName: action.routeName,
              data: {},
              params: action.params,
              navState: manager.navigator.router.getStateForAction(manager.navigator.router.getActionForPathAndParams(action.routeName))
            };
            nextState.routeStore = manager.getRouteStore(action.routeName, action);
            return nextState;
          default:
            var routeStore = manager.getRouteStore(state.routeName, action, state.routeStore);
            if (routeStore == state.routeStore) {
              return state;
            } else {
              return Object.assign({}, state, {
                routeStore: routeStore
              });
            }
        }
        return state;
      };
    }
  }, {
    key: 'getRoute',
    value: function getRoute(routeName) {
      if (this.props.routes) {
        return this.props.routes[routeName];
      }
      return null;
    }
  }, {
    key: 'processRoutes',
    value: function processRoutes() {
      var routeNames = Object.keys(this.props.routes);
      this.reactNavigationRoutes = {};
      for (var index in routeNames) {
        var routeName = routeNames[index];
        var route = this.props.routes[routeName];
        var screen = this.getComponent(routeName, route);
        this.reactNavigationRoutes[routeName] = { screen: screen };
      }
    }

    //change redux state as per route reducers

  }, {
    key: 'getRouteStore',
    value: function getRouteStore(routeName, action) {
      var state = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var route = this.getRoute(routeName);
      if (route) {
        if (route.reducer) {
          this.routeStoreReducer = route.reducer;
        } else if (route.reducers && Object.keys(route.reducers).length > 0) {
          this.routeStoreReducer = (0, _redux.combineReducers)(route.reducers);
        }
        if (this.routeStoreReducer) {
          return this.routeStoreReducer(state, action);
        }
      }
      return state;
    }
  }]);

  return NavigationManager;
}();

var NavigationRenderer = function (_React$Component2) {
  _inherits(NavigationRenderer, _React$Component2);

  function NavigationRenderer() {
    _classCallCheck(this, NavigationRenderer);

    return _possibleConstructorReturn(this, (NavigationRenderer.__proto__ || Object.getPrototypeOf(NavigationRenderer)).apply(this, arguments));
  }

  _createClass(NavigationRenderer, [{
    key: 'render',
    value: function render() {
      var AppNavigator = this.props.navigator;
      return _react2.default.createElement(AppNavigator, { navigation: (0, _reactNavigation.addNavigationHelpers)({
          dispatch: this.props.dispatch,
          state: this.props.navState
        }) });
    }
  }]);

  return NavigationRenderer;
}(_react2.default.Component);

var mapStateToProps = function mapStateToProps(state, props) {
  return {
    navState: state.router.navState,
    navigator: props.navigator
  };
};

var NavigationRendererWithState = (0, _reactRedux.connect)(mapStateToProps)(NavigationRenderer);

exports.default = NavigationManager;
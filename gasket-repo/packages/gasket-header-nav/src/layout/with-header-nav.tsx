import { AppRouterNavigation } from './app-router-navigation.js';
import { makeWithHeaderNav } from '../make-with-header-nav.js';

/**
 * Higher order component to add a navigation component to withHeaderNavHOC
 */
const withHeaderNav = makeWithHeaderNav(AppRouterNavigation);
export default withHeaderNav;

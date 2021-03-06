import safeCreateAction from '../../../actions/safeCreateAction';

/**
 * action to set the user info nexus associates with an api key
 */
export const setUserInfo = safeCreateAction('SET_USER_INFO', info => info);

/**
 * remember current version available on nexus
 */
export const setNewestVersion = safeCreateAction('SET_NEWEST_VERSION', ver => ver);

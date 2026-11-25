import { PublicClientApplication } from '@azure/msal-browser';

/**
 * Microsoft Entra ID (MSAL) Production Configuration
 * Reads import.meta.env.VITE_AZURE_CLIENT_ID with safe fallback handling
 */
const rawClientId = import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.VITE_ENTRA_CLIENT_ID || '';
const isPlaceholder = !rawClientId || rawClientId.includes('00000000') || rawClientId.length < 15;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID || import.meta.env.VITE_ENTRA_TENANT_ID || 'common';
const redirectUri = import.meta.env.VITE_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

export const msalConfig = {
  auth: {
    clientId: !isPlaceholder ? rawClientId : '00000000-0000-0000-0000-000000000000',
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: () => {},
      logLevel: 0,
    },
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
  prompt: 'select_account',
};

let msalInstance = null;

export async function getMsalInstance() {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
    await msalInstance.handleRedirectPromise();
  }
  return msalInstance;
}

/**
 * Executes loginPopup wrapped inside try/catch with fallback to loginRedirect.
 * Catches popup blocked, cancelled, and Entra ID configuration errors gracefully.
 */
export async function authenticateWithMicrosoft() {
  // Fallback check: Client ID missing or placeholder
  if (isPlaceholder) {
    const error = new Error('AADSTS700038_MISSING_CLIENT_ID');
    error.code = 'AADSTS700038_MISSING_CLIENT_ID';
    throw error;
  }

  const instance = await getMsalInstance();
  try {
    const response = await instance.loginPopup(loginRequest);
    if (response && (response.account || response.accessToken || response.idToken)) {
      const account = response.account;
      return {
        success: true,
        user: {
          name: account?.name || 'Microsoft Entra User',
          email: account?.username || 'user@ecosense.ai',
          provider: 'microsoft',
          avatar: (account?.name || 'EU').slice(0, 2).toUpperCase(),
          idToken: response.idToken,
        },
      };
    }
  } catch (error) {
    console.warn('MSAL login error:', error);
    if (error.errorCode === 'popup_window_error' || error.message?.includes('popup')) {
      // Fallback to loginRedirect if popup blocked
      await instance.loginRedirect(loginRequest);
      return;
    }
    if (error.errorCode === 'user_cancelled') {
      throw new Error('Authentication cancelled by user.');
    }
    if (error.errorCode?.includes('AADSTS50011') || error.message?.includes('AADSTS50011')) {
      const aadError = new Error('AADSTS50011: Redirect URI mismatch. Add http://localhost:5173 to Azure Portal SPA platform.');
      aadError.code = 'AADSTS50011';
      throw aadError;
    }
    if (error.errorCode?.includes('AADSTS') || error.message?.includes('AADSTS700038')) {
      const aadError = new Error('AADSTS700038_INVALID_APP');
      aadError.code = 'AADSTS700038_INVALID_APP';
      throw aadError;
    }
    throw error;
  }
}

export default {
  msalConfig,
  loginRequest,
  getMsalInstance,
  authenticateWithMicrosoft,
};


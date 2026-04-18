import { API_BASE_URL } from "../constants/api";

const REFRESH_URL = `${API_BASE_URL}/api/v1/auth/refresh-token`;

let refreshPromise = null;
export let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

const clearAuthState = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  inMemoryAccessToken = null;
};

const redirectToLogin = () => {
  const publicPaths = ["/", "/login", "/forgot-password", "/reset-password"];
  if (!publicPaths.includes(window.location.pathname)) {
    window.location.href = "/login";
  }
};

const getRequestUrl = (input) => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  if (input instanceof Request) return input.url;
  return String(input || "");
};

const injectAuthHeader = (input, init, accessToken) => {
  if (input instanceof Request) {
    const headers = new Headers(input.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return [new Request(input, { headers, credentials: "include" }), undefined];
  }

  const headers = new Headers(init?.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);

  return [
    input,
    {
      ...(init || {}),
      headers,
      credentials: "include",
    },
  ];
};

const refreshAccessToken = async (originalFetch) => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await originalFetch(REFRESH_URL, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      clearAuthState();
      redirectToLogin();
      return null;
    }

    const data = await response.json();
    if (!data?.token) {
      clearAuthState();
      redirectToLogin();
      return null;
    }

    setAccessToken(data.token);
    return data.token;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

export const setupAuthFetch = () => {
  if (typeof window === "undefined" || window.__tnpAuthFetchInstalled) {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const requestUrl = getRequestUrl(input);
    const isApiRequest = requestUrl.includes("/api/v1") && 
                         !requestUrl.includes("/api/v1/auth/login") && 
                         !requestUrl.includes("/api/v1/auth/refresh-token") &&
                         !requestUrl.includes("/api/v1/auth/logout");

    let finalInput = input;
    let finalInit = init ? { ...init, credentials: "include" } : { credentials: "include" };

    if (input instanceof Request) {
       finalInput = new Request(input, { credentials: "include" });
       finalInit = undefined;
    }

    // Force inject the memory token if it's an API request, ignoring localStorage values set by components
    if (isApiRequest && inMemoryAccessToken) {
      const injected = injectAuthHeader(finalInput, finalInit, inMemoryAccessToken);
      finalInput = injected[0];
      finalInit = injected[1];
    } else if (isApiRequest && !inMemoryAccessToken) {
      // If no token in memory, immediately try to refresh before making the original request
      // This happens on page reload
      const newAccessToken = await refreshAccessToken(originalFetch);
      if (newAccessToken) {
        const injected = injectAuthHeader(finalInput, finalInit, newAccessToken);
        finalInput = injected[0];
        finalInit = injected[1];
      }
    }

    const response = await originalFetch(finalInput, finalInit);

    if (response.status === 401 && isApiRequest) {
      const nextAccessToken = await refreshAccessToken(originalFetch);
      if (!nextAccessToken) {
        return response;
      }

      const [retryInput, retryInit] = injectAuthHeader(input, init, nextAccessToken);
      return originalFetch(retryInput, retryInit);
    }

    return response;
  };

  window.__tnpAuthFetchInstalled = true;
};

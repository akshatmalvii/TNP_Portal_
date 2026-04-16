import { API_BASE_URL } from "../constants/api";

const REFRESH_URL = `${API_BASE_URL}/api/v1/auth/refresh-token`;

let refreshPromise = null;

const clearAuthState = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
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

const buildRetryRequest = (input, init, accessToken) => {
  if (input instanceof Request) {
    const headers = new Headers(input.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return [new Request(input, { headers }), undefined];
  }

  const headers = new Headers(init?.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);

  return [
    input,
    {
      ...(init || {}),
      headers,
    },
  ];
};

const refreshAccessToken = async (originalFetch) => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const storedRefreshToken = localStorage.getItem("refreshToken");
  if (!storedRefreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    const response = await originalFetch(REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    if (!response.ok) {
      clearAuthState();
      redirectToLogin();
      return null;
    }

    const data = await response.json();
    if (!data?.token || !data?.refreshToken) {
      clearAuthState();
      redirectToLogin();
      return null;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);

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
    const response = await originalFetch(input, init);
    const requestUrl = getRequestUrl(input);

    if (
      response.status !== 401 ||
      requestUrl.includes("/api/v1/auth/refresh-token") ||
      requestUrl.includes("/api/v1/auth/login") ||
      !localStorage.getItem("refreshToken")
    ) {
      return response;
    }

    const nextAccessToken = await refreshAccessToken(originalFetch);
    if (!nextAccessToken) {
      return response;
    }

    const [retryInput, retryInit] = buildRetryRequest(input, init, nextAccessToken);
    return originalFetch(retryInput, retryInit);
  };

  window.__tnpAuthFetchInstalled = true;
};

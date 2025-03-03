// Tokeni localStorage'den veya cookie'den al
export const getToken = () => {
  if (typeof window === "undefined") {
    console.warn("Cannot access localStorage or cookies on the server.");
    return null;
  }

  const token = localStorage.getItem("jwtToken") || getCookie("jwtToken");
  if (!token) {
    console.warn("Authorization token not found.");
  }
  return token;
};

export const getUserId = () => {
  if (typeof window === "undefined") {
    console.warn("Cannot access localStorage or cookies on the server.");
    return null;
  }

  return localStorage.getItem("userId") || getCookie("userId");
};

export const getPhoneNumber = () => {
  if (typeof window === "undefined") {
    console.warn("Cannot access localStorage or cookies on the server.");
    return null;
  }

  return localStorage.getItem("phone-number") || getCookie("phone-number");
};

export const getParsedToken = () => {
  const token = getToken();
  if (!token) {
    return null;
  }
  try {
    const base64Url = token.split(".")[1]; // Extract payload part of the JWT
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const parsedToken = JSON.parse(jsonPayload);

    // Transform the data into a more readable structure
    return {
      UserID:
        parsedToken[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
      Username:
        parsedToken[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ],
      FullName: parsedToken["FullName"],
      Roles:
        parsedToken[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ],
      Expiration: new Date(parsedToken["exp"] * 1000).toISOString(), // Convert expiration time to ISO format
    };
  } catch (error) {
    console.error("Failed to parse JWT token:", error);
    return null;
  }
};

// Cookie'den veri al
export const getCookie = (name) => {
  const cookieArr = document.cookie.split(";");
  for (let cookie of cookieArr) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) {
      return value;
    }
  }
  return null;
};

// Tokeni localStorage ve cookie'ye kaydet
export const setToken = (jwtToken, refreshToken) => {
  localStorage.setItem("jwtToken", jwtToken);
  localStorage.setItem("refreshToken", refreshToken);

  document.cookie = `jwtToken=${jwtToken}; path=/;`;
  document.cookie = `refreshToken=${refreshToken}; path=/;`;
};

// Tokeni localStorage ve cookie'den sil
export const removeToken = () => {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("refreshToken");

  document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  document.cookie =
    "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
};

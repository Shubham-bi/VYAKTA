import axios from "axios";

class ApiService {
  private apiUrl = "https://tornatitansapi.shauryatechnosoft.com/api";

  constructor() {
    axios.defaults.withCredentials = true;
  }

  callApi(
    controllerName: string,
    methodName: string,
    methodType: "GET" | "POST" | "PUT" | "DELETE",
    params?: any
  ) {
    const url = `${this.apiUrl}/${controllerName}/${methodName}`;
    const token = localStorage.getItem("tk_9xf1BzX");

    // ❗ REMOVE Authorization for login/register
    const noAuthNeeded =
      methodName.toLowerCase() === "login" ||
      methodName.toLowerCase() === "register";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(noAuthNeeded
        ? {} // no token
        : token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    };

    switch (methodType) {
      case "GET":
        return axios.get(url, { headers, params, withCredentials: true });

      case "POST":
        return axios.post(url, params, { headers, withCredentials: true });

      case "PUT":
        return axios.put(url, params, { headers, withCredentials: true });

      case "DELETE":
        return axios.delete(url, { headers, params, withCredentials: true });

      default:
        throw new Error(`Unsupported method ${methodType}`);
    }
  }
}

export default new ApiService();

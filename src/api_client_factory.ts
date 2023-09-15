import {PromiseApiApi} from "@/api/types/PromiseAPI";
import type {SecurityAuthentication} from "@/api";
import {createConfiguration, RequestContext, ServerConfiguration} from "@/api";
import {API_URL} from "@/const";

class TokenAuth implements SecurityAuthentication {
  constructor(private token: string) {}

  applySecurityAuthentication(context: RequestContext): void | Promise<void> {
    context.setHeaderParam("Authorization", `Token ${this.token}`);
  }

  getName(): string {
    return `TokenAuth ${this.token}`;
  }
}

export class ApiClientFactory {
  private static _instance: PromiseApiApi | null = null;

  private constructor() {}

  public static getInstance() {
    if (ApiClientFactory._instance == null) {
      const config = createConfiguration({
        baseServer: new ServerConfiguration(API_URL, {}),
        authMethods: {default: new TokenAuth(localStorage.getItem("api-token") ?? "")},
      });
      ApiClientFactory._instance = new PromiseApiApi(config);
    }
    return ApiClientFactory._instance;
  }
}

export function hasApiToken() {
  return localStorage.getItem("api-token") != null;
}

export function deleteApiToken() {
  localStorage.removeItem("api-token");
}

export async function getApiToken(user: string, pass: string) {
  const init: RequestInit = {
    method: "post",
    body: JSON.stringify({username: user, password: pass}),
    headers: {"Content-Type": "application/json",
  };
  const response = await fetch("http://127.0.0.1:8000/api-token-auth/", init);
  const json: any = await response.json();
  if ("token" in json) {
    localStorage.setItem("api-token", json.token);
    return null;
  } else if ("non_field_errors" in json) {
    return (json.non_field_errors as string[]).join(", ");
  } else {
    let msg = "Fehler";
    if ("username" in json) {
      msg += ` Benutzername: ${json.username}`;
    }
    if ("password" in json) {
      msg += ` Passwort: ${json.password}`;
    }
    return msg;
  }
}

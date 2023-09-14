import {PromiseApiApi} from "@/api/types/PromiseAPI";
import {createConfiguration, ServerConfiguration} from "@/api";
import {API_URL} from "@/const";

export class ApiClientFactory {
  private static _instance: PromiseApiApi | null = null;

  private constructor() {}

  public static getInstance() {
    if (ApiClientFactory._instance == null) {
      const config = createConfiguration({baseServer: new ServerConfiguration(API_URL, {})});
      ApiClientFactory._instance = new PromiseApiApi(config);
    }
    return ApiClientFactory._instance;
  }
}

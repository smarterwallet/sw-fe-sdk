import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { JSONBigInt } from "../mpc/CommonUtils";

export class HttpUtils {
  public static post(
    api: string,
    params: any
  ): Promise<{ status: number; body?: any }> {
    return this.request("POST", api, params, "");
  }

  public static postWithAuth(
    api: string,
    params: any,
    auth: string
  ): Promise<{ status: number; body?: any }> {
    return this.request("POST", api, params, auth);
  }

  public static get(api: string): Promise<{ status: number; body?: any }> {
    return this.request("GET", api, null, "");
  }

  private static async request(
    method: string,
    api: string,
    params: any,
    auth: string
  ): Promise<{ status: number; body?: any }> {
    // Create an instance of axios with custom config
    const instance = axios.create({
      // You can add other custom configuration here if needed
      transformResponse: [(data) => {
        // Use JSONBigInt for parsing JSON data
        return data ? JSONBigInt.parse(data) : null;
      }],
    });

    // Set up the request configuration
    const config: AxiosRequestConfig = {
      method: method,
      url: api,
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { 'Authorization': auth } : {}),
      },
      data: params ? JSONBigInt.stringify(params) : undefined,
    };

    try {
      // Make the request using axios and the config
      const response: AxiosResponse = await instance(config);

      // Return the response status and body
      return {
        status: response.status,
        body: response.data,
      };
    } catch (error) {
      // Handle errors
      console.error('API error: ', error);
      // If axios throws an error, it will be of type AxiosError which contains the response object
      if (axios.isAxiosError(error) && error.response) {
        return {
          status: error.response.status,
          body: error.response.data,
        };
      } else {
        return {
          status: 500,
          body: { message: 'Internal service error!' },
        };
      }
    }
  }

}

import axios from "axios";
import { parseStringPromise } from "xml2js";

const jwtToken = process.env.JWT_API_PYTHON;
const urlApi = process.env.URL_API_PYTHON;

/**
 * POST
 * @param endpoint URL
 * @param data body
 */
export const baseApiPython = async (endpoint: string, data = {}) => {
    try {
      const apiUrl = `${urlApi}/${endpoint}`;
      // console.log(apiUrl);
      // console.log(data);
      const response = await axios.post(apiUrl, data, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`,
        },
      });
      console.log(response);
      if (!response.data) {
        throw new Error("Empty response from API");
      }
  
      const parsedResponse = await parseStringPromise(response.data, {
        explicitArray: false,
      });
      // console.log(parsedResponse);
      const jsonString = parsedResponse?.string?._ || null;
  
      if (!jsonString) {
        throw new Error("Failed to parse response");
      }
  
      return JSON.parse(jsonString);
    } catch (error: any) {
      throw new Error(error.message || "Failed to call API");
    }
};
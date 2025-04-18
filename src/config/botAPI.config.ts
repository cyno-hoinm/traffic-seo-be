import axios from "axios";
import { parseStringPromise } from "xml2js";
import qs from "qs";

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
      
      const response = await axios.post(apiUrl, qs.stringify(data), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Bearer ${jwtToken}`,
        },
      });
  
      if (!response.data) {
        throw new Error("Empty response from API");
      }
  
      const parsedResponse = await parseStringPromise(response.data, {
        explicitArray: false,
      });
      const jsonString = parsedResponse?.string?._ || null;
  
      if (!jsonString) {
        throw new Error("Failed to parse response");
      }
  
      return JSON.parse(jsonString);
    } catch (error: any) {
      throw new Error(error.message || "Failed to call API");
    }
};
import axios from "axios";
import { parseStringPromise } from "xml2js";

const jwtToken = process.env.JWT_API_PYTHON;
const urlApi = process.env.URL_API_PYTHON;

/**
 * POST request to Python API
 * @param endpoint API endpoint (relative path)
 * @param data Request body
 * @returns Parsed response data
 */
export const baseApiPython = async (
  endpoint: string,
  data: Record<string, any> = {}
): Promise<any> => {
  try {
    if (!urlApi || !jwtToken) {
      throw new Error(
        "Environment variables URL_API_PYTHON or JWT_API_PYTHON are not set"
      );
    }

    const apiUrl = `${urlApi}/${endpoint.replace(/^\/+/, "")}`; // Remove leading slashes
    const response = await axios.post(apiUrl, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      validateStatus: (status) => status >= 200 && status < 300, // Treat 2xx as success
    });

    // Check if response or response.data is empty
    if (!response?.data) {
      throw new Error("Empty response from API");
    }

    // Check Content-Type header to determine response format
    const contentType = response.headers["content-type"]?.toLowerCase() || "";

    if (contentType.includes("application/json")) {
      // Handle JSON response directly
      return response.data;
    } else if (
      contentType.includes("application/xml") ||
      contentType.includes("text/xml")
    ) {
      // Handle XML response
      try {
        const parsedResponse = await parseStringPromise(response.data, {
          explicitArray: false,
          trim: true,
        });
        const jsonString = parsedResponse?.string?._ || null;

        if (!jsonString) {
          throw new Error("Failed to extract JSON string from XML response");
        }

        return JSON.parse(jsonString);
      } catch (xmlError: any) {
        throw new Error(`Failed to parse XML response: ${xmlError.message}`);
      }
    } else {
      // Handle unexpected content type
      throw new Error(
        `Unsupported response Content-Type: ${contentType || "unknown"}`
      );
    }
  } catch (error: any) {
    const errorMessage = error.response
      ? `API request failed: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      : error.message || "Failed to call API";
    throw new Error(errorMessage);
  }
};

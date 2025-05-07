import { baseApiPython, baseApiPythonUpdate } from "../../config/botAPI.config";

export type SearchLogInput = {
  page: number,
  limit: number,
  keywordId: number
}
export const searchLogs = async (
  data: SearchLogInput
)=> {
  try {
    const result = await baseApiPython("log/search",data )
    return result.data
  } catch (error: any) {
  }
}

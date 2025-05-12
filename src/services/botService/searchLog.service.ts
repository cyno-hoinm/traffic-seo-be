import { baseApiPython } from "../../config/botAPI.config";

export type SearchLogInput = {
  page: number,
  limit: number,
  keywordId: number
}

export type TypeLog = "SEARCHLOG" | "DIRECTLOG"

export type SearchLogByTypeInput = {
  page: number,
  limit: number,
  keywordId?: number
  linkId?: number
  type: TypeLog
}
export const searchLogs = async (
  data: SearchLogInput
)=> {
  try {
    const result = await baseApiPython("log/search",data )
    return result.data
  } catch (error: any) {
    return []
  }
}

export const searchLogsByType = async (
  data: SearchLogByTypeInput
)=> {
  try {
    const result = await baseApiPython("log/search-by-type",data )
    return result.data
  } catch (error: any) {
    return []
  }
}

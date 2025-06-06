import { oxapayConfig } from "../config/oxapay.config";
import { CreateInvoiceInput, CreateInvoiceResult, CreatePayoutInput, CreatePayoutResult } from "../interfaces/Oxapay.interface";
import axios from "axios"

const baseUrl = oxapayConfig.url;

export const generateInvoice = async (data: CreateInvoiceInput): Promise<CreateInvoiceResult> => {
  try {

    const res = await axios.post(`${baseUrl}/payment/invoice`, data, {
      headers: {
        'merchant_api_key': oxapayConfig.merchant,
        'Content-Type': 'application/json'
      },
    });

    return res.data.data;
  } catch (error: any) {
    throw new Error('Failed to create Oxapay invoice');

  }
}


export const getCurrenciesService = async (): Promise<{
  list: string[]
}> => {
  try {
    const res = await axios.get(`${baseUrl}/payment/accepted-currencies`, {
      headers: {
         'merchant_api_key': oxapayConfig.merchant,
         'Content-Type': 'application/json' },
    });

    return res.data.data;

  } catch (error: any) {
    throw new Error('Failed to get currencies');
  }
}

export const generatePayout = async (data: CreatePayoutInput): Promise<CreatePayoutResult> => {
  try {

    const res = await axios.post(`${baseUrl}/api/send`, data, {
      headers: { 'Content-Type': 'application/json' },
    });

    return res.data;
  } catch (error: any) {
    throw new Error('Failed to create Oxapay payout');

  }
}

export const getMyIP = async (): Promise<any> => {
  try {
    const res = await axios.get(`${baseUrl}/api/myip`,  {
      headers: { 'Content-Type': 'application/json' },
    });

    return res.data;
  } catch (error: any) {
    throw new Error('Failed to create Oxapay payout');

  }
}


  // async checkInvoiceStatus({ invoice_id }: CheckInvoiceStatusParams) {
  //   try {
  //     const res = await axios.post(`${this.baseUrl}/check_invoice`, { invoice_id }, {
  //       headers: { 'Content-Type': 'application/json' },
  //     });

  //     return res.data;
  //   } catch (error: any) {
  //     console.error('Oxapay - checkInvoiceStatus error:', error.response?.data || error.message);
  //     throw new Error('Failed to check Oxapay invoice status');
  //   }
  // }


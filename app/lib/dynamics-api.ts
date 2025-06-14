import axios, { AxiosResponse } from 'axios';

export interface Order {
  salesorderid: string;
  name: string;
  totalamount: number;
  statuscode: number;
  statecode: number;
  createdon: string;
  modifiedon: string;
  customerid_contact?: {
    fullname: string;
    contactid: string;
  };
  orderstatuscode?: {
    label: string;
    value: number;
  };
}

export interface OrderResponse {
  'value': Order[];
  '@odata.count'?: number;
}

class DynamicsApiService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = `${process.env.NEXT_PUBLIC_DYNAMICS_URL}/api/data/v${process.env.NEXT_PUBLIC_DYNAMICS_API_VERSION}`;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Accept': 'application/json',
      'Prefer': 'odata.include-annotations="*"',
    };
  }

  async getOrders(customerId?: string): Promise<Order[]> {
    try {
      let url = `${this.baseUrl}/salesorders`;

      // Add expand to get related data
      const expand = '$expand=customerid_contact($select=fullname,contactid)';
      const select = '$select=salesorderid,name,totalamount,statuscode,statecode,createdon,modifiedon';
      const orderBy = '$orderby=createdon desc';

      let queryParams = `?${select}&${expand}&${orderBy}`;

      // Filter by customer if provided
      if (customerId) {
        queryParams += `&$filter=_customerid_value eq ${customerId}`;
      }

      url += queryParams;

      const response: AxiosResponse<OrderResponse> = await axios.get(url, {
        headers: this.getHeaders(),
      });

      return response.data.value || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders from Dynamics');
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const url = `${this.baseUrl}/salesorders(${orderId})`;
      const expand = '$expand=customerid_contact($select=fullname,contactid)';
      const select = '$select=salesorderid,name,totalamount,statuscode,statecode,createdon,modifiedon';

      const response: AxiosResponse<Order> = await axios.get(`${url}?${select}&${expand}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  // Helper method to get status label
  getStatusLabel(statusCode: number): string {
    const statusMap: { [key: number]: string } = {
      1: 'Active',
      2: 'Inactive',
      100000000: 'New',
      100000001: 'Pending',
      100000002: 'Won',
      100000003: 'Canceled',
      100000004: 'Fulfilled',
      100000005: 'Invoiced',
      100000006: 'Closed',
    };

    return statusMap[statusCode] || 'Unknown';
  }

  // Helper method to get status color for UI
  getStatusColor(statusCode: number): string {
    const colorMap: { [key: number]: string } = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-gray-100 text-gray-800',
      100000000: 'bg-blue-100 text-blue-800',
      100000001: 'bg-yellow-100 text-yellow-800',
      100000002: 'bg-green-100 text-green-800',
      100000003: 'bg-red-100 text-red-800',
      100000004: 'bg-purple-100 text-purple-800',
      100000005: 'bg-indigo-100 text-indigo-800',
      100000006: 'bg-gray-100 text-gray-800',
    };

    return colorMap[statusCode] || 'bg-gray-100 text-gray-800';
  }
}

export const dynamicsApi = new DynamicsApiService();

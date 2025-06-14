import axios, { AxiosResponse } from 'axios';

export interface Case {
  incidentid: string;
  title: string;
  statuscode: number;
  statecode: number;
  prioritycode: number;
  caseorigincode: number;
  createdon: string;
  modifiedon: string;
  customerid_contact?: {
    fullname: string;
    contactid: string;
  };
  customerid_account?: {
    name: string;
    accountid: string;
  };
}

export interface CaseResponse {
  'value': Case[];
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

  async getCases(customerId?: string): Promise<Case[]> {
    try {
      let url = `${this.baseUrl}/incidents`;

      // Add expand to get related data
      const expand =
        '$expand=customerid_contact($select=fullname,contactid),customerid_account($select=name,accountid)';
      const select = '$select=incidentid,title,statuscode,statecode,prioritycode,caseorigincode,createdon,modifiedon';
      const orderBy = '$orderby=createdon desc';

      let queryParams = `?${select}&${expand}&${orderBy}`;

      // Filter by customer if provided
      if (customerId) {
        queryParams += `&$filter=_customerid_value eq ${customerId}`;
      }

      url += queryParams;

      const response: AxiosResponse<CaseResponse> = await axios.get(url, {
        headers: this.getHeaders(),
      });

      return response.data.value || [];
    } catch (error) {
      console.error('Error fetching cases:', error);
      throw new Error('Failed to fetch cases from Dynamics');
    }
  }

  async getCaseById(caseId: string): Promise<Case | null> {
    try {
      const url = `${this.baseUrl}/incidents(${caseId})`;
      const expand =
        '$expand=customerid_contact($select=fullname,contactid),customerid_account($select=name,accountid)';
      const select = '$select=incidentid,title,statuscode,statecode,prioritycode,caseorigincode,createdon,modifiedon';

      const response: AxiosResponse<Case> = await axios.get(`${url}?${select}&${expand}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching case:', error);
      return null;
    }
  }

  // Helper method to get case status label
  getStatusLabel(statusCode: number): string {
    const statusMap: { [key: number]: string } = {
      1: 'In Progress',
      2: 'On Hold',
      3: 'Waiting for Details',
      4: 'Researching',
      5: 'Problem Solved',
      1000: 'Information Provided',
      2000: 'Canceled',
      5000: 'Merged',
    };

    return statusMap[statusCode] || 'Unknown';
  }

  // Helper method to get case state label
  getStateLabel(stateCode: number): string {
    const stateMap: { [key: number]: string } = {
      0: 'Active',
      1: 'Resolved',
      2: 'Canceled',
    };

    return stateMap[stateCode] || 'Unknown';
  }

  // Helper method to get priority label
  getPriorityLabel(priorityCode: number): string {
    const priorityMap: { [key: number]: string } = {
      1: 'High',
      2: 'Normal',
      3: 'Low',
    };

    return priorityMap[priorityCode] || 'Normal';
  }

  // Helper method to get status color for UI
  getStatusColor(statusCode: number): string {
    const colorMap: { [key: number]: string } = {
      1: 'bg-blue-100 text-blue-800', // In Progress
      2: 'bg-yellow-100 text-yellow-800', // On Hold
      3: 'bg-orange-100 text-orange-800', // Waiting for Details
      4: 'bg-purple-100 text-purple-800', // Researching
      5: 'bg-green-100 text-green-800', // Problem Solved
      1000: 'bg-green-100 text-green-800', // Information Provided
      2000: 'bg-red-100 text-red-800', // Canceled
      5000: 'bg-gray-100 text-gray-800', // Merged
    };

    return colorMap[statusCode] || 'bg-gray-100 text-gray-800';
  }

  // Helper method to get priority color for UI
  getPriorityColor(priorityCode: number): string {
    const colorMap: { [key: number]: string } = {
      1: 'bg-red-100 text-red-800', // High
      2: 'bg-blue-100 text-blue-800', // Normal
      3: 'bg-gray-100 text-gray-800', // Low
    };

    return colorMap[priorityCode] || 'bg-blue-100 text-blue-800';
  }
}

export const dynamicsApi = new DynamicsApiService();

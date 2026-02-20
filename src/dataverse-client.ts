import { ClientSecretCredential } from "@azure/identity";
import axios, { AxiosInstance } from "axios";

export class DataverseClient {
  private axiosInstance: AxiosInstance;
  private credential: ClientSecretCredential;
  private dataverseUrl: string;

  constructor(
    dataverseUrl: string,
    tenantId: string,
    clientId: string,
    clientSecret: string
  ) {
    this.dataverseUrl = dataverseUrl.replace(/\/$/, "");
    this.credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    this.axiosInstance = axios.create({
      baseURL: `${this.dataverseUrl}/api/data/v9.2`,
      headers: { "Content-Type": "application/json" },
    });

    this.axiosInstance.interceptors.request.use(async (config) => {
      const token = await this.credential.getToken(`${this.dataverseUrl}/.default`);
      config.headers.Authorization = `Bearer ${token.token}`;
      return config;
    });
  }

  async createRecord(table: string, data: any): Promise<{ id: string }> {
    const response = await this.axiosInstance.post(`/${table}`, data, {
      headers: { Prefer: "return=representation" },
    });
    const id = response.headers["odata-entityid"]?.split("(")[1]?.split(")")[0];
    return { id: id || response.data[`${table}id`] };
  }

  async updateRecord(table: string, id: string, data: any): Promise<void> {
    await this.axiosInstance.patch(`/${table}(${id})`, data);
  }

  async deleteRecord(table: string, id: string): Promise<void> {
    await this.axiosInstance.delete(`/${table}(${id})`);
  }

  async queryRecords(
    table: string,
    select?: string[],
    filter?: string,
    top?: number
  ): Promise<any> {
    const params: any = {};
    if (select?.length) params.$select = select.join(",");
    if (filter) params.$filter = filter;
    if (top) params.$top = top;

    const response = await this.axiosInstance.get(`/${table}`, { params });
    return response.data.value;
  }

  async listTables(): Promise<any[]> {
    const response = await this.axiosInstance.get("/EntityDefinitions", {
      params: { $select: "LogicalName,DisplayName,Description" },
    });
    return response.data.value.map((e: any) => ({
      logicalName: e.LogicalName,
      displayName: e.DisplayName?.UserLocalizedLabel?.Label,
      description: e.Description?.UserLocalizedLabel?.Label,
    }));
  }

  async getTableSchema(table: string): Promise<any> {
    const response = await this.axiosInstance.get(
      `/EntityDefinitions(LogicalName='${table}')/Attributes`,
      { params: { $select: "LogicalName,DisplayName,AttributeType,IsValidForCreate,IsValidForUpdate" } }
    );
    return response.data.value.map((a: any) => ({
      logicalName: a.LogicalName,
      displayName: a.DisplayName?.UserLocalizedLabel?.Label,
      type: a.AttributeType,
      canCreate: a.IsValidForCreate,
      canUpdate: a.IsValidForUpdate,
    }));
  }
}

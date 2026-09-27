import { expect, request, type APIRequestContext, type Page } from '@playwright/test';
import type { EmployeeRecord } from '../types/employee.js';

type ApiEmployee = {
  empNumber: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  employmentStatus?: string;
};

type EmployeeListResponse = {
  data?: Array<{
    empNumber: number;
    employeeId: string;
    firstName: string;
    lastName: string;
  }>;
};

type JobDetailsResponse = {
  data?: {
    jobTitle?: { title?: string | null };
    empStatus?: { name?: string | null };
  };
};

export class OrangeHrmApi {
  private constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  static async fromPage(page: Page): Promise<OrangeHrmApi> {
    const context = await request.newContext({
      baseURL: new URL('/web/index.php', page.url()).origin,
      storageState: await page.context().storageState(),
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    return new OrangeHrmApi(context, '/web/index.php');
  }

  async getEmployeeById(employeeId: string): Promise<ApiEmployee | null> {
    const response = await this.request.get(
      `${this.baseUrl}/api/v2/pim/employees?limit=200&offset=0&model=detailed&includeEmployees=onlyCurrent&sortField=employee.firstName&sortOrder=ASC`,
    );

    if (response.status() === 404) return null;
    expect(response.ok(), `Employee lookup API should succeed; received ${response.status()}`).toBeTruthy();

    const body = (await response.json()) as EmployeeListResponse;
    const employee = body.data?.find((candidate) => candidate.employeeId === employeeId);
    if (!employee) return null;

    const jobResponse = await this.request.get(`${this.baseUrl}/api/v2/pim/employees/${employee.empNumber}/job-details`);
    expect(
      jobResponse.ok(),
      `Employee job details API should succeed; received ${jobResponse.status()}`,
    ).toBeTruthy();
    const jobDetails = (await jobResponse.json()) as JobDetailsResponse;

    return {
      ...employee,
      jobTitle: jobDetails.data?.jobTitle?.title ?? undefined,
      employmentStatus: jobDetails.data?.empStatus?.name ?? undefined,
    };
  }

  async assertEmployeeMatches(employee: EmployeeRecord): Promise<ApiEmployee> {
    const apiEmployee = await this.getEmployeeById(employee.employeeId);
    expect(apiEmployee, `API should contain employee ${employee.employeeId} after UI creation`).not.toBeNull();
    expect(apiEmployee?.firstName, 'API first name should match the UI-created employee').toBe(employee.firstName);
    expect(apiEmployee?.lastName, 'API last name should match the UI-created employee').toBe(employee.lastName);
    return apiEmployee as ApiEmployee;
  }

  async assertEmployeeDeleted(employeeId: string): Promise<void> {
    const apiEmployee = await this.getEmployeeById(employeeId);
    expect(apiEmployee, `API should not contain deleted employee ${employeeId}`).toBeNull();
  }

  async dispose(): Promise<void> {
    await this.request.dispose();
  }
}
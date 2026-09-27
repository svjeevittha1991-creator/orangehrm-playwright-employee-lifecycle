import { expect, type Locator, type Page } from '@playwright/test';
import type { EmployeeRecord } from '../types/employee.js';

export class PimPage {
  constructor(private readonly page: Page) {}

  async openAddEmployee(): Promise<void> {
    await this.page.getByRole('link', { name: 'Add Employee' }).click();
    await expect(this.page).toHaveURL(/\/web\/index\.php\/pim\/addEmployee/);
  }

  async addEmployee(employee: EmployeeRecord): Promise<void> {
    await this.page.getByRole('textbox', { name: 'First Name' }).fill(employee.firstName);
    await this.page.getByRole('textbox', { name: 'Last Name' }).fill(employee.lastName);

    await this.addEmployeeIdInput().fill(employee.employeeId);

    await this.page.locator('input[type="file"]').setInputFiles(employee.profilePicture);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page.getByText('Successfully Saved', { exact: false })).toBeVisible();
  }

  async openEmployeeList(): Promise<void> {
    await this.page.getByRole('link', { name: 'Employee List' }).click();
    await expect(this.page).toHaveURL(/\/web\/index\.php\/pim\/viewEmployeeList/);
  }

  private async fillEmployeeIdSearch(employeeId: string): Promise<void> {
    await this.employeeIdSearchInput().fill(employeeId);
  }

  private addEmployeeIdInput(): Locator {
    return this.page.locator('input.oxd-input:not([placeholder])').first();
  }

  private employeeIdSearchInput(): Locator {
    return this.page.getByText('Employee Id', { exact: true }).locator('../..').locator('input').first();
  }

  async searchByEmployeeId(employeeId: string): Promise<void> {
    await this.fillEmployeeIdSearch(employeeId);
    await this.page.getByRole('button', { name: 'Search' }).click();
    await expect(this.employeeRow(employeeId)).toBeVisible();
  }

  private employeeRow(employeeId: string): Locator {
    return this.page.getByRole('row').filter({ hasText: employeeId });
  }

  async openEmployee(employeeId: string): Promise<void> {
    await this.employeeRow(employeeId).click();
    await expect(this.page).toHaveURL(/\/web\/index\.php\/pim\/viewPersonalDetails\/empNumber\/\d+/);
  }

  async updateJobTitleAndStatus(employee: EmployeeRecord): Promise<void> {
    await this.page.getByRole('tab', { name: 'Job' }).click();
    await this.selectDropdown('Job Title', employee.jobTitle);
    await this.selectDropdown('Employment Status', employee.employmentStatus);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page.getByText('Successfully Updated', { exact: false })).toBeVisible();
  }

  async assertEmployeeDetails(employee: EmployeeRecord): Promise<void> {
    await this.page.getByRole('tab', { name: 'Job' }).click();
    await expect(this.dropdownField('Job Title')).toHaveText(employee.jobTitle);
    await expect(this.dropdownField('Employment Status')).toHaveText(employee.employmentStatus);
  }

  private dropdownField(label: string): Locator {
    return this.page.locator('.oxd-input-group').filter({ hasText: label }).first().locator('.oxd-select-text');
  }

  private async selectDropdown(label: string, option: string): Promise<void> {
    await this.dropdownField(label).click();
    await this.page.locator('.oxd-select-option').filter({ hasText: option }).click();
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    await this.openEmployeeList();
    await this.searchByEmployeeId(employeeId);
    await this.employeeRow(employeeId).locator('span.oxd-checkbox-input').click();
    await this.page.getByRole('button', { name: 'Delete Selected' }).click();
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    await expect(this.page.getByText('Successfully Deleted', { exact: false })).toBeVisible();
  }

  async assertEmployeeIsAbsent(employeeId: string): Promise<void> {
    await this.fillEmployeeIdSearch(employeeId);
    await this.page.getByRole('button', { name: 'Search' }).click();
    await expect(this.employeeRow(employeeId)).toHaveCount(0);
  }
}
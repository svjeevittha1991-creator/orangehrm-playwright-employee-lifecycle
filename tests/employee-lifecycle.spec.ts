import { test, expect } from '@playwright/test';
import { OrangeHrmApi } from '../src/api/orangehrm-api.js';
import { DashboardPage } from '../src/pages/DashboardPage.js';
import { LoginPage } from '../src/pages/LoginPage.js';
import { PimPage } from '../src/pages/PimPage.js';
import { ensureProfilePictureExists, loadEmployeeData } from '../src/utils/employee-data.js';

test.describe('Employee lifecycle management', () => {
  test('creates, updates, validates by API, deletes, and logs out an employee', async ({ page }) => {
    const employee = loadEmployeeData();
    ensureProfilePictureExists(employee.profilePicture);

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const pimPage = new PimPage(page);
    let orangeHrmApi: OrangeHrmApi | undefined;

    await test.step('Login with valid credentials', async () => {
      await loginPage.open();
      await loginPage.login(
        process.env.ORANGEHRM_USERNAME ?? 'Admin',
        process.env.ORANGEHRM_PASSWORD ?? 'admin123',
      );
      await loginPage.assertLoginSucceeded();
    });

    try {
      await test.step('Add a new employee from JSON test data', async () => {
        await dashboardPage.openPim();
        await pimPage.openAddEmployee();
        await pimPage.addEmployee(employee);
      });

      await test.step('Edit employee job title and employment status', async () => {
        await pimPage.openEmployeeList();
        await pimPage.searchByEmployeeId(employee.employeeId);
        await pimPage.openEmployee(employee.employeeId);
        await pimPage.updateJobTitleAndStatus(employee);
        await pimPage.assertEmployeeDetails(employee);
      });

      await test.step('Cross-check the employee through the OrangeHRM API', async () => {
        orangeHrmApi = await OrangeHrmApi.fromPage(page);
        const apiEmployee = await orangeHrmApi.assertEmployeeMatches(employee);
        expect(apiEmployee.jobTitle, 'API job title should match the updated UI value').toBe(employee.jobTitle);
        expect(apiEmployee.employmentStatus, 'API employment status should match the updated UI value').toBe(
          employee.employmentStatus,
        );
      });

      await test.step('Delete the employee and verify deletion in UI and API', async () => {
        await pimPage.deleteEmployee(employee.employeeId);
        await pimPage.assertEmployeeIsAbsent(employee.employeeId);
        await orangeHrmApi?.assertEmployeeDeleted(employee.employeeId);
      });
    } finally {
      await orangeHrmApi?.dispose();
    }

    await test.step('Logout and confirm the session is invalidated', async () => {
      await dashboardPage.logout();
      await loginPage.assertLoggedOut();
    });
  });
});
import { expect, type Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async openPim(): Promise<void> {
    await this.page.getByRole('link', { name: 'PIM' }).click();
    await expect(this.page).toHaveURL(/\/web\/index\.php\/pim\/viewEmployeeList/);
  }

  async logout(): Promise<void> {
    await this.page.locator('.oxd-userdropdown-tab').click();
    await this.page.getByText('Logout', { exact: true }).click();
  }
}
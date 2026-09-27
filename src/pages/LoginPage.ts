import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async assertLoginSucceeded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/web\/index\.php\/dashboard\/index/);
    await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  }

  async assertLoggedOut(): Promise<void> {
    await expect(this.page).toHaveURL(/\/web\/index\.php\/auth\/login/);
    await expect(this.page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Login' })).toBeVisible();
  }
}
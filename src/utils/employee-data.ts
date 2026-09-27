import fs from 'node:fs';
import path from 'node:path';
import employeeTemplate from '../../test-data/employee.json' with { type: 'json' };
import type { EmployeeRecord } from '../types/employee.js';

export function loadEmployeeData(): EmployeeRecord {
  const suffix = `${Date.now()}`.slice(-6);

  return {
    ...employeeTemplate,
    employeeId: `${employeeTemplate.employeeIdPrefix}${suffix}`,
    profilePicture: path.resolve(process.cwd(), employeeTemplate.profilePicture),
  };
}

export function ensureProfilePictureExists(profilePicture: string): void {
  if (!fs.existsSync(profilePicture)) {
    throw new Error(`Profile picture fixture was not found: ${profilePicture}`);
  }
}
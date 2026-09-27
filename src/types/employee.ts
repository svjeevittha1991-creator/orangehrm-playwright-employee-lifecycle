export type EmployeeInput = {
  firstName: string;
  lastName: string;
  employeeIdPrefix: string;
  jobTitle: string;
  employmentStatus: string;
  profilePicture: string;
};

export type EmployeeRecord = EmployeeInput & {
  employeeId: string;
};
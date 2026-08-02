export interface PositionSalaryRecord {
  position: string;
  level: number;
  salary: number;
}

export const positionSalaryData: PositionSalaryRecord[] = [
  { position: 'Business Analyst', level: 1, salary: 45000 },
  { position: 'Junior Consultant', level: 2, salary: 50000 },
  { position: 'Senior Consultant', level: 3, salary: 60000 },
  { position: 'Manager', level: 4, salary: 80000 },
  { position: 'Country Manager', level: 5, salary: 110000 },
  { position: 'Region Manager', level: 6, salary: 150000 },
  { position: 'Partner', level: 7, salary: 200000 },
  { position: 'Senior Partner', level: 8, salary: 300000 },
  { position: 'C-level', level: 9, salary: 500000 },
  { position: 'CEO', level: 10, salary: 1000000 },
];

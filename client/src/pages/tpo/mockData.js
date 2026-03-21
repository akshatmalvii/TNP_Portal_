export const mockDrives = [
  {
    id: 1,
    company: 'TechCorp Solutions',
    position: 'Software Engineer',
    salary: '12-15 LPA',
    deadline: '2024-04-15',
    status: 'Active',
    applications: 45,
    eligibleStudents: 120
  },
  {
    id: 2,
    company: 'DataFlow Systems',
    position: 'Data Analyst',
    salary: '8-10 LPA',
    deadline: '2024-04-20',
    status: 'Active',
    applications: 32,
    eligibleStudents: 95
  },
  {
    id: 3,
    company: 'CloudInnovate Inc',
    position: 'DevOps Engineer',
    salary: '14-18 LPA',
    deadline: '2024-03-31',
    status: 'Closed',
    applications: 28,
    eligibleStudents: 85
  }
];

export const mockAnalytics = {
  totalDrives: 25,
  totalCompanies: 18,
  totalPlacements: 156,
  placementRate: 78,
  averageSalary: 12.5,
  highestSalary: 28
};

export const mockCompanyRequests = [
  {
    id: 1,
    company: 'InnovateTech',
    position: 'Full Stack Developer',
    salary: '10-14 LPA',
    status: 'Pending Approval',
    submittedDate: '2024-03-15'
  },
  {
    id: 2,
    company: 'Global Solutions',
    position: 'UI/UX Designer',
    salary: '8-12 LPA',
    status: 'Under Review',
    submittedDate: '2024-03-14'
  }
];

export const mockCompanies = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    industry: 'Technology',
    contactPerson: 'John Smith',
    email: 'hr@techcorp.com',
    status: 'Active',
    drivesPosted: 3
  },
  {
    id: 2,
    name: 'DataFlow Systems',
    industry: 'Data Analytics',
    contactPerson: 'Jane Doe',
    email: 'recruitment@dataflow.com',
    status: 'Active',
    drivesPosted: 2
  }
];

export const mockSalaryDistribution = [
  { range: '5-8 LPA', count: 25 },
  { range: '8-12 LPA', count: 45 },
  { range: '12-15 LPA', count: 35 },
  { range: '15-20 LPA', count: 28 },
  { range: '20+ LPA', count: 23 }
];

export const mockDepartmentStats = [
  { department: 'Computer Science', placed: 45, total: 60 },
  { department: 'Information Technology', placed: 38, total: 55 },
  { department: 'Electronics', placed: 32, total: 50 },
  { department: 'Mechanical', placed: 28, total: 45 }
];

export const mockPlacementStats = [
  { month: 'Jan', placements: 12 },
  { month: 'Feb', placements: 18 },
  { month: 'Mar', placements: 25 },
  { month: 'Apr', placements: 32 },
  { month: 'May', placements: 28 },
  { month: 'Jun', placements: 41 }
];
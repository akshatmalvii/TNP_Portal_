export const mockDrives = [
  {
    id: 1,
    company: 'TechCorp Solutions',
    position: 'Software Engineer',
    salary: '12-15 LPA',
    deadline: '2024-04-15',
    eligible: true,
    applied: true,
    status: 'Selected',
    interviewDate: '2024-04-20'
  },
  {
    id: 2,
    company: 'DataFlow Systems',
    position: 'Data Analyst',
    salary: '8-10 LPA',
    deadline: '2024-04-20',
    eligible: true,
    applied: false,
    status: 'Open'
  },
  {
    id: 3,
    company: 'CloudInnovate Inc',
    position: 'DevOps Engineer',
    salary: '14-18 LPA',
    deadline: '2024-03-31',
    eligible: false,
    applied: false,
    status: 'Closed'
  },
  {
    id: 4,
    company: 'FinanceFlow Ltd',
    position: 'Backend Developer',
    salary: '11-14 LPA',
    deadline: '2024-04-25',
    eligible: true,
    applied: true,
    status: 'Shortlisted'
  },
  {
    id: 5,
    company: 'WebForce Digital',
    position: 'Frontend Developer',
    salary: '10-13 LPA',
    deadline: '2024-04-30',
    eligible: true,
    applied: false,
    status: 'Open'
  }
]

export const mockApplications = [
  {
    id: 1,
    driveId: 1,
    company: 'TechCorp Solutions',
    status: 'Selected',
    appliedDate: '2024-03-15',
    result: 'Selected for Interview'
  },
  {
    id: 2,
    driveId: 4,
    company: 'FinanceFlow Ltd',
    status: 'Shortlisted',
    appliedDate: '2024-03-16',
    result: 'Shortlisted'
  },
  {
    id: 3,
    driveId: 5,
    company: 'WebForce Digital',
    status: 'Applied',
    appliedDate: '2024-03-18',
    result: 'Waiting for Result'
  }
]

export const mockStudents = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@college.edu',
    cgpa: 8.5,
    department: 'Computer Science',
    status: 'Placed',
    placedCompany: 'TechCorp Solutions',
    placedSalary: '13 LPA'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya.sharma@college.edu',
    cgpa: 8.2,
    department: 'Computer Science',
    status: 'Shortlisted',
    placedCompany: '-',
    placedSalary: '-'
  },
  {
    id: 3,
    name: 'Amit Patel',
    email: 'amit.patel@college.edu',
    cgpa: 7.8,
    department: 'Information Technology',
    status: 'Applied',
    placedCompany: '-',
    placedSalary: '-'
  },
  {
    id: 4,
    name: 'Neha Singh',
    email: 'neha.singh@college.edu',
    cgpa: 9.0,
    department: 'Computer Science',
    status: 'Placed',
    placedCompany: 'FinanceFlow Ltd',
    placedSalary: '14 LPA'
  },
  {
    id: 5,
    name: 'Vikram Desai',
    email: 'vikram.desai@college.edu',
    cgpa: 7.5,
    department: 'Electronics',
    status: 'Not Applied',
    placedCompany: '-',
    placedSalary: '-'
  }
]

export const mockPendingApplications = [
  {
    id: 1,
    studentName: 'Rajesh Kumar',
    company: 'TechCorp Solutions',
    position: 'Software Engineer',
    status: 'Pending Verification',
    documents: 'Resume, Transcripts'
  },
  {
    id: 2,
    studentName: 'Priya Sharma',
    company: 'DataFlow Systems',
    position: 'Data Analyst',
    status: 'Pending Review',
    documents: 'Resume'
  },
  {
    id: 3,
    studentName: 'Amit Patel',
    company: 'CloudInnovate Inc',
    position: 'DevOps Engineer',
    status: 'Pending Verification',
    documents: 'Resume, Offer Letter'
  }
]

export const mockAnalytics = {
  totalStudents: 245,
  totalPlaced: 189,
  placementPercentage: 77.1,
  averageSalary: 11.8,
  highestSalary: 25,
  lowestSalary: 6,
  companyCount: 32,
  pendingApplications: 12
}

export const mockPlacementStats = [
  { name: 'Placed', value: 189, fill: '#3b82f6' },
  { name: 'Shortlisted', value: 34, fill: '#60a5fa' },
  { name: 'Applied', value: 16, fill: '#93c5fd' },
  { name: 'Not Applied', value: 6, fill: '#dbeafe' }
]

export const mockSalaryDistribution = [
  { range: '6-8 LPA', count: 23 },
  { range: '8-10 LPA', count: 45 },
  { range: '10-12 LPA', count: 67 },
  { range: '12-15 LPA', count: 38 },
  { range: '15-20 LPA', count: 14 },
  { range: '20+ LPA', count: 2 }
]

export const mockDepartmentStats = [
  { name: 'Computer Science', placed: 95, total: 120, percentage: 79.2 },
  { name: 'Information Technology', placed: 58, total: 75, percentage: 77.3 },
  { name: 'Electronics', placed: 28, total: 38, percentage: 73.7 },
  { name: 'Mechanical', placed: 8, total: 12, percentage: 66.7 }
]

export const mockCompanyRequests = [
  {
    id: 1,
    company: 'AmazonWeb Services',
    position: 'Solutions Architect',
    salary: '18-22 LPA',
    requiredCGPA: 7.5,
    department: 'Computer Science',
    status: 'Approved'
  },
  {
    id: 2,
    company: 'Google Cloud',
    position: 'Cloud Engineer',
    salary: '20-25 LPA',
    requiredCGPA: 8.0,
    department: 'Computer Science',
    status: 'Pending Approval'
  },
  {
    id: 3,
    company: 'Microsoft Azure',
    position: 'Software Developer',
    salary: '16-20 LPA',
    requiredCGPA: 7.5,
    department: 'IT, CS',
    status: 'Pending Approval'
  }
]

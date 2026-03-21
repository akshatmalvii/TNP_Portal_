export const mockStudents = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    department: "Computer Science",
    year: "3rd Year",
    cgpa: 8.5,
    status: "Placed",
    placedCompany: "TechCorp"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    department: "Information Technology",
    year: "2nd Year",
    cgpa: 9.0,
    status: "Verified",
    placedCompany: ""
  },
  // Add more mock students as needed
];

export const mockPendingApplications = [
  {
    id: 1,
    studentName: "Alice Johnson",
    company: "TechCorp",
    position: "Software Engineer",
    appliedDate: "2024-03-15",
    status: "Pending Verification",
    documents: "Resume, Transcript"
  },
  {
    id: 2,
    studentName: "Bob Wilson",
    company: "DataFlow",
    position: "Data Analyst",
    appliedDate: "2024-03-14",
    status: "Pending Review",
    documents: "Resume"
  },
  // Add more as needed
];

export const mockAnalytics = {
  totalStudents: 150,
  totalPlaced: 45,
  placementPercentage: 30,
  totalCompanies: 25,
  averageSalary: 12,
  highestSalary: 25,
  companyCount: 25
};
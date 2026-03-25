import React, {useState, useEffect} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '../../components/Card';
import {Badge} from '../../components/Badge';
import {BarChart3, TrendingUp, Users} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';

export default function ReportsPage() {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            // Try to fetch placement reports from backend
            const res = await fetch(`${API_BASE}/reports/placement`, {headers});
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            } else {
                setReports(null);
            }
        } catch (err) {
            console.error('Error fetching reports:', err);
            setReports(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className='p-6'>
                <p className='text-center py-8 text-gray-500'>
                    Loading reports...
                </p>
            </div>
        );
    }

    if (!reports) {
        return (
            <div className='p-6 space-y-6'>
                <div>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        Placement Reports
                    </h1>
                    <p className='text-gray-500 mt-1'>
                        Department-wise placement statistics and analytics
                    </p>
                </div>

                <Card className='border-0'>
                    <CardHeader>
                        <CardTitle>Reports Dashboard</CardTitle>
                        <CardDescription>
                            Placement reports will be available once drives and
                            offers are recorded in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
                            <BarChart3 className='w-16 h-16 mb-4' />
                            <p className='text-lg font-medium'>No Data Yet</p>
                            <p className='text-sm mt-2 text-center max-w-md'>
                                Placement statistics (total placed, internships,
                                PPO, CTC stats) will appear here once drives are
                                created and offers are recorded.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Display reports when data is available
    return (
        <div className='p-6 space-y-6'>
            <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                    Placement Reports
                </h1>
                <p className='text-gray-500 mt-1'>
                    Department-wise placement statistics and analytics
                </p>
            </div>

            {/* Overall Statistics */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Card className='border-0'>
                    <CardContent className='pt-6'>
                        <div>
                            <p className='text-sm text-gray-500'>
                                Total Students
                            </p>
                            <p className='text-3xl font-bold mt-2'>
                                {reports.totalStudents || 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className='border-0'>
                    <CardContent className='pt-6'>
                        <div>
                            <p className='text-sm text-gray-500'>
                                Placed Students
                            </p>
                            <p className='text-3xl font-bold mt-2'>
                                {reports.placedStudents || 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className='border-0'>
                    <CardContent className='pt-6'>
                        <div>
                            <p className='text-sm text-gray-500'>Average CTC</p>
                            <p className='text-3xl font-bold mt-2'>
                                ₹{reports.avgCTC || 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className='border-0'>
                    <CardContent className='pt-6'>
                        <div>
                            <p className='text-sm text-gray-500'>
                                Placement Rate
                            </p>
                            <p className='text-3xl font-bold mt-2'>
                                {reports.totalStudents > 0
                                    ? Math.round(
                                          (reports.placedStudents /
                                              reports.totalStudents) *
                                              100,
                                      )
                                    : 0}
                                %
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Department-wise Statistics */}
            <Card className='border-0'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <TrendingUp className='w-5 h-5' />
                        Department-wise Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {reports.departmentStats &&
                        reports.departmentStats.length > 0 ? (
                            reports.departmentStats.map((dept, idx) => (
                                <div
                                    key={idx}
                                    className='p-4 border rounded-lg'
                                >
                                    <div className='flex justify-between items-start mb-3'>
                                        <div>
                                            <p className='font-medium text-gray-900'>
                                                {dept.deptName}
                                            </p>
                                            <p className='text-sm text-gray-500'>
                                                {dept.deptCode}
                                            </p>
                                        </div>
                                        <Badge className='bg-blue-100 text-blue-700 border border-blue-200'>
                                            {Math.round(
                                                (dept.placedStudents /
                                                    Math.max(
                                                        dept.totalStudents,
                                                        1,
                                                    )) *
                                                    100,
                                            )}
                                            %
                                        </Badge>
                                    </div>
                                    <div className='grid grid-cols-4 gap-4 text-sm'>
                                        <div>
                                            <p className='text-gray-500'>
                                                Total
                                            </p>
                                            <p className='font-semibold'>
                                                {dept.totalStudents}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-gray-500'>
                                                Placed
                                            </p>
                                            <p className='font-semibold'>
                                                {dept.placedStudents}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-gray-500'>
                                                Avg CTC
                                            </p>
                                            <p className='font-semibold'>
                                                ₹{dept.avgCTC}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-gray-500'>
                                                Max CTC
                                            </p>
                                            <p className='font-semibold'>
                                                ₹{dept.maxCTC}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className='text-center py-8 text-gray-500'>
                                No department statistics available
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Additional Stats */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Card className='border-0'>
                    <CardHeader>
                        <CardTitle className='text-base'>Internships</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-2xl font-bold text-blue-600'>
                            {reports.internships || 0}
                        </p>
                        <p className='text-sm text-gray-500 mt-1'>
                            Students with internship offers
                        </p>
                    </CardContent>
                </Card>
                <Card className='border-0'>
                    <CardHeader>
                        <CardTitle className='text-base'>
                            PPO Conversions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-2xl font-bold text-green-600'>
                            {reports.ppoConversions || 0}
                        </p>
                        <p className='text-sm text-gray-500 mt-1'>
                            Interns converted to permanent
                        </p>
                    </CardContent>
                </Card>
                <Card className='border-0'>
                    <CardHeader>
                        <CardTitle className='text-base'>
                            Direct Placements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-2xl font-bold text-purple-600'>
                            {reports.directPlacements || 0}
                        </p>
                        <p className='text-sm text-gray-500 mt-1'>
                            Direct placement offers
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

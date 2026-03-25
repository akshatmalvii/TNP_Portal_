import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../../components/Card';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '../../components/Table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../components/Dialog';
import {Badge} from '../../components/Badge';
import {Plus, Trash2} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';

export default function ManageTPOsPage() {
    const [tpos, setTpos] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({email: '', password: '', dept_id: ''});
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const token = localStorage.getItem('token');
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [staffRes, deptRes] = await Promise.all([
                fetch(`${API_BASE}/admin/staff?role=TPO`, {headers}),
                fetch(`${API_BASE}/departments`, {headers}),
            ]);
            const staffData = await staffRes.json();
            const deptData = await deptRes.json();

            setTpos(Array.isArray(staffData) ? staffData : []);
            setDepartments(Array.isArray(deptData) ? deptData : []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!form.email || !form.password) {
            setError('Email and password are required');
            return;
        }
        setSaving(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE}/admin/staff`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    role_name: 'TPO',
                    dept_id: form.dept_id || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create TPO');

            setDialogOpen(false);
            setForm({email: '', password: '', dept_id: ''});
            fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (staff_id) => {
        if (!confirm('Are you sure you want to remove this TPO?')) return;
        try {
            const res = await fetch(`${API_BASE}/admin/staff/${staff_id}`, {
                method: 'DELETE',
                headers,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete');
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAssignDept = async (staff_id, dept_id) => {
        try {
            const res = await fetch(
                `${API_BASE}/admin/staff/${staff_id}/assign-department`,
                {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({dept_id: dept_id || null}),
                },
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to assign');
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className='p-6 space-y-6'>
            <div className='flex justify-between items-center'>
                <div>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        Manage TPOs
                    </h1>
                    <p className='text-gray-500 mt-1'>
                        Add, remove, and assign TPOs to departments
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setError('');
                        setForm({email: '', password: '', dept_id: ''});
                        setDialogOpen(true);
                    }}
                    className='flex items-center gap-2'
                >
                    <Plus className='w-4 h-4' /> Add TPO
                </Button>
            </div>

            <Card className='border-0'>
                <CardHeader>
                    <CardTitle>TPO Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className='text-center py-8 text-gray-500'>
                            Loading...
                        </p>
                    ) : tpos.length === 0 ? (
                        <p className='text-center py-8 text-gray-500'>
                            No TPOs found. Click "Add TPO" to create one.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead className='text-right'>
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tpos.map((tpo) => (
                                    <TableRow key={tpo.staff_id}>
                                        <TableCell className='font-medium'>
                                            {tpo.User?.email || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    tpo.User?.account_status ===
                                                    'Active'
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                }
                                            >
                                                {tpo.User?.account_status ||
                                                    '—'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <select
                                                value={tpo.dept_id || ''}
                                                onChange={(e) =>
                                                    handleAssignDept(
                                                        tpo.staff_id,
                                                        e.target.value,
                                                    )
                                                }
                                                className='border rounded-md px-2 py-1 text-sm bg-white'
                                            >
                                                <option value=''>
                                                    Unassigned
                                                </option>
                                                {departments.map((d) => (
                                                    <option
                                                        key={d.dept_id}
                                                        value={d.dept_id}
                                                    >
                                                        {d.dept_code} —{' '}
                                                        {d.dept_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() =>
                                                    handleDelete(tpo.staff_id)
                                                }
                                            >
                                                <Trash2 className='w-4 h-4 text-red-500' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add TPO Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New TPO</DialogTitle>
                    </DialogHeader>

                    <div className='space-y-4 py-4'>
                        {error && (
                            <div className='p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm'>
                                {error}
                            </div>
                        )}
                        <div>
                            <label className='text-sm font-medium'>Email</label>
                            <Input
                                type='email'
                                placeholder='tpo@college.edu.in'
                                value={form.email}
                                onChange={(e) =>
                                    setForm({...form, email: e.target.value})
                                }
                            />
                        </div>
                        <div>
                            <label className='text-sm font-medium'>
                                Password
                            </label>
                            <Input
                                type='password'
                                placeholder='••••••••'
                                value={form.password}
                                onChange={(e) =>
                                    setForm({...form, password: e.target.value})
                                }
                            />
                        </div>
                        <div>
                            <label className='text-sm font-medium'>
                                Department (optional)
                            </label>
                            <select
                                value={form.dept_id}
                                onChange={(e) =>
                                    setForm({...form, dept_id: e.target.value})
                                }
                                className='w-full border rounded-md px-3 py-2 text-sm bg-white'
                            >
                                <option value=''>Select department</option>
                                {departments.map((d) => (
                                    <option key={d.dept_id} value={d.dept_id}>
                                        {d.dept_code} — {d.dept_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAdd} disabled={saving}>
                            {saving ? 'Creating...' : 'Create TPO'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

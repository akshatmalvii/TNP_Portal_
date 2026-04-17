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
import {useConfirmDialog} from '../../components/ConfirmDialog';
import { API_BASE_URL } from '../../constants/api';
import { PASSWORD_POLICY_RULES, validatePasswordStrength } from '../../lib/passwordPolicy';

const API_BASE = `${API_BASE_URL}/api/v1`;

export default function ManageCoordinatorsPage() {
    const {confirm, confirmDialog} = useConfirmDialog();
    const [coordinators, setCoordinators] = useState([]);
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
                fetch(`${API_BASE}/admin/staff?role=Placement_Coordinator`, {
                    headers,
                }),
                fetch(`${API_BASE}/departments`, {headers}),
            ]);
            const staffData = await staffRes.json();
            const deptData = await deptRes.json();

            setCoordinators(Array.isArray(staffData) ? staffData : []);
            setDepartments(Array.isArray(deptData) ? deptData : []);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!form.email || !form.password) {
            setError('Email and password are required');
            return;
        }
        const passwordValidationError = validatePasswordStrength({
            password: form.password,
            email: form.email,
        });
        if (passwordValidationError) {
            setError(passwordValidationError);
            return;
        }
        if (!form.dept_id) {
            setError('Department is required for coordinators');
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
                    role_name: 'Placement_Coordinator',
                    dept_id: form.dept_id,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || 'Failed to create coordinator');

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
        const shouldDelete = await confirm({
            title: 'Remove coordinator account?',
            description:
                'This will remove the coordinator account from the portal.',
            confirmText: 'Remove Coordinator',
        });

        if (!shouldDelete) return;
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

    const getDeptName = (dept_id) => {
        const d = departments.find((d) => d.dept_id === dept_id);
        return d ? `${d.dept_code} — ${d.dept_name}` : 'Unassigned';
    };

    return (
        <div className='p-6 space-y-6'>
            <div className='flex justify-between items-center'>
                <div>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        Manage Coordinators
                    </h1>
                    <p className='text-gray-500 mt-1'>
                        Add or remove placement coordinators
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
                    <Plus className='w-4 h-4' /> Add Coordinator
                </Button>
            </div>

            <Card className='border-0'>
                <CardHeader>
                    <CardTitle>Placement Coordinators</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className='text-center py-8 text-gray-500'>
                            Loading...
                        </p>
                    ) : coordinators.length === 0 ? (
                        <p className='text-center py-8 text-gray-500'>
                            No coordinators found. Click "Add Coordinator" to
                            create one.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className='text-right'>
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coordinators.map((coord) => (
                                    <TableRow key={coord.staff_id}>
                                        <TableCell className='font-medium'>
                                            {coord.User?.email || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-sm'>
                                                {getDeptName(coord.dept_id)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    coord.User
                                                        ?.account_status ===
                                                    'Active'
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                }
                                            >
                                                {coord.User?.account_status ||
                                                    '—'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() =>
                                                    handleDelete(coord.staff_id)
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

            {/* Add Coordinator Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Coordinator</DialogTitle>
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
                                placeholder='coordinator@college.edu.in'
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
                        <div className='rounded-md border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900'>
                            <p className='mb-2 font-medium'>Password rules</p>
                            <ul className='list-disc space-y-1 pl-4'>
                                {PASSWORD_POLICY_RULES.map((rule) => (
                                    <li key={rule}>{rule}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <label className='text-sm font-medium'>
                                Department
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
                            {saving ? 'Creating...' : 'Create Coordinator'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {confirmDialog}
        </div>
    );
}






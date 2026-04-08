import React, {useEffect, useState} from 'react';
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

export default function ManageCoordinatorsPage() {
    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({email: '', password: ''});
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const token = localStorage.getItem('token');
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    useEffect(() => {
        fetchCoordinators();
    }, []);

    const fetchCoordinators = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/tpo/coordinators`, {headers});
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch coordinators');
            }

            setCoordinators(Array.isArray(data) ? data : []);
            setError('');
        } catch (err) {
            setError(err.message);
            setCoordinators([]);
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
            const res = await fetch(`${API_BASE}/tpo/coordinators`, {
                method: 'POST',
                headers,
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create coordinator');
            }

            setDialogOpen(false);
            setForm({email: '', password: ''});
            fetchCoordinators();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (staff_id) => {
        if (!confirm('Are you sure you want to remove this coordinator?')) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/tpo/coordinators/${staff_id}`, {
                method: 'DELETE',
                headers,
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete coordinator');
            }

            fetchCoordinators();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className='p-6 space-y-6'>
            <div className='flex justify-between items-center'>
                <div>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        Manage Coordinators
                    </h1>
                    <p className='text-gray-500 mt-1'>
                        Create and manage coordinators for your department
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setError('');
                        setForm({email: '', password: ''});
                        setDialogOpen(true);
                    }}
                    className='flex items-center gap-2'
                >
                    <Plus className='w-4 h-4' /> Add Coordinator
                </Button>
            </div>

            {error && !dialogOpen && (
                <div className='p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm'>
                    {error}
                </div>
            )}

            <Card className='border-0'>
                <CardHeader>
                    <CardTitle>Department Coordinators</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className='text-center py-8 text-gray-500'>
                            Loading...
                        </p>
                    ) : coordinators.length === 0 ? (
                        <p className='text-center py-8 text-gray-500'>
                            No coordinators found for your department yet.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
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
                                            <Badge
                                                className={
                                                    coord.User?.account_status ===
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
        </div>
    );
}

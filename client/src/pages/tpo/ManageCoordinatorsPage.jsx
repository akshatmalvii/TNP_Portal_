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
import {useConfirmDialog} from '../../components/ConfirmDialog';
import { API_BASE_URL } from '../constants/api';

const API_BASE = '`${API_BASE_URL}`/api/v1';

export default function ManageCoordinatorsPage() {
    const {confirm, confirmDialog} = useConfirmDialog();
    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({email: '', password: ''});
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

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
        const shouldDelete = await confirm({
            title: 'Remove coordinator account?',
            description:
                'This will remove the coordinator account from your department.',
            confirmText: 'Remove Coordinator',
        });

        if (!shouldDelete) {
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

    const handleToggleStatus = async (coord) => {
        const currentStatus = coord.User?.account_status || 'Active';
        const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const actionLabel = nextStatus === 'Inactive' ? 'deactivate' : 'activate';

        const shouldContinue = await confirm({
            title: `${actionLabel === 'deactivate' ? 'Deactivate' : 'Activate'} coordinator account?`,
            description: `This coordinator will ${nextStatus === 'Inactive' ? 'lose' : 'regain'} access to the portal until the status is changed again.`,
            confirmText:
                nextStatus === 'Inactive' ? 'Deactivate' : 'Activate',
            tone: nextStatus === 'Inactive' ? 'danger' : 'neutral',
        });

        if (!shouldContinue) {
            return;
        }

        setUpdatingStatusId(coord.staff_id);
        try {
            const res = await fetch(
                `${API_BASE}/tpo/coordinators/${coord.staff_id}/status`,
                {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({account_status: nextStatus}),
                },
            );
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update status');
            }

            await fetchCoordinators();
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdatingStatusId(null);
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
                                            <div className='flex justify-end gap-2'>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() =>
                                                        handleToggleStatus(coord)
                                                    }
                                                    disabled={
                                                        updatingStatusId ===
                                                        coord.staff_id
                                                    }
                                                >
                                                    {updatingStatusId ===
                                                    coord.staff_id
                                                        ? 'Updating...'
                                                        : coord.User
                                                                ?.account_status ===
                                                            'Active'
                                                          ? 'Deactivate'
                                                          : 'Activate'}
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() =>
                                                        handleDelete(coord.staff_id)
                                                    }
                                                >
                                                    <Trash2 className='w-4 h-4 text-red-500' />
                                                </Button>
                                            </div>
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

            {confirmDialog}
        </div>
    );
}



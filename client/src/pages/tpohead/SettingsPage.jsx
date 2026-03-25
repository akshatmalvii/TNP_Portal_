import React, {useState, useEffect} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '../../components/Card';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {Badge} from '../../components/Badge';
import {Switch} from '../../components/Switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../components/Dialog';
import {Lock, Mail, Bell, Shield, AlertCircle, CheckCircle} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';

export default function SettingsPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const [systemSettings, setSystemSettings] = useState({
        emailNotifications: true,
        dashboardRefresh: true,
        twoFactorAuth: false,
    });
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsSuccess, setSettingsSuccess] = useState('');

    const token = localStorage.getItem('token');
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {headers});
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data);
            } else {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setCurrentUser(JSON.parse(storedUser));
                }
            }
        } catch (err) {
            console.error('Error fetching user:', err);
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (
            !passwordForm.current ||
            !passwordForm.new ||
            !passwordForm.confirm
        ) {
            setPasswordError('All fields are required');
            return;
        }
        if (passwordForm.new !== passwordForm.confirm) {
            setPasswordError('New passwords do not match');
            return;
        }
        if (passwordForm.new.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        setSavingPassword(true);
        setPasswordError('');
        setPasswordSuccess('');

        try {
            const res = await fetch(`${API_BASE}/auth/change-password`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    currentPassword: passwordForm.current,
                    newPassword: passwordForm.new,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        'Failed to change password. Ensure the /auth/change-password endpoint is implemented in the backend.',
                );
            }

            setPasswordSuccess('Password changed successfully');
            setPasswordForm({current: '', new: '', confirm: ''});
            setTimeout(() => {
                setPasswordDialogOpen(false);
                setPasswordSuccess('');
            }, 2000);
        } catch (err) {
            setPasswordError(err.message);
        } finally {
            setSavingPassword(false);
        }
    };

    const handleSaveSettings = async () => {
        setSettingsSaving(true);
        setSettingsSuccess('');

        try {
            // This would typically save to a user preferences table
            // For now, we'll just update localStorage as a mock
            localStorage.setItem(
                'systemSettings',
                JSON.stringify(systemSettings),
            );
            setSettingsSuccess('Settings saved successfully');
            setTimeout(() => setSettingsSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
        } finally {
            setSettingsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className='p-6'>
                <p className='text-center py-8 text-gray-500'>Loading...</p>
            </div>
        );
    }

    return (
        <div className='p-6 space-y-6'>
            <div>
                <h1 className='text-3xl font-bold text-gray-900'>Settings</h1>
                <p className='text-gray-500 mt-1'>
                    Manage your account and system preferences
                </p>
            </div>

            {/* Account Information */}
            <Card className='border-0'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Shield className='w-5 h-5 text-blue-500' />
                        Account Information
                    </CardTitle>
                    <CardDescription>
                        Your TPO Head account details
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='text-sm font-medium text-gray-700'>
                                Email
                            </label>
                            <div className='mt-2 p-3 bg-gray-50 rounded-lg border'>
                                <p className='text-sm font-medium text-gray-900'>
                                    {currentUser?.email || '—'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className='text-sm font-medium text-gray-700'>
                                Role
                            </label>
                            <div className='mt-2 p-3 bg-gray-50 rounded-lg border'>
                                <Badge className='bg-indigo-100 text-indigo-700 border border-indigo-200'>
                                    {currentUser?.Role?.role_name || 'TPO Head'}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label className='text-sm font-medium text-gray-700'>
                                Account Status
                            </label>
                            <div className='mt-2 p-3 bg-gray-50 rounded-lg border'>
                                <Badge
                                    className={
                                        currentUser?.account_status === 'Active'
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                                    }
                                >
                                    {currentUser?.account_status || 'Active'}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label className='text-sm font-medium text-gray-700'>
                                Account Created
                            </label>
                            <div className='mt-2 p-3 bg-gray-50 rounded-lg border'>
                                <p className='text-sm text-gray-600'>
                                    {currentUser?.created_at
                                        ? new Date(
                                              currentUser.created_at,
                                          ).toLocaleDateString()
                                        : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className='border-0'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Lock className='w-5 h-5 text-red-500' />
                        Security
                    </CardTitle>
                    <CardDescription>
                        Protect your account with strong security settings
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <Button
                        variant='outline'
                        onClick={() => {
                            setPasswordError('');
                            setPasswordForm({
                                current: '',
                                new: '',
                                confirm: '',
                            });
                            setPasswordDialogOpen(true);
                        }}
                        className='flex items-center gap-2'
                    >
                        <Lock className='w-4 h-4' />
                        Change Password
                    </Button>

                    {/* Two Factor Authentication (Future Feature) */}
                    <div className='pt-4 border-t'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='font-medium text-gray-900'>
                                    Two-Factor Authentication
                                </p>
                                <p className='text-sm text-gray-500'>
                                    Add an extra layer of security to your
                                    account
                                </p>
                            </div>
                            <Switch
                                checked={systemSettings.twoFactorAuth}
                                onCheckedChange={(checked) => {
                                    setSystemSettings({
                                        ...systemSettings,
                                        twoFactorAuth: checked,
                                    });
                                }}
                                disabled
                            />
                        </div>
                        <p className='text-xs text-gray-400 mt-2'>
                            Coming soon
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* System Preferences */}
            <Card className='border-0'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Bell className='w-5 h-5 text-yellow-500' />
                        Preferences
                    </CardTitle>
                    <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='font-medium text-gray-900'>
                                Email Notifications
                            </p>
                            <p className='text-sm text-gray-500'>
                                Receive updates via email
                            </p>
                        </div>
                        <Switch
                            checked={systemSettings.emailNotifications}
                            onCheckedChange={(checked) => {
                                setSystemSettings({
                                    ...systemSettings,
                                    emailNotifications: checked,
                                });
                            }}
                        />
                    </div>

                    <div className='pt-4 border-t flex items-center justify-between'>
                        <div>
                            <p className='font-medium text-gray-900'>
                                Auto-refresh Dashboard
                            </p>
                            <p className='text-sm text-gray-500'>
                                Automatically refresh data every 5 minutes
                            </p>
                        </div>
                        <Switch
                            checked={systemSettings.dashboardRefresh}
                            onCheckedChange={(checked) => {
                                setSystemSettings({
                                    ...systemSettings,
                                    dashboardRefresh: checked,
                                });
                            }}
                        />
                    </div>

                    {settingsSuccess && (
                        <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm'>
                            <CheckCircle className='w-4 h-4' />
                            {settingsSuccess}
                        </div>
                    )}

                    <div className='pt-4 border-t'>
                        <Button
                            onClick={handleSaveSettings}
                            disabled={settingsSaving}
                        >
                            {settingsSaving ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* System Information */}
            <Card className='border-0'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <AlertCircle className='w-5 h-5 text-gray-500' />
                        System Information
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-sm'>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <p className='text-gray-500'>API Version</p>
                            <p className='font-medium text-gray-900'>v1</p>
                        </div>
                        <div>
                            <p className='text-gray-500'>Application Type</p>
                            <p className='font-medium text-gray-900'>
                                TNP Portal
                            </p>
                        </div>
                        <div>
                            <p className='text-gray-500'>Your Role</p>
                            <p className='font-medium text-gray-900'>
                                TPO Head
                            </p>
                        </div>
                        <div>
                            <p className='text-gray-500'>Environment</p>
                            <p className='font-medium text-gray-900'>
                                Production
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Change Password Dialog */}
            <Dialog
                open={passwordDialogOpen}
                onOpenChange={setPasswordDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>

                    <div className='space-y-4 py-4'>
                        {passwordError && (
                            <div className='p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center gap-2'>
                                <AlertCircle className='w-4 h-4' />
                                {passwordError}
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className='p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex items-center gap-2'>
                                <CheckCircle className='w-4 h-4' />
                                {passwordSuccess}
                            </div>
                        )}
                        <div>
                            <label className='text-sm font-medium'>
                                Current Password
                            </label>
                            <Input
                                type='password'
                                placeholder='••••••••'
                                value={passwordForm.current}
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        current: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <label className='text-sm font-medium'>
                                New Password
                            </label>
                            <Input
                                type='password'
                                placeholder='••••••••'
                                value={passwordForm.new}
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        new: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <label className='text-sm font-medium'>
                                Confirm New Password
                            </label>
                            <Input
                                type='password'
                                placeholder='••••••••'
                                value={passwordForm.confirm}
                                onChange={(e) =>
                                    setPasswordForm({
                                        ...passwordForm,
                                        confirm: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => setPasswordDialogOpen(false)}
                            disabled={savingPassword}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleChangePassword}
                            disabled={savingPassword}
                        >
                            {savingPassword ? 'Updating...' : 'Update Password'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

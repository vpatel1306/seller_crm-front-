import React from 'react';
import AppShell from '../components/layout/AppShell';
import AccountList from '../components/account/AccountList';

export default function AccountPage() {
    return (
        <AppShell>
            <div className="h-full">
                <AccountList isStandalone={true} />
            </div>
        </AppShell>
    );
}

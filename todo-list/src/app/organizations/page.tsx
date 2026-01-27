'use client';

import React, { useState } from 'react';
import { SidebarProvider } from '@/components/providers/SidebarProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { OrgList } from './components/OrgList';
import { PositionList } from './components/PositionList';
import { Organization } from '@/hooks/useOrganizations';

export default function OrganizationsPage() {
    const [selectedOrg, setSelectedOrg] = useState<Organization | undefined>(undefined);

    return (
        <div className="flex h-screen bg-[#F8F9FD] overflow-hidden font-jakarta">
            <SidebarProvider>
                <Sidebar />
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <TopNav />

                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-7xl mx-auto space-y-6">

                            {/* Breadcrumb */}
                            <div className="flex items-center text-sm text-slate-400 mb-6">
                                <span className="mr-2">Master</span>
                                <span className="mx-2">&gt;</span>
                                <span className="font-medium text-slate-800">Organisasi</span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Panel: Organization List */}
                                <OrgList
                                    onSelect={(org) => setSelectedOrg(org)}
                                    selectedOrgId={selectedOrg?.id}
                                />

                                {/* Right Panel: Position List */}
                                <PositionList
                                    selectedOrg={selectedOrg}
                                />
                            </div>

                        </div>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}

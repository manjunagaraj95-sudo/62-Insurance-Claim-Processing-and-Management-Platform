
import React, { useState, useEffect, createContext, useContext } from 'react';

// --- ROLES & Permissions ---
const ROLES = {
    POLICYHOLDER: 'Policyholder',
    CLAIMS_OFFICER: 'Claims Officer',
    FINANCE_TEAM: 'Finance Team',
    ADMIN: 'Admin',
};

const PERMISSIONS = {
    [ROLES.POLICYHOLDER]: ['VIEW_CLAIMS', 'SUBMIT_CLAIM', 'UPLOAD_DOCS'],
    [ROLES.CLAIMS_OFFICER]: ['VIEW_CLAIMS', 'REVIEW_CLAIM', 'APPROVE_REJECT_CLAIM', 'UPLOAD_DOCS', 'VIEW_AUDIT', 'EXPORT_DATA', 'EDIT_CLAIM_FIELDS'],
    [ROLES.FINANCE_TEAM]: ['VIEW_CLAIMS', 'SETTLE_CLAIM', 'VIEW_AUDIT', 'EXPORT_DATA'],
    [ROLES.ADMIN]: ['VIEW_CLAIMS', 'MANAGE_USERS', 'VIEW_AUDIT', 'APPROVE_REJECT_CLAIM', 'SETTLE_CLAIM', 'EXPORT_DATA', 'EDIT_CLAIM_FIELDS'],
};

// --- Claim Status Mapping & Colors ---
const CLAIM_STATUSES = {
    SUBMITTED: 'SUBMITTED',
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    SETTLED: 'SETTLED',
    UNDER_REVIEW: 'UNDER_REVIEW',
};

const STATUS_UI_MAP = {
    [CLAIM_STATUSES.SUBMITTED]: { label: 'Submitted', color: 'var(--info-color)', className: 'status-submitted' },
    [CLAIM_STATUSES.PENDING_VERIFICATION]: { label: 'Pending Verification', color: 'var(--warning-color)', className: 'status-pending_verification' },
    [CLAIM_STATUSES.PENDING_APPROVAL]: { label: 'Pending Approval', color: 'var(--warning-color)', className: 'status-pending_approval' },
    [CLAIM_STATUSES.APPROVED]: { label: 'Approved', color: 'var(--success-color)', className: 'status-approved' },
    [CLAIM_STATUSES.REJECTED]: { label: 'Rejected', color: 'var(--danger-color)', className: 'status-rejected' },
    [CLAIM_STATUSES.SETTLED]: { label: 'Settled', color: 'var(--primary-color)', className: 'status-settled' },
    [CLAIM_STATUSES.UNDER_REVIEW]: { label: 'Under Review', color: 'var(--secondary-color)', className: 'status-under_review' },
};

// --- Dummy Data Generation ---
const generateDummyData = () => {
    const claims = [
        {
            id: 'CLM001',
            policyNumber: 'POL987654',
            policyholder: 'Alice Smith',
            claimType: 'Auto Accident',
            submissionDate: '2023-10-20',
            amountRequested: 5000,
            status: CLAIM_STATUSES.APPROVED,
            description: 'Minor fender bender on Main Street. Damage to front bumper and headlight.',
            documents: ['report_CLM001.pdf', 'photos_CLM001.zip'],
            verificationNotes: 'All documents verified. Incident report matches policy details.',
            approvalNotes: 'Approved based on policy POL987654 coverage. Payment to be disbursed.',
            settlementAmount: 4800,
            settlementDate: '2023-11-15',
            lastUpdated: '2023-11-15',
            workflow: [
                { stage: 'Submission', status: 'completed', date: '2023-10-20', slaDue: '2023-10-22' },
                { stage: 'Verification', status: 'completed', date: '2023-10-25', slaDue: '2023-10-26' },
                { stage: 'Approval', status: 'completed', date: '2023-11-01', slaDue: '2023-11-03' },
                { stage: 'Settlement', status: 'active', date: '2023-11-01', slaDue: '2023-11-16' },
            ],
        },
        {
            id: 'CLM002',
            policyNumber: 'POL123456',
            policyholder: 'Bob Johnson',
            claimType: 'Home Burglary',
            submissionDate: '2023-11-01',
            amountRequested: 12000,
            status: CLAIM_STATUSES.PENDING_VERIFICATION,
            description: 'Break-in at residential property. Stolen electronics and jewelry.',
            documents: ['police_report_CLM002.pdf', 'inventory_CLM002.xlsx'],
            verificationNotes: '',
            approvalNotes: '',
            settlementAmount: null,
            settlementDate: null,
            lastUpdated: '2023-11-01',
            workflow: [
                { stage: 'Submission', status: 'completed', date: '2023-11-01', slaDue: '2023-11-03' },
                { stage: 'Verification', status: 'active', date: '2023-11-02', slaDue: '2023-11-08', slaBreach: true },
                { stage: 'Approval', status: 'pending', slaDue: '2023-11-10' },
                { stage: 'Settlement', status: 'pending', slaDue: '2023-11-18' },
            ],
        },
        {
            id: 'CLM003',
            policyNumber: 'POL789012',
            policyholder: 'Carol White',
            claimType: 'Health - Hospitalization',
            submissionDate: '2023-11-05',
            amountRequested: 3500,
            status: CLAIM_STATUSES.SUBMITTED,
            description: 'Emergency hospitalization for appendicitis.',
            documents: ['medical_bill_CLM003.pdf', 'diagnosis_CLM003.pdf'],
            verificationNotes: '',
            approvalNotes: '',
            settlementAmount: null,
            settlementDate: null,
            lastUpdated: '2023-11-05',
            workflow: [
                { stage: 'Submission', status: 'completed', date: '2023-11-05', slaDue: '2023-11-07' },
                { stage: 'Verification', status: 'pending', slaDue: '2023-11-10' },
                { stage: 'Approval', status: 'pending', slaDue: '2023-11-12' },
                { stage: 'Settlement', status: 'pending', slaDue: '2023-11-20' },
            ],
        },
        {
            id: 'CLM004',
            policyNumber: 'POL345678',
            policyholder: 'David Green',
            claimType: 'Property Damage - Fire',
            submissionDate: '2023-10-10',
            amountRequested: 25000,
            status: CLAIM_STATUSES.REJECTED,
            description: 'Minor kitchen fire, smoke damage to property.',
            documents: ['fire_report_CLM004.pdf', 'estimate_CLM004.pdf'],
            verificationNotes: 'Investigation revealed policy exclusion for negligence. Claim rejected.',
            approvalNotes: 'Rejected as per verification findings.',
            settlementAmount: null,
            settlementDate: null,
            lastUpdated: '2023-10-25',
            workflow: [
                { stage: 'Submission', status: 'completed', date: '2023-10-10', slaDue: '2023-10-12' },
                { stage: 'Verification', status: 'completed', date: '2023-10-18', slaDue: '2023-10-20' },
                { stage: 'Approval', status: 'completed', date: '2023-10-25', slaDue: '2023-10-27' },
                { stage: 'Settlement', status: 'skipped' },
            ],
        },
        {
            id: 'CLM005',
            policyNumber: 'POL901234',
            policyholder: 'Eva Brown',
            claimType: 'Auto Theft',
            submissionDate: '2023-11-10',
            amountRequested: 18000,
            status: CLAIM_STATUSES.UNDER_REVIEW,
            description: 'Vehicle stolen from residential driveway.',
            documents: ['police_report_CLM005.pdf', 'keys_affidavit_CLM005.pdf'],
            verificationNotes: 'Initial review complete. Awaiting additional surveillance footage from claimant.',
            approvalNotes: '',
            settlementAmount: null,
            settlementDate: null,
            lastUpdated: '2023-11-12',
            workflow: [
                { stage: 'Submission', status: 'completed', date: '2023-11-10', slaDue: '2023-11-12' },
                { stage: 'Verification', status: 'active', date: '2023-11-11', slaDue: '2023-11-15' },
                { stage: 'Approval', status: 'pending', slaDue: '2023-11-17' },
                { stage: 'Settlement', status: 'pending', slaDue: '2023-11-25' },
            ],
        },
        {
            id: 'CLM006',
            policyNumber: 'POL456789',
            policyholder: 'Frank Miller',
            claimType: 'Life Insurance',
            submissionDate: '2023-09-15',
            amountRequested: 100000,
            status: CLAIM_STATUSES.SETTLED,
            description: 'Death claim for policyholder Frank Miller.',
            documents: ['death_certificate_CLM006.pdf', 'beneficiary_form_CLM006.pdf'],
            verificationNotes: 'All documents valid. Beneficiary confirmed.',
            approvalNotes: 'Approved for full settlement.',
            settlementAmount: 100000,
            settlementDate: '2023-10-01',
            lastUpdated: '2023-10-01',
            workflow: [
                { stage: 'Submission', status: 'completed', date: '2023-09-15', slaDue: '2023-09-17' },
                { stage: 'Verification', status: 'completed', date: '2023-09-20', slaDue: '2023-09-22' },
                { stage: 'Approval', status: 'completed', date: '2023-09-25', slaDue: '2023-09-27' },
                { stage: 'Settlement', status: 'completed', date: '2023-10-01', slaDue: '2023-10-05' },
            ],
        },
        {
            id: 'CLM007',
            policyNumber: 'POL234567',
            policyholder: 'Grace Lee',
            claimType: 'Dental',
            submissionDate: '2023-11-08',
            amountRequested: 800,
            status: CLAIM_STATUSES.PENDING_APPROVAL,
            description: 'Routine dental check-up and filling.',
            documents: ['dental_bill_CLM007.pdf'],
            verificationNotes: 'Claim details match policy. Eligible for coverage.',
            approvalNotes: '',
            settlementAmount: null,
            settlementDate: null,
            lastUpdated: '2023-11-14',
            workflow: [
                { stage: 'Submission', status: 'completed', date: '2023-11-08', slaDue: '2023-11-10' },
                { stage: 'Verification', status: 'completed', date: '2023-11-12', slaDue: '2023-11-14' },
                { stage: 'Approval', status: 'active', date: '2023-11-14', slaDue: '2023-11-16' },
                { stage: 'Settlement', status: 'pending', slaDue: '2023-11-20' },
            ],
        },
    ];

    const users = [
        { id: 1, name: 'Policyholder User', role: ROLES.POLICYHOLDER, email: 'policy@example.com' },
        { id: 2, name: 'Claims Officer Admin', role: ROLES.CLAIMS_OFFICER, email: 'claims@example.com' },
        { id: 3, name: 'Finance Team Lead', role: ROLES.FINANCE_TEAM, email: 'finance@example.com' },
        { id: 4, name: 'System Admin', role: ROLES.ADMIN, email: 'admin@example.com' },
    ];

    const auditLogs = [
        { id: 'AL001', timestamp: '2023-11-15T10:30:00Z', user: 'Claims Officer Admin', action: 'Approved Claim', details: 'Claim CLM001 approved for settlement.', relatedId: 'CLM001' },
        { id: 'AL002', timestamp: '2023-11-02T14:15:00Z', user: 'Claims Officer Admin', action: 'Updated Claim Status', details: 'Claim CLM002 status changed to PENDING_VERIFICATION.', relatedId: 'CLM002' },
        { id: 'AL003', timestamp: '2023-11-01T09:00:00Z', user: 'Policyholder User', action: 'Submitted Claim', details: 'Claim CLM002 submitted by policyholder.', relatedId: 'CLM002' },
        { id: 'AL004', timestamp: '2023-10-25T11:45:00Z', user: 'Claims Officer Admin', action: 'Rejected Claim', details: 'Claim CLM004 rejected due to policy exclusion.', relatedId: 'CLM004' },
        { id: 'AL005', timestamp: '2023-11-12T16:20:00Z', user: 'Claims Officer Admin', action: 'Added Verification Note', details: 'Added note to CLM005: awaiting surveillance footage.', relatedId: 'CLM005' },
    ];

    return { claims, users, auditLogs };
};

const { claims: initialClaims, users: dummyUsers, auditLogs: dummyAuditLogs } = generateDummyData();

// --- Main Application Component ---
const App = () => {
    const [view, setView] = useState({ screen: 'LOGIN', params: {} });
    const [currentUser, setCurrentUser] = useState(null);
    const [claims, setClaims] = useState(initialClaims);
    const [auditLogs, setAuditLogs] = useState(dummyAuditLogs);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [showGlobalSearch, setShowGlobalSearch] = useState(false);
    const [filters, setFilters] = useState({ status: '', type: '' });
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [savedViews, setSavedViews] = useState([
        { id: 'sv1', name: 'My Open Claims', icon: '📝', criteria: { status: [CLAIM_STATUSES.PENDING_VERIFICATION, CLAIM_STATUSES.PENDING_APPROVAL, CLAIM_STATUSES.SUBMITTED, CLAIM_STATUSES.UNDER_REVIEW] } },
        { id: 'sv2', name: 'Approved & Settled', icon: '✅', criteria: { status: [CLAIM_STATUSES.APPROVED, CLAIM_STATUSES.SETTLED] } },
    ]);
    const [activeSavedView, setActiveSavedView] = useState(null); // stores id of active saved view

    useEffect(() => {
        // Simulate real-time updates for dashboard/claims list
        const interval = setInterval(() => {
            setClaims(prevClaims => prevClaims.map(claim => {
                // Example: randomly update an "under review" claim to "pending approval"
                if (claim.status === CLAIM_STATUSES.UNDER_REVIEW && Math.random() < 0.2) {
                    return { ...claim, status: CLAIM_STATUSES.PENDING_APPROVAL, lastUpdated: new Date().toISOString().slice(0, 10) };
                }
                return claim;
            }));
        }, 15000); // Every 15 seconds

        return () => clearInterval(interval);
    }, []);

    // --- Authentication and Authorization ---
    const login = (email, password) => {
        // Simple mock login
        const user = dummyUsers.find(u => u.email === email);
        if (user) {
            setCurrentUser(user);
            setView({ screen: 'DASHBOARD', params: {} });
            return true;
        }
        alert('Invalid credentials.');
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        setView({ screen: 'LOGIN', params: {} });
    };

    const canPerform = (permission) => {
        if (!currentUser) return false;
        return PERMISSIONS[currentUser?.role]?.includes(permission);
    };

    // --- Navigation ---
    const navigate = (screen, params = {}) => {
        setView({ screen, params });
        setShowGlobalSearch(false); // Close search when navigating
        setShowFilterPanel(false); // Close filter panel when navigating
    };

    // --- Global Search Handlers ---
    const toggleGlobalSearch = () => {
        setShowGlobalSearch(prev => !prev);
        setGlobalSearchTerm(''); // Clear search on open/close
    };

    const handleGlobalSearchChange = (e) => {
        setGlobalSearchTerm(e.target.value);
    };

    const handleGlobalSearchSelect = (itemId, screenType = 'CLAIM_DETAIL') => {
        navigate(screenType, { id: itemId });
        setShowGlobalSearch(false);
        setGlobalSearchTerm('');
    };

    const getGlobalSearchSuggestions = () => {
        if (!globalSearchTerm) return [];
        const term = globalSearchTerm.toLowerCase();
        const results = claims.filter(claim =>
            claim.id.toLowerCase().includes(term) ||
            claim.policyNumber.toLowerCase().includes(term) ||
            claim.policyholder.toLowerCase().includes(term) ||
            claim.claimType.toLowerCase().includes(term)
        ).slice(0, 5); // Limit suggestions
        return results.map(claim => ({ id: claim.id, label: `${claim.id} - ${claim.policyholder} (${claim.claimType})` }));
    };

    // --- Filter Handlers ---
    const toggleFilterPanel = () => {
        setShowFilterPanel(prev => !prev);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        // Optionally apply filters immediately or wait for an "Apply" button click
    };

    const applyFilters = () => {
        // This is where filtering logic would fully apply, for now, handle in getFilteredClaims
        setShowFilterPanel(false);
        // If applying a saved view, also set activeSavedView
        // setActiveSavedView(null); // Clear active saved view if custom filters applied
    };

    const clearFilters = () => {
        setFilters({ status: '', type: '' });
        setActiveSavedView(null);
        setShowFilterPanel(false);
    };

    const applySavedView = (viewId) => {
        const selectedView = savedViews.find(sv => sv.id === viewId);
        if (selectedView) {
            const newFilters = Object.entries(selectedView.criteria).reduce((acc, [key, value]) => {
                // Assuming value can be a single string or an array of strings
                acc[key] = Array.isArray(value) ? value.join(',') : value;
                return acc;
            }, {});
            setFilters(newFilters);
            setActiveSavedView(viewId);
        }
        setShowFilterPanel(false);
    };

    const getFilteredClaims = () => {
        let filtered = claims;

        // Apply global search if active (overrides list-specific search for simplicity)
        if (globalSearchTerm && view.screen === 'CLAIMS_LIST') {
            const term = globalSearchTerm.toLowerCase();
            filtered = filtered.filter(claim =>
                claim.id.toLowerCase().includes(term) ||
                claim.policyNumber.toLowerCase().includes(term) ||
                claim.policyholder.toLowerCase().includes(term) ||
                claim.claimType.toLowerCase().includes(term)
            );
        }

        if (filters.status) {
            const statusArray = filters.status.split(',');
            filtered = filtered.filter(claim => statusArray.includes(claim?.status));
        }
        if (filters.type) {
            filtered = filtered.filter(claim => claim?.claimType?.toLowerCase().includes(filters.type.toLowerCase()));
        }

        // Apply saved view criteria if active, but allow additional filters to narrow it down
        // (This logic might need adjustment based on how filters layer with saved views)
        if (activeSavedView) {
            const savedView = savedViews.find(sv => sv.id === activeSavedView);
            if (savedView?.criteria?.status) {
                const svStatusArray = Array.isArray(savedView.criteria.status) ? savedView.criteria.status : [savedView.criteria.status];
                filtered = filtered.filter(claim => svStatusArray.includes(claim?.status));
            }
            if (savedView?.criteria?.type) {
                filtered = filtered.filter(claim => claim?.claimType?.toLowerCase().includes(savedView.criteria.type.toLowerCase()));
            }
        }

        return filtered;
    };

    // --- Claim Actions (CRUD operations) ---
    const handleSubmitClaim = (newClaimData) => {
        const newClaim = {
            id: `CLM${String(claims.length + 1).padStart(3, '0')}`,
            policyNumber: newClaimData.policyNumber,
            policyholder: currentUser?.name || 'Policyholder', // Auto-populate
            claimType: newClaimData.claimType,
            submissionDate: new Date().toISOString().slice(0, 10),
            amountRequested: newClaimData.amountRequested,
            status: CLAIM_STATUSES.SUBMITTED,
            description: newClaimData.description,
            documents: newClaimData.documents || [],
            verificationNotes: '',
            approvalNotes: '',
            settlementAmount: null,
            settlementDate: null,
            lastUpdated: new Date().toISOString().slice(0, 10),
            workflow: [
                { stage: 'Submission', status: 'completed', date: new Date().toISOString().slice(0, 10), slaDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
                { stage: 'Verification', status: 'pending', slaDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
                { stage: 'Approval', status: 'pending', slaDue: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
                { stage: 'Settlement', status: 'pending', slaDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
            ],
        };
        setClaims(prevClaims => [...prevClaims, newClaim]);
        setAuditLogs(prevLogs => [...prevLogs, {
            id: `AL${String(prevLogs.length + 1).padStart(3, '0')}`,
            timestamp: new Date().toISOString(),
            user: currentUser?.name || 'Unknown',
            action: 'Submitted Claim',
            details: `Claim ${newClaim.id} submitted.`,
            relatedId: newClaim.id,
        }]);
        navigate('CLAIM_DETAIL', { id: newClaim.id });
    };

    const handleUpdateClaim = (updatedClaimData) => {
        setClaims(prevClaims => prevClaims.map(claim =>
            claim.id === updatedClaimData.id ? { ...claim, ...updatedClaimData, lastUpdated: new Date().toISOString().slice(0, 10) } : claim
        ));
        setAuditLogs(prevLogs => [...prevLogs, {
            id: `AL${String(prevLogs.length + 1).padStart(3, '0')}`,
            timestamp: new Date().toISOString(),
            user: currentUser?.name || 'Unknown',
            action: 'Updated Claim Details',
            details: `Claim ${updatedClaimData.id} details updated.`,
            relatedId: updatedClaimData.id,
        }]);
        navigate('CLAIM_DETAIL', { id: updatedClaimData.id });
    };

    const handleApproveRejectClaim = (claimId, newStatus, notes) => {
        if (!canPerform('APPROVE_REJECT_CLAIM')) return alert('You do not have permission to approve/reject claims.');

        setClaims(prevClaims => prevClaims.map(claim => {
            if (claim.id === claimId) {
                const updatedWorkflow = claim.workflow?.map(stage => {
                    if (stage.stage === 'Approval' && newStatus === CLAIM_STATUSES.APPROVED) {
                        return { ...stage, status: 'completed', date: new Date().toISOString().slice(0, 10) };
                    }
                    if (stage.stage === 'Approval' && newStatus === CLAIM_STATUSES.REJECTED) {
                        return { ...stage, status: 'completed', date: new Date().toISOString().slice(0, 10) }; // Mark approval stage as completed but outcome is rejected
                    }
                    return stage;
                });
                return {
                    ...claim,
                    status: newStatus,
                    approvalNotes: notes,
                    lastUpdated: new Date().toISOString().slice(0, 10),
                    workflow: updatedWorkflow || claim.workflow,
                };
            }
            return claim;
        }));
        setAuditLogs(prevLogs => [...prevLogs, {
            id: `AL${String(prevLogs.length + 1).padStart(3, '0')}`,
            timestamp: new Date().toISOString(),
            user: currentUser?.name || 'Unknown',
            action: newStatus === CLAIM_STATUSES.APPROVED ? 'Approved Claim' : 'Rejected Claim',
            details: `Claim ${claimId} ${newStatus === CLAIM_STATUSES.APPROVED ? 'approved' : 'rejected'}. Notes: ${notes}`,
            relatedId: claimId,
        }]);
        navigate('CLAIM_DETAIL', { id: claimId });
    };

    const handleSettleClaim = (claimId, settlementAmount) => {
        if (!canPerform('SETTLE_CLAIM')) return alert('You do not have permission to settle claims.');

        setClaims(prevClaims => prevClaims.map(claim => {
            if (claim.id === claimId) {
                const updatedWorkflow = claim.workflow?.map(stage => {
                    if (stage.stage === 'Settlement') {
                        return { ...stage, status: 'completed', date: new Date().toISOString().slice(0, 10) };
                    }
                    return stage;
                });
                return {
                    ...claim,
                    status: CLAIM_STATUSES.SETTLED,
                    settlementAmount: settlementAmount,
                    settlementDate: new Date().toISOString().slice(0, 10),
                    lastUpdated: new Date().toISOString().slice(0, 10),
                    workflow: updatedWorkflow || claim.workflow,
                };
            }
            return claim;
        }));
        setAuditLogs(prevLogs => [...prevLogs, {
            id: `AL${String(prevLogs.length + 1).padStart(3, '0')}`,
            timestamp: new Date().toISOString(),
            user: currentUser?.name || 'Unknown',
            action: 'Settled Claim',
            details: `Claim ${claimId} settled for ${settlementAmount}.`,
            relatedId: claimId,
        }]);
        navigate('CLAIM_DETAIL', { id: claimId });
    };

    // --- Helper for formatting dates ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // --- Screen Components ---

    const LoginScreen = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');

        const handleLoginSubmit = (e) => {
            e.preventDefault();
            login(email, password);
        };

        return (
            <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background-color)' }}>
                <div className="card" style={{ maxWidth: '400px', width: '100%', padding: 'var(--spacing-xl)' }}>
                    <h2 className="text-center" style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--primary-color)' }}>
                        Insurance Platform Login
                    </h2>
                    <form onSubmit={handleLoginSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="claims@example.com"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="password"
                                required
                            />
                        </div>
                        <button type="submit" className="button button-primary" style={{ width: '100%' }}>
                            Login
                        </button>
                    </form>
                    <div style={{ marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
                        <p>Try with: claims@example.com / password</p>
                        <p>Roles: Policyholder, Claims Officer, Finance Team, Admin</p>
                    </div>
                </div>
            </div>
        );
    };

    const DashboardScreen = () => {
        const totalClaims = claims.length;
        const claimsByStatus = claims.reduce((acc, claim) => {
            acc[claim?.status] = (acc[claim?.status] || 0) + 1;
            return acc;
        }, {});

        const recentActivities = auditLogs.slice(0, 5); // Display 5 most recent activities

        return (
            <div className="screen-container">
                <h2 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--dark-color)' }}>Dashboard</h2>

                <div className="card-grid" style={{ marginBottom: 'var(--spacing-xxl)' }}>
                    <div className="dashboard-card card animated-pulse" onClick={() => navigate('CLAIMS_LIST', { status: '' })}>
                        <h3 style={{ color: 'var(--primary-color)' }}>{totalClaims}</h3>
                        <p>Total Claims</p>
                    </div>
                    {Object.entries(CLAIM_STATUSES).map(([key, value]) => {
                        const statusInfo = STATUS_UI_MAP[value];
                        const count = claimsByStatus[value] || 0;
                        if (!statusInfo) return null;
                        return (
                            <div
                                key={key}
                                className="dashboard-card card"
                                style={{ borderColor: statusInfo?.color, borderLeft: `5px solid ${statusInfo?.color}` }}
                                onClick={() => navigate('CLAIMS_LIST', { status: value })}
                            >
                                <h3 style={{ color: statusInfo?.color }}>{count}</h3>
                                <p>{statusInfo?.label} Claims</p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid-2-cols" style={{ marginBottom: 'var(--spacing-xxl)' }}>
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-lg)' }}>Claim Volume Trends <span className="icon icon-chart-line"></span></h3>
                        <div style={{ height: '200px', background: 'var(--light-color)', borderRadius: 'var(--border-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-color)' }}>
                            <p>Line Chart Placeholder (Weekly/Monthly Claim Submissions)</p>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-color)', textAlign: 'right', marginTop: 'var(--spacing-md)' }}>Real-time data update simulated</p>
                        <button className="button button-outline" style={{ marginTop: 'var(--spacing-md)' }}>Export to PDF</button>
                    </div>
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-lg)' }}>Processing Timelines <span className="icon icon-chart-bar"></span></h3>
                        <div style={{ height: '200px', background: 'var(--light-color)', borderRadius: 'var(--border-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-color)' }}>
                            <p>Bar Chart Placeholder (Avg days per stage)</p>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-color)', textAlign: 'right', marginTop: 'var(--spacing-md)' }}>Real-time data update simulated</p>
                        <button className="button button-outline" style={{ marginTop: 'var(--spacing-md)' }}>Export to Excel</button>
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: 'var(--spacing-lg)' }}>Recent Activities</h3>
                    {recentActivities.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {recentActivities.map(activity => (
                                <li key={activity?.id} style={{ padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{activity?.user}: </span>
                                        {activity?.action} - {activity?.details}
                                    </div>
                                    <small style={{ color: 'var(--secondary-color)' }}>{new Date(activity?.timestamp).toLocaleString()}</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center" style={{ color: 'var(--secondary-color)' }}>No recent activities.</p>
                    )}
                    {(canPerform('VIEW_AUDIT')) && (
                        <button onClick={() => navigate('AUDIT_LOGS')} className="button button-secondary" style={{ marginTop: 'var(--spacing-md)' }}>View All Audit Logs</button>
                    )}
                </div>
            </div>
        );
    };

    const ClaimCard = ({ claim }) => {
        const statusInfo = STATUS_UI_MAP[claim?.status] || { label: claim?.status, color: 'var(--secondary-color)', className: '' };
        const isOfficer = canPerform('REVIEW_CLAIM');
        const isFinance = canPerform('SETTLE_CLAIM');

        return (
            <div className="card" onClick={() => navigate('CLAIM_DETAIL', { id: claim?.id })}>
                <div className="card-header">
                    <h4 className="card-title">{claim?.id} - {claim?.policyholder}</h4>
                    <span className={`status-badge ${statusInfo?.className}`} style={{ backgroundColor: statusInfo?.color }}>
                        {statusInfo?.label}
                    </span>
                </div>
                <div className="card-body">
                    <p><strong>Policy:</strong> {claim?.policyNumber}</p>
                    <p><strong>Type:</strong> {claim?.claimType}</p>
                    <p><strong>Amount:</strong> ${claim?.amountRequested?.toLocaleString()}</p>
                    <p><strong>Submitted:</strong> {formatDate(claim?.submissionDate)}</p>
                </div>
                {(isOfficer || isFinance) && (
                    <div className="card-actions">
                        {isOfficer && (claim.status === CLAIM_STATUSES.PENDING_VERIFICATION || claim.status === CLAIM_STATUSES.PENDING_APPROVAL || claim.status === CLAIM_STATUSES.UNDER_REVIEW) && (
                            <button className="card-action-btn icon icon-approve" onClick={(e) => { e.stopPropagation(); handleApproveRejectClaim(claim?.id, CLAIM_STATUSES.APPROVED, 'Approved via quick action.'); }}>Approve</button>
                        )}
                        {isOfficer && (claim.status === CLAIM_STATUSES.PENDING_VERIFICATION || claim.status === CLAIM_STATUSES.PENDING_APPROVAL || claim.status === CLAIM_STATUSES.UNDER_REVIEW) && (
                            <button className="card-action-btn icon icon-reject" style={{ color: 'var(--danger-color)' }} onClick={(e) => { e.stopPropagation(); handleApproveRejectClaim(claim?.id, CLAIM_STATUSES.REJECTED, 'Rejected via quick action.'); }}>Reject</button>
                        )}
                        {isFinance && claim.status === CLAIM_STATUSES.APPROVED && (
                            <button className="card-action-btn icon icon-settle" onClick={(e) => { e.stopPropagation(); handleSettleClaim(claim?.id, claim?.amountRequested); }}>Settle</button>
                        )}
                        {canPerform('EDIT_CLAIM_FIELDS') && (
                            <button className="card-action-btn icon icon-edit" onClick={(e) => { e.stopPropagation(); navigate('CLAIM_EDIT', { id: claim?.id }); }}>Edit</button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const ClaimsListScreen = () => {
        const displayedClaims = getFilteredClaims();
        const hasBulkActions = canPerform('APPROVE_REJECT_CLAIM') || canPerform('SETTLE_CLAIM');

        return (
            <div className="screen-container">
                <div className="list-header">
                    <h2 style={{ color: 'var(--dark-color)' }}>Claim List</h2>
                    <div className="list-actions">
                        {canPerform('SUBMIT_CLAIM') && (
                            <button onClick={() => navigate('SUBMIT_CLAIM')} className="button button-primary icon icon-submit">
                                Submit New Claim
                            </button>
                        )}
                        {canPerform('EXPORT_DATA') && (
                             <button className="button button-outline icon icon-download">Export Claims</button>
                        )}
                        {hasBulkActions && (
                            <button className="button button-secondary">Bulk Actions (Approve/Reject)</button>
                        )}
                        <button onClick={toggleFilterPanel} className="button button-icon icon icon-filter">
                            Filters
                        </button>
                    </div>
                </div>

                <div className="saved-views">
                    {savedViews.map(viewItem => (
                        <button
                            key={viewItem?.id}
                            className={`saved-view-item ${activeSavedView === viewItem.id ? 'active' : ''}`}
                            onClick={() => applySavedView(viewItem.id)}
                        >
                            <span className="icon">{viewItem.icon}</span>{viewItem.name}
                        </button>
                    ))}
                    <button className="saved-view-item" onClick={() => { /* Add logic to save current filters as a new view */ }}>
                        <span className="icon">⭐</span> Save Current View
                    </button>
                </div>

                {displayedClaims.length > 0 ? (
                    <div className="card-grid">
                        {displayedClaims.map(claim => (
                            <ClaimCard key={claim?.id} claim={claim} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center" style={{ padding: 'var(--spacing-xxl)', color: 'var(--secondary-color)' }}>
                        <p style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-lg)' }}>No Claims Found</p>
                        <p style={{ marginBottom: 'var(--spacing-lg)' }}>Adjust your filters or submit a new claim.</p>
                        {canPerform('SUBMIT_CLAIM') && (
                            <button onClick={() => navigate('SUBMIT_CLAIM')} className="button button-primary">
                                Submit New Claim
                            </button>
                        )}
                    </div>
                )}

                {showFilterPanel && (
                    <div className="filter-panel open">
                        <div className="filter-panel-header">
                            <h3>Filters</h3>
                            <button onClick={toggleFilterPanel} className="button button-icon icon icon-close"></button>
                        </div>
                        <div className="filter-panel-content">
                            <div className="form-group">
                                <label htmlFor="filterStatus">Status:</label>
                                <select
                                    id="filterStatus"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    {Object.entries(CLAIM_STATUSES).map(([key, value]) => (
                                        <option key={key} value={value}>{STATUS_UI_MAP[value]?.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="filterType">Claim Type:</label>
                                <input
                                    type="text"
                                    id="filterType"
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    placeholder="e.g., Auto Accident"
                                />
                            </div>
                            {/* Add more filter options as needed: policyholder, date range etc. */}
                        </div>
                        <div className="filter-panel-actions">
                            <button onClick={clearFilters} className="button button-outline">Clear Filters</button>
                            <button onClick={applyFilters} className="button button-primary">Apply Filters</button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const ClaimDetailScreen = () => {
        const claimId = view?.params?.id;
        const claim = claims.find(c => c?.id === claimId);

        if (!claim) {
            return (
                <div className="screen-container text-center">
                    <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Claim Not Found</h2>
                    <p style={{ marginBottom: 'var(--spacing-lg)' }}>The claim with ID "{claimId}" does not exist.</p>
                    <button onClick={() => navigate('CLAIMS_LIST')} className="button button-primary">Back to Claims List</button>
                </div>
            );
        }

        const statusInfo = STATUS_UI_MAP[claim?.status] || { label: claim?.status, color: 'var(--secondary-color)', className: '' };
        const currentRole = currentUser?.role;

        return (
            <div className="screen-container">
                <h2 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--dark-color)' }}>Claim Details: {claim?.id}</h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <span className={`status-badge ${statusInfo?.className}`} style={{ backgroundColor: statusInfo?.color }}>
                            {statusInfo?.label}
                        </span>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--secondary-color)' }}>
                            Last Updated: {formatDate(claim?.lastUpdated)}
                        </p>
                    </div>
                    <div>
                        {canPerform('EDIT_CLAIM_FIELDS') && claim.status !== CLAIM_STATUSES.SETTLED && claim.status !== CLAIM_STATUSES.REJECTED && (
                            <button onClick={() => navigate('CLAIM_EDIT', { id: claim?.id })} className="button button-outline icon icon-edit" style={{ marginRight: 'var(--spacing-md)' }}>Edit Claim</button>
                        )}
                        {canPerform('APPROVE_REJECT_CLAIM') && claim.status !== CLAIM_STATUSES.APPROVED && claim.status !== CLAIM_STATUSES.REJECTED && (
                            <>
                                <button onClick={() => handleApproveRejectClaim(claim?.id, CLAIM_STATUSES.APPROVED, prompt('Add approval notes:'))} className="button button-primary icon icon-approve" style={{ marginRight: 'var(--spacing-md)' }}>Approve</button>
                                <button onClick={() => handleApproveRejectClaim(claim?.id, CLAIM_STATUSES.REJECTED, prompt('Add rejection notes:'))} className="button button-danger icon icon-reject">Reject</button>
                            </>
                        )}
                        {canPerform('SETTLE_CLAIM') && claim.status === CLAIM_STATUSES.APPROVED && (
                            <button onClick={() => handleSettleClaim(claim?.id, prompt('Enter settlement amount:', claim?.amountRequested))} className="button button-primary icon icon-settle">Settle Claim</button>
                        )}
                    </div>
                </div>

                {/* Workflow Tracker */}
                <h3 style={{ marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)', color: 'var(--dark-color)' }}>Workflow Progress</h3>
                <div className="workflow-tracker">
                    {claim.workflow?.map((step, index) => {
                        const isCurrent = step.status === 'active';
                        const isCompleted = step.status === 'completed';
                        const isBreached = step.slaBreach;
                        const indicatorClass = isCompleted ? 'completed' : (isBreached ? 'breached' : (isCurrent ? 'active' : ''));
                        const slaText = step.slaDue ? (isBreached ? `SLA Breached: ${formatDate(step.slaDue)}` : `SLA Due: ${formatDate(step.slaDue)}`) : '';

                        return (
                            <div key={index} className="workflow-step">
                                <div className={`step-indicator ${indicatorClass}`}>{index + 1}</div>
                                <div className="workflow-step-details">
                                    <div className="step-title">{step.stage}</div>
                                    <div className="step-date">{step.date ? formatDate(step.date) : 'Pending'}</div>
                                    {step.slaDue && <div className={`step-sla ${isBreached ? 'breached' : ''}`}>{slaText}</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid-2-cols" style={{ marginTop: 'var(--spacing-lg)' }}>
                    {/* General Information */}
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>General Information</h3>
                        <p><strong>Policy Number:</strong> {claim?.policyNumber}</p>
                        <p><strong>Policyholder:</strong> {claim?.policyholder}</p>
                        <p><strong>Claim Type:</strong> {claim?.claimType}</p>
                        <p><strong>Submission Date:</strong> {formatDate(claim?.submissionDate)}</p>
                        <p><strong>Amount Requested:</strong> ${claim?.amountRequested?.toLocaleString()}</p>
                        <p><strong>Description:</strong> {claim?.description}</p>
                    </div>

                    {/* Processing Details */}
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>Processing Details</h3>
                        {(currentRole === ROLES.CLAIMS_OFFICER || currentRole === ROLES.ADMIN) && (
                            <div className="form-group">
                                <label>Verification Notes:</label>
                                <textarea
                                    value={claim?.verificationNotes || ''}
                                    readOnly={!canPerform('EDIT_CLAIM_FIELDS')}
                                    style={{ height: '80px' }}
                                    onChange={(e) => { /* Simulate inline editing if role allows */ console.log(e.target.value); }}
                                    placeholder="No verification notes yet."
                                ></textarea>
                            </div>
                        )}
                        {(currentRole === ROLES.CLAIMS_OFFICER || currentRole === ROLES.ADMIN) && (
                            <div className="form-group">
                                <label>Approval Notes:</label>
                                <textarea
                                    value={claim?.approvalNotes || ''}
                                    readOnly={!canPerform('EDIT_CLAIM_FIELDS')}
                                    style={{ height: '80px' }}
                                    onChange={(e) => { /* Simulate inline editing if role allows */ console.log(e.target.value); }}
                                    placeholder="No approval notes yet."
                                ></textarea>
                            </div>
                        )}
                        {claim.status === CLAIM_STATUSES.SETTLED && (
                            <>
                                <p><strong>Settlement Amount:</strong> ${claim?.settlementAmount?.toLocaleString()}</p>
                                <p><strong>Settlement Date:</strong> {formatDate(claim?.settlementDate)}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Documents and Related Records */}
                <div className="grid-2-cols" style={{ marginTop: 'var(--spacing-xl)' }}>
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>Supporting Documents</h3>
                        {claim.documents?.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {claim.documents.map((doc, index) => (
                                    <li key={index} style={{ padding: 'var(--spacing-xs) 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{doc}</span>
                                        <button className="button button-icon">View <span className="icon icon-chevron-right"></span></button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--secondary-color)' }}>No documents uploaded.</p>
                        )}
                        {canPerform('UPLOAD_DOCS') && (
                            <button className="button button-outline icon icon-upload" style={{ marginTop: 'var(--spacing-md)' }}>Upload New Document</button>
                        )}
                    </div>

                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>Related Records</h3>
                        <p style={{ color: 'var(--secondary-color)' }}>
                            Policy {claim?.policyNumber} (View Policy Details)
                        </p>
                        {/* More related items like past claims for the same policyholder */}
                        <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--secondary-color)' }}>
                            Policyholder: {claim?.policyholder} (View Policyholder Profile)
                        </p>
                    </div>
                </div>

                {/* Audit Trail for this specific claim */}
                {canPerform('VIEW_AUDIT') && (
                    <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
                        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>Claim Audit Trail</h3>
                        <table className="audit-log-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.filter(log => log?.relatedId === claim?.id).map(log => (
                                    <tr key={log?.id}>
                                        <td>{new Date(log?.timestamp).toLocaleString()}</td>
                                        <td>{log?.user}</td>
                                        <td>{log?.action}</td>
                                        <td>{log?.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const ClaimFormScreen = ({ type }) => {
        const isEdit = type === 'edit';
        const claimId = view?.params?.id;
        const existingClaim = isEdit ? claims.find(c => c?.id === claimId) : null;

        const [policyNumber, setPolicyNumber] = useState(existingClaim?.policyNumber || '');
        const [claimType, setClaimType] = useState(existingClaim?.claimType || '');
        const [amountRequested, setAmountRequested] = useState(existingClaim?.amountRequested || '');
        const [description, setDescription] = useState(existingClaim?.description || '');
        const [documents, setDocuments] = useState(existingClaim?.documents || []);
        const [formErrors, setFormErrors] = useState({});

        const validateForm = () => {
            const errors = {};
            if (!policyNumber) errors.policyNumber = 'Policy Number is mandatory.';
            if (!claimType) errors.claimType = 'Claim Type is mandatory.';
            if (!amountRequested || isNaN(amountRequested) || amountRequested <= 0) errors.amountRequested = 'Amount must be a positive number.';
            if (!description) errors.description = 'Description is mandatory.';
            setFormErrors(errors);
            return Object.keys(errors).length === 0;
        };

        const handleFileChange = (e) => {
            const files = Array.from(e.target.files).map(file => file.name); // Simulate file names
            setDocuments(prev => [...prev, ...files]);
        };

        const handleRemoveFile = (fileName) => {
            setDocuments(prev => prev.filter(name => name !== fileName));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!validateForm()) return;

            const claimData = {
                policyNumber,
                claimType,
                amountRequested: parseFloat(amountRequested),
                description,
                documents,
            };

            if (isEdit) {
                handleUpdateClaim({ ...existingClaim, ...claimData });
            } else {
                handleSubmitClaim(claimData);
            }
        };

        if (isEdit && !existingClaim) {
            return (
                <div className="screen-container text-center">
                    <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Claim Not Found</h2>
                    <p style={{ marginBottom: 'var(--spacing-lg)' }}>The claim with ID "{claimId}" does not exist for editing.</p>
                    <button onClick={() => navigate('CLAIMS_LIST')} className="button button-primary">Back to Claims List</button>
                </div>
            );
        }

        return (
            <div className="screen-container">
                <h2 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--dark-color)' }}>{isEdit ? `Edit Claim: ${claimId}` : 'Submit New Claim'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="policyNumber">Policy Number <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                        <input
                            type="text"
                            id="policyNumber"
                            value={policyNumber}
                            onChange={(e) => setPolicyNumber(e.target.value)}
                            readOnly={isEdit && !canPerform('ADMIN')} // Example: Admin can edit policy number, others cannot after submission
                            required
                        />
                        {formErrors.policyNumber && <p className="error-message">{formErrors.policyNumber}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="claimType">Claim Type <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                        <select
                            id="claimType"
                            value={claimType}
                            onChange={(e) => setClaimType(e.target.value)}
                            required
                        >
                            <option value="">Select a type</option>
                            <option value="Auto Accident">Auto Accident</option>
                            <option value="Home Burglary">Home Burglary</option>
                            <option value="Health - Hospitalization">Health - Hospitalization</option>
                            <option value="Property Damage - Fire">Property Damage - Fire</option>
                            <option value="Auto Theft">Auto Theft</option>
                            <option value="Life Insurance">Life Insurance</option>
                            <option value="Dental">Dental</option>
                        </select>
                        {formErrors.claimType && <p className="error-message">{formErrors.claimType}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="amountRequested">Amount Requested <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                        <input
                            type="number"
                            id="amountRequested"
                            value={amountRequested}
                            onChange={(e) => setAmountRequested(e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                        />
                        {formErrors.amountRequested && <p className="error-message">{formErrors.amountRequested}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="5"
                            required
                        ></textarea>
                        {formErrors.description && <p className="error-message">{formErrors.description}</p>}
                    </div>
                    <div className="form-group">
                        <label>Supporting Documents</label>
                        <div className="file-upload-area" onClick={() => document.getElementById('file-upload-input')?.click()}>
                            <span className="icon icon-upload"></span> Drag & drop or click to upload files
                            <input
                                type="file"
                                id="file-upload-input"
                                multiple
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                        {documents.length > 0 && (
                            <div className="file-list">
                                {documents.map((doc, index) => (
                                    <div key={index} className="uploaded-file">
                                        <span>{doc}</span>
                                        <button type="button" onClick={() => handleRemoveFile(doc)}>&times;</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="button button-primary">
                            {isEdit ? 'Update Claim' : 'Submit Claim'}
                        </button>
                        <button type="button" onClick={() => navigate('CLAIMS_LIST')} className="button button-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const AuditLogsScreen = () => {
        // Filter audit logs based on user's role if needed (e.g., policyholder only sees their claims' logs)
        const relevantLogs = canPerform('VIEW_AUDIT') ? auditLogs : [];

        if (relevantLogs.length === 0) {
            return (
                <div className="screen-container text-center">
                    <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Audit Logs</h2>
                    <p style={{ marginBottom: 'var(--spacing-lg)' }}>No audit logs available or you do not have permission to view them.</p>
                    <button onClick={() => navigate('DASHBOARD')} className="button button-primary">Back to Dashboard</button>
                </div>
            );
        }

        return (
            <div className="screen-container">
                <h2 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--dark-color)' }}>Audit Logs (Immutable Trail)</h2>
                <table className="audit-log-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>Related ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {relevantLogs.map(log => (
                            <tr key={log?.id}>
                                <td>{new Date(log?.timestamp).toLocaleString()}</td>
                                <td>{log?.user}</td>
                                <td>{log?.action}</td>
                                <td>{log?.details}</td>
                                <td>
                                    {log?.relatedId ? (
                                        <a href="#" onClick={() => navigate('CLAIM_DETAIL', { id: log?.relatedId })} style={{ textDecoration: 'underline' }}>
                                            {log?.relatedId}
                                        </a>
                                    ) : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const NotFoundScreen = () => (
        <div className="screen-container text-center">
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>404 - Page Not Found</h2>
            <p style={{ marginBottom: 'var(--spacing-lg)' }}>The screen you are trying to access does not exist.</p>
            <button onClick={() => navigate('DASHBOARD')} className="button button-primary">Go to Dashboard</button>
        </div>
    );

    // --- Conditional Screen Rendering ---
    const renderScreen = () => {
        if (!currentUser) return <LoginScreen />;

        switch (view.screen) {
            case 'DASHBOARD':
                return canPerform('VIEW_CLAIMS') ? <DashboardScreen /> : <p className="screen-container text-center">Access Denied.</p>;
            case 'CLAIMS_LIST':
                return canPerform('VIEW_CLAIMS') ? <ClaimsListScreen /> : <p className="screen-container text-center">Access Denied.</p>;
            case 'CLAIM_DETAIL':
                return canPerform('VIEW_CLAIMS') ? <ClaimDetailScreen /> : <p className="screen-container text-center">Access Denied.</p>;
            case 'SUBMIT_CLAIM':
                return canPerform('SUBMIT_CLAIM') ? <ClaimFormScreen type="submit" /> : <p className="screen-container text-center">Access Denied.</p>;
            case 'CLAIM_EDIT':
                return canPerform('EDIT_CLAIM_FIELDS') ? <ClaimFormScreen type="edit" /> : <p className="screen-container text-center">Access Denied.</p>;
            case 'AUDIT_LOGS':
                return canPerform('VIEW_AUDIT') ? <AuditLogsScreen /> : <p className="screen-container text-center">Access Denied.</p>;
            case 'LOGIN':
                return <LoginScreen />;
            default:
                return <NotFoundScreen />;
        }
    };

    // --- Breadcrumbs Logic ---
    const getBreadcrumbs = () => {
        const crumbs = [{ label: 'Dashboard', screen: 'DASHBOARD' }];
        switch (view.screen) {
            case 'CLAIMS_LIST':
                crumbs.push({ label: 'Claims List', screen: 'CLAIMS_LIST' });
                break;
            case 'CLAIM_DETAIL':
                crumbs.push({ label: 'Claims List', screen: 'CLAIMS_LIST' });
                crumbs.push({ label: `Claim ${view.params.id}`, screen: 'CLAIM_DETAIL', params: view.params });
                break;
            case 'SUBMIT_CLAIM':
                crumbs.push({ label: 'Claims List', screen: 'CLAIMS_LIST' });
                crumbs.push({ label: 'Submit New Claim', screen: 'SUBMIT_CLAIM' });
                break;
            case 'CLAIM_EDIT':
                crumbs.push({ label: 'Claims List', screen: 'CLAIMS_LIST' });
                crumbs.push({ label: `Claim ${view.params.id}`, screen: 'CLAIM_DETAIL', params: view.params });
                crumbs.push({ label: 'Edit Claim', screen: 'CLAIM_EDIT', params: view.params });
                break;
            case 'AUDIT_LOGS':
                crumbs.push({ label: 'Audit Logs', screen: 'AUDIT_LOGS' });
                break;
            default:
                break;
        }
        return crumbs;
    };

    return (
        <div className="App">
            {currentUser && (
                <>
                    <header className="header">
                        <h1 onClick={() => navigate('DASHBOARD')} style={{ cursor: 'pointer' }}>
                            Insurance Platform
                        </h1>
                        <div className="header-nav">
                            {canPerform('VIEW_CLAIMS') && (
                                <button
                                    onClick={() => navigate('DASHBOARD')}
                                    className={`nav-link ${view.screen === 'DASHBOARD' ? 'active' : ''}`}
                                >
                                    <span className="icon icon-dashboard"></span> Dashboard
                                </button>
                            )}
                            {canPerform('VIEW_CLAIMS') && (
                                <button
                                    onClick={() => navigate('CLAIMS_LIST')}
                                    className={`nav-link ${view.screen === 'CLAIMS_LIST' || view.screen === 'CLAIM_DETAIL' || view.screen === 'SUBMIT_CLAIM' || view.screen === 'CLAIM_EDIT' ? 'active' : ''}`}
                                >
                                    <span className="icon icon-claims"></span> Claims
                                </button>
                            )}
                            {canPerform('VIEW_AUDIT') && (
                                <button
                                    onClick={() => navigate('AUDIT_LOGS')}
                                    className={`nav-link ${view.screen === 'AUDIT_LOGS' ? 'active' : ''}`}
                                >
                                    <span className="icon icon-audit"></span> Audit Logs
                                </button>
                            )}
                            <button className="nav-link icon icon-search" onClick={toggleGlobalSearch}>
                                Search
                            </button>
                            <div className="user-info" onClick={() => setShowDropdown(prev => !prev)}>
                                <div className="user-avatar">{currentUser?.name?.charAt(0) || 'U'}</div>
                                <span>{currentUser?.name} ({currentUser?.role})</span>
                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <button onClick={logout}>Logout</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                    <div className="breadcrumbs">
                        {getBreadcrumbs().map((crumb, index) => (
                            <React.Fragment key={index}>
                                <button onClick={() => navigate(crumb?.screen, crumb?.params)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: 'inherit' }}>
                                    {crumb?.label}
                                </button>
                                {index < getBreadcrumbs().length - 1 && <span className="icon icon-chevron-right"></span>}
                            </React.Fragment>
                        ))}
                    </div>
                </>
            )}

            <main className="main-content">
                {renderScreen()}
            </main>

            {showGlobalSearch && (
                <div className={`global-search-container ${showGlobalSearch ? 'active' : ''}`}>
                    <div className="global-search-box">
                        <button onClick={toggleGlobalSearch} className="button button-icon icon icon-close" style={{ position: 'absolute', top: 'var(--spacing-sm)', right: 'var(--spacing-sm)' }}></button>
                        <input
                            type="text"
                            placeholder="Search Claims by ID, Policyholder, Policy #, Type..."
                            value={globalSearchTerm}
                            onChange={handleGlobalSearchChange}
                        />
                        {globalSearchTerm && getGlobalSearchSuggestions().length > 0 && (
                            <div className="search-suggestions">
                                {getGlobalSearchSuggestions().map(suggestion => (
                                    <div key={suggestion?.id} onClick={() => handleGlobalSearchSelect(suggestion?.id)}>
                                        {suggestion?.label}
                                    </div>
                                ))}
                            </div>
                        )}
                        {globalSearchTerm && getGlobalSearchSuggestions().length === 0 && (
                            <div style={{ padding: 'var(--spacing-sm)', color: 'var(--secondary-color)' }}>No suggestions found.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
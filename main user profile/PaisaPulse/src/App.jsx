import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LiveDemoBar, { DEMO_STEPS } from './components/LiveDemoBar';
import SimulatedStreamBar from './components/SimulatedStreamBar';
import AddTransactionModal from './components/AddTransactionModal';
import CSVImportModal from './components/CSVImportModal';
import AuthModal from './components/AuthModal';
import ManageCommitmentsModal from './components/ManageCommitmentsModal';
import NotificationDrawer from './components/NotificationDrawer';
import FloatingGuardianChat from './components/FloatingGuardianChat';
import OnboardingModal from './components/OnboardingModal';
import CanIAffordModal from './components/CanIAffordModal';
import WhyThisNumberModal from './components/WhyThisNumberModal';
import SupabaseConnectModal from './components/SupabaseConnectModal';

import DashboardView from './views/DashboardView';
import PaisaTwinView from './views/PaisaTwinView';
import TransactionsView from './views/TransactionsView';
import ForecastView from './views/ForecastView';
import ScenariosView from './views/ScenariosView';
import GuardianChatView from './views/GuardianChatView';
import InsightsView from './views/InsightsView';
import ActionsView from './views/ActionsView';
import { buildPaisaTwinModel } from './engine/paisaTwinEngine';
import { fetchUserFromSupabase } from './services/supabaseSync';

import { INITIAL_PERSONAS } from './engine/mockData';
import { 
  getActiveUser, 
  saveUserData, 
  logoutUser, 
  getDemoUser 
} from './engine/userStore';
import { 
  computeCurrentBalance,
  computeEmpiricalDailyBurn,
  deriveCommitments,
  calculateCashflowForecast, 
  calculateSafeToSpend, 
  detectDuplicateTransactions 
} from './engine/cashflowEngine';
import { globalLearningEngine } from './engine/learningEngine';
import { soundFX } from './engine/audioEffects';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // User Authentication & Session State (Persistent across sessions & accounts)
  const [currentUser, setCurrentUser] = useState(() => {
    return getActiveUser();
  });

  // Horizon selection (7, 14, 30 days)
  const [horizonDays, setHorizonDays] = useState(14);

  // Live Scenario Demonstration Engine
  const [demoBarOpen, setDemoBarOpen] = useState(true);
  const [currentDemoStepIndex, setCurrentDemoStepIndex] = useState(0);

  // What-if scenario modifiers
  const [activeScenario, setActiveScenario] = useState(null);

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState('login');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCanIAffordOpen, setIsCanIAffordOpen] = useState(false);
  const [isWhyThisNumberOpen, setIsWhyThisNumberOpen] = useState(false);
  const [isManageCommitmentsOpen, setIsManageCommitmentsOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Dynamic alerts list
  const [alerts, setAlerts] = useState([
    {
      id: 'alt_1',
      title: 'PG Rent Scheduled in 2 Days',
      message: '₹5,000 auto-debit on 23 Sep. Liquidity buffer is active.',
      severity: 'normal',
      actionLabel: 'View Commitments',
      actionId: 'com_1'
    },
    {
      id: 'alt_2',
      title: 'Weekend Spend Velocity High',
      message: 'Your food & leisure spend typically surges +31% on weekends.',
      severity: 'normal',
      actionLabel: 'View Financial DNA',
      actionId: 'insights'
    }
  ]);

  // Persist active user and sync all changes back to registered users registry
  useEffect(() => {
    if (currentUser && currentUser.email) {
      saveUserData(currentUser);
    }
  }, [currentUser]);

  // On initial mount: pull fresh data from Supabase if connected
  useEffect(() => {
    if (currentUser?.email) {
      fetchUserFromSupabase(currentUser.email).then(cloudUser => {
        if (cloudUser && (cloudUser.transactions?.length || cloudUser.upcomingCommitments?.length)) {
          setCurrentUser(prev => ({
            ...prev,
            ...cloudUser,
            transactions: cloudUser.transactions?.length ? cloudUser.transactions : prev.transactions,
            upcomingCommitments: cloudUser.upcomingCommitments?.length ? cloudUser.upcomingCommitments : prev.upcomingCommitments
          }));
        }
      }).catch(err => {
        console.debug('Initial Supabase fetch:', err);
      });
    }
  }, []);

  // SINGLE SOURCE OF TRUTH CALCULATIONS
  // 1. Current Balance = Initial Balance + sum(incomes) - sum(expenses)
  const calculatedBalance = useMemo(() => {
    return computeCurrentBalance(currentUser.initialBalance, currentUser.transactions || []);
  }, [currentUser.initialBalance, currentUser.transactions]);

  // 2. Average Daily Burn from variable transactions
  const empiricalDailyBurn = useMemo(() => {
    return computeEmpiricalDailyBurn(currentUser.transactions || []);
  }, [currentUser.transactions]);

  // 3. Merged Recurring Commitments
  const activeCommitments = useMemo(() => {
    return deriveCommitments(currentUser.transactions || [], currentUser.upcomingCommitments || []);
  }, [currentUser.transactions, currentUser.upcomingCommitments]);

  // 4. Merge demo step modifiers with active what-if simulation modifiers
  const effectiveModifiers = useMemo(() => {
    const demoMod = DEMO_STEPS[currentDemoStepIndex]?.stateModifiers || {};
    const scenarioMod = activeScenario?.modifiers || {};

    const combinedPaused = [
      ...(demoMod.pausedCommitmentIds || []),
      ...(scenarioMod.pausedCommitmentIds || [])
    ];

    return {
      incomeDelayDays: (demoMod.incomeDelayDays || 0) + (scenarioMod.incomeDelayDays || 0),
      immediateExpense: (demoMod.immediateExpense || 0) + (scenarioMod.immediateExpense || 0),
      burnRateMultiplier: (demoMod.burnRateMultiplier || 1) * (scenarioMod.burnRateMultiplier || 1),
      pausedCommitmentIds: Array.from(new Set(combinedPaused))
    };
  }, [currentDemoStepIndex, activeScenario]);

  // 5. Dynamic Forecast
  const forecastResult = useMemo(() => {
    return calculateCashflowForecast({
      currentBalance: calculatedBalance,
      upcomingIncome: currentUser.upcomingIncome || [],
      upcomingCommitments: activeCommitments,
      burnRateDaily: empiricalDailyBurn,
      horizonDays,
      safetyBuffer: currentUser.safetyBuffer || 3000,
      scenarioModifiers: effectiveModifiers
    });
  }, [calculatedBalance, currentUser.upcomingIncome, activeCommitments, empiricalDailyBurn, horizonDays, currentUser.safetyBuffer, effectiveModifiers]);

  // 6. Dynamic Safe-To-Spend
  const safeToSpendResult = useMemo(() => {
    return calculateSafeToSpend({
      currentBalance: calculatedBalance,
      upcomingIncome: currentUser.upcomingIncome || [],
      upcomingCommitments: activeCommitments,
      safetyBuffer: currentUser.safetyBuffer || 3000,
      scenarioModifiers: effectiveModifiers
    });
  }, [calculatedBalance, currentUser.upcomingIncome, activeCommitments, currentUser.safetyBuffer, effectiveModifiers]);

  // 7. PaisaTwin Digital Twin Model (Deterministic Single Source of Truth)
  const twinModel = useMemo(() => {
    return buildPaisaTwinModel({
      currentUser,
      calculatedBalance,
      empiricalDailyBurn,
      activeCommitments,
      forecastResult,
      safeToSpendResult
    });
  }, [currentUser, calculatedBalance, empiricalDailyBurn, activeCommitments, forecastResult, safeToSpendResult]);

  // Alert generation when shortfall detected
  useEffect(() => {
    if (forecastResult.riskLevel.label === 'Shortfall Risk') {
      const alreadyHasShortfallAlert = alerts.some(a => a.id === 'alt_shortfall');
      if (!alreadyHasShortfallAlert) {
        setAlerts(prev => [
          {
            id: 'alt_shortfall',
            title: 'Critical Shortfall Risk Detected!',
            message: `Projected minimum balance drops to ${forecastResult.minProjectedBalance < 0 ? `-₹${Math.abs(forecastResult.minProjectedBalance)}` : '₹' + forecastResult.minProjectedBalance} on 26 Sep. Immediate action required.`,
            severity: 'high',
            actionLabel: 'Review Protective Actions',
            actionId: 'actions'
          },
          ...prev
        ]);
        soundFX.playWarning();
      }
    }
  }, [forecastResult.riskLevel]);

  // ================= INPUT METHOD 1: MANUAL TRANSACTION =================
  const handleAddManualTransaction = (newTx) => {
    setCurrentUser(prev => {
      const updatedList = [newTx, ...(prev.transactions || [])];
      const withDupes = detectDuplicateTransactions(updatedList);
      return {
        ...prev,
        transactions: withDupes
      };
    });
  };

  // ================= INPUT METHOD 2: CSV IMPORT =================
  const handleCSVImportSuccess = (importedTransactions, detectedOpeningBalance) => {
    setCurrentUser(prev => {
      const combined = [...importedTransactions, ...(prev.transactions || [])];
      const withDupes = detectDuplicateTransactions(combined);
      return {
        ...prev,
        initialBalance: (detectedOpeningBalance !== undefined && detectedOpeningBalance !== null) ? detectedOpeningBalance : prev.initialBalance,
        transactions: withDupes
      };
    });
  };

  // ================= INPUT METHOD 3: SIMULATED ACCOUNT STREAM =================
  const handleSimulatedTransactionArrived = (simTx, meta) => {
    setCurrentUser(prev => {
      const updatedList = [simTx, ...(prev.transactions || [])];
      const withDupes = detectDuplicateTransactions(updatedList);
      return {
        ...prev,
        transactions: withDupes
      };
    });

    // Also pop a notification alert in drawer
    setAlerts(prev => [
      {
        id: `sim_alt_${Date.now()}`,
        title: meta.title,
        message: `${simTx.type === 'income' ? '+' : '-'}₹${simTx.amount} (${simTx.description}) arrived via ${simTx.paymentMethod}. Financial state dynamically updated.`,
        severity: simTx.amount >= 3000 ? 'high' : 'normal',
        actionLabel: 'View Transactions',
        actionId: 'transactions'
      },
      ...prev
    ]);
  };

  // Resolve duplicate transaction (remove, keep_both, merge)
  const handleResolveDuplicate = (txId, action) => {
    setCurrentUser(prev => {
      let updated = [...(prev.transactions || [])];
      if (action === 'remove' || action === 'merge') {
        updated = updated.filter(t => t.id !== txId);
      } else {
        updated = updated.map(t => t.id === txId ? { ...t, isDuplicateSuspect: false, duplicateDismissed: true } : t);
      }
      return {
        ...prev,
        transactions: updated
      };
    });
  };

  // Update existing transaction
  const handleUpdateTransaction = (txId, updates) => {
    setCurrentUser(prev => {
      const updated = (prev.transactions || []).map(t => 
        t.id === txId ? { ...t, ...updates } : t
      );
      return {
        ...prev,
        transactions: updated
      };
    });
  };

  // Delete transaction
  const handleDeleteTransaction = (txId) => {
    setCurrentUser(prev => {
      const updated = (prev.transactions || []).filter(t => t.id !== txId);
      return {
        ...prev,
        transactions: updated
      };
    });
  };

  // Login / Persona switch / Signup
  const handleLoginSuccess = ({ isDemo, personaKey, user }) => {
    if (user) {
      setCurrentUser(user);
    } else if (isDemo && personaKey) {
      const demoUser = getDemoUser(personaKey);
      setCurrentUser(demoUser);
    }
    setActiveTab('dashboard');
  };

  // Log Out active account
  const handleLogout = () => {
    soundFX.playClick();
    logoutUser();
    setAuthModalInitialMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  // Update financial profile (incomes, commitments, initial balance)
  const handleUpdateFinancialProfile = ({ initialBalance, safetyBuffer, upcomingIncome, upcomingCommitments }) => {
    setCurrentUser(prev => ({
      ...prev,
      initialBalance: initialBalance !== undefined ? initialBalance : prev.initialBalance,
      safetyBuffer: safetyBuffer !== undefined ? safetyBuffer : prev.safetyBuffer,
      upcomingIncome: upcomingIncome || [],
      upcomingCommitments: upcomingCommitments || []
    }));
  };

  // Demo step selector
  const handleSelectDemoStep = (stepIdx) => {
    setCurrentDemoStepIndex(stepIdx);
    if (stepIdx === 5) {
      setActiveTab('guardian');
    } else if (stepIdx === 6 || stepIdx === 7) {
      setActiveTab('actions');
    }
  };

  const handleResetDemo = () => {
    setCurrentDemoStepIndex(0);
    setActiveScenario(null);
    setActiveTab('dashboard');
  };

  // Apply protective mitigation action
  const handleApplyMitigation = (action) => {
    if (action.type === 'pause_subscription') {
      setActiveScenario(prev => ({
        ...prev,
        modifiers: {
          ...(prev?.modifiers || {}),
          pausedCommitmentIds: [...(prev?.modifiers?.pausedCommitmentIds || []), 'com_2']
        }
      }));
    } else if (action.type === 'cap_dining') {
      setActiveScenario(prev => ({
        ...prev,
        modifiers: {
          ...(prev?.modifiers || {}),
          burnRateMultiplier: 0.55
        }
      }));
    }
  };

  const pendingProtectionsCount = forecastResult.riskLevel.label === 'Shortfall Risk' ? 2 : 0;

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          soundFX.playClick();
          setActiveTab(tab);
        }}
        shortfallRisk={forecastResult.riskLevel.label}
        pendingActionsCount={pendingProtectionsCount}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header 
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenSupabase={() => setIsSupabaseModalOpen(true)}
          onLogout={handleLogout}
          onToggleDemoBar={() => setDemoBarOpen(!demoBarOpen)}
          demoBarOpen={demoBarOpen}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          unreadAlertCount={alerts.length}
          setActiveTab={setActiveTab}
        />

        <div className="page-content">
          {/* Active Views (Clean top of webpage) */}
          {activeTab === 'dashboard' && (
            <DashboardView 
              currentPersona={{
                ...currentUser,
                currentBalance: calculatedBalance,
                upcomingCommitments: activeCommitments
              }}
              forecastResult={forecastResult}
              safeToSpendResult={safeToSpendResult}
              twinModel={twinModel}
              onNavigateToPaisaTwin={() => setActiveTab('paisatwin')}
              onViewForecast={() => setActiveTab('forecast')}
              onViewCommitments={() => setActiveTab('actions')}
              onOpenGuardian={() => setActiveTab('guardian')}
              onOpenManageCommitments={() => setIsManageCommitmentsOpen(true)}
              onOpenCanIAfford={() => setIsCanIAffordOpen(true)}
              onOpenWhyThisNumber={() => setIsWhyThisNumberOpen(true)}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {activeTab === 'paisatwin' && (
            <PaisaTwinView 
              twinModel={twinModel}
              onOpenCanIAfford={() => setIsCanIAffordOpen(true)}
              onOpenWhyThisNumber={() => setIsWhyThisNumberOpen(true)}
              onNavigateToScenarios={() => setActiveTab('scenarios')}
              onNavigateToGuardianChat={() => setActiveTab('guardian')}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView 
              transactions={currentUser.transactions || []}
              onAddTransactionClick={() => setIsAddTxModalOpen(true)}
              onOpenCSVImport={() => setIsCSVModalOpen(true)}
              onResolveDuplicate={handleResolveDuplicate}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastView 
              forecastResult={forecastResult}
              safetyBuffer={currentUser.safetyBuffer || 3000}
              horizonDays={horizonDays}
              onHorizonChange={(days) => setHorizonDays(days)}
            />
          )}

          {activeTab === 'scenarios' && (
            <ScenariosView 
              currentPersona={{
                ...currentUser,
                currentBalance: calculatedBalance,
                burnRateDaily: empiricalDailyBurn,
                upcomingCommitments: activeCommitments
              }}
              onApplyScenario={(scen) => setActiveScenario(scen)}
              onResetScenario={() => setActiveScenario(null)}
              activeScenario={activeScenario}
            />
          )}

          {activeTab === 'guardian' && (
            <GuardianChatView 
              currentPersona={{
                ...currentUser,
                currentBalance: calculatedBalance,
                upcomingCommitments: activeCommitments
              }}
              forecastResult={forecastResult}
              safeToSpendResult={safeToSpendResult}
              activeScenario={activeScenario}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsView 
              currentPersona={{
                ...currentUser,
                currentBalance: calculatedBalance,
                transactions: currentUser.transactions || []
              }}
            />
          )}

          {activeTab === 'actions' && (
            <ActionsView 
              learningEngine={globalLearningEngine}
              forecastResult={forecastResult}
              safeToSpendResult={safeToSpendResult}
              onApplyMitigation={handleApplyMitigation}
              onRefreshState={() => setCurrentUser({ ...currentUser })}
            />
          )}

          {/* Interactive Simulation Stream & Live Demo Suite at Bottom */}
          <div style={{ marginTop: '48px', paddingTop: '28px', borderTop: '1px solid #EFE8DF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917' }}>
                  Interactive Simulation & Live Evaluation Suite
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#78716C' }}>
                  Simulate real-time streaming transactions or test the 8-step live shortfall scenario below.
                </p>
              </div>
              <button 
                className="btn-secondary"
                onClick={() => setDemoBarOpen(!demoBarOpen)}
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                {demoBarOpen ? 'Hide Scenario Tour' : 'Show Scenario Tour'}
              </button>
            </div>

            {/* Simulated Real-Time Account Stream Widget (Input Method 3) */}
            <SimulatedStreamBar 
              onSimulatedTransactionArrived={handleSimulatedTransactionArrived}
            />

            {/* 2D/3D Animated Storyboard Simulation Suite */}
            {demoBarOpen && (
              <LiveDemoBar 
                currentStepIndex={currentDemoStepIndex}
                onSelectStep={handleSelectDemoStep}
                onReset={handleResetDemo}
                currentUser={currentUser}
                calculatedBalance={calculatedBalance}
                safeToSpendResult={safeToSpendResult}
                activeCommitments={activeCommitments}
                safetyBuffer={currentUser.safetyBuffer || 3000}
              />
            )}
          </div>
        </div>
      </div>

      {/* Input Method 1: Manual Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        onAddTransaction={handleAddManualTransaction}
        existingTransactions={currentUser.transactions || []}
      />

      {/* Input Method 2: CSV Import Modal with Column Mapping & Validation Preview */}
      <CSVImportModal 
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        existingTransactions={currentUser.transactions || []}
        onImportSuccess={handleCSVImportSuccess}
      />

      {/* Auth & Initial Balance Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalInitialMode}
      />

      {/* Financial Profile & Commitments Setup Modal */}
      <ManageCommitmentsModal 
        isOpen={isManageCommitmentsOpen}
        onClose={() => setIsManageCommitmentsOpen(false)}
        currentUser={currentUser}
        onUpdateFinancialProfile={handleUpdateFinancialProfile}
      />

      {/* 5-Step Guided Setup & Onboarding Modal */}
      <OnboardingModal 
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentUser={currentUser}
        onCompleteOnboarding={handleUpdateFinancialProfile}
        onOpenCSVImport={() => {
          setIsOnboardingOpen(false);
          setIsCSVModalOpen(true);
        }}
        onOpenAddTxModal={() => {
          setIsOnboardingOpen(false);
          setIsAddTxModalOpen(true);
        }}
      />

      {/* "Can I Afford This?" Instant Purchase Simulator */}
      <CanIAffordModal 
        isOpen={isCanIAffordOpen}
        onClose={() => setIsCanIAffordOpen(false)}
        currentBalance={calculatedBalance}
        upcomingIncome={currentUser.upcomingIncome || []}
        upcomingCommitments={activeCommitments}
        safetyBuffer={currentUser.safetyBuffer || 3000}
        burnRateDaily={empiricalDailyBurn}
      />

      {/* "Why This Number?" Transparent Calculation Breakdown */}
      <WhyThisNumberModal 
        isOpen={isWhyThisNumberOpen}
        onClose={() => setIsWhyThisNumberOpen(false)}
        safeToSpendResult={safeToSpendResult}
      />

      {/* Notification Drawer */}
      <NotificationDrawer 
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        alerts={alerts}
        onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
        onSelectAction={(actionId) => {
          if (actionId === 'actions') setActiveTab('actions');
          else if (actionId === 'insights') setActiveTab('insights');
          else setActiveTab('forecast');
        }}
      />

      {/* Supabase Database Connection & Cloud Sync Modal */}
      <SupabaseConnectModal 
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(updated) => setCurrentUser(updated)}
      />

      {/* Floating AI Guardian Chat Widget (Powered by Groq AI & Qwen) */}
      {activeTab !== 'guardian' && (
        <FloatingGuardianChat 
          currentPersona={{
            ...currentUser,
            currentBalance: calculatedBalance,
            upcomingCommitments: activeCommitments
          }}
          forecastResult={forecastResult}
          safeToSpendResult={safeToSpendResult}
          onOpenFullGuardian={() => setActiveTab('guardian')}
        />
      )}
    </div>
  );
}

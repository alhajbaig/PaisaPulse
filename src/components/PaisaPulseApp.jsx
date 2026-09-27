"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import LiveDemoBar, { DEMO_STEPS } from './LiveDemoBar';
import SimulatedStreamBar from './SimulatedStreamBar';
import AddTransactionModal from './AddTransactionModal';
import CSVImportModal from './CSVImportModal';
import AuthModal from './AuthModal';
import ManageCommitmentsModal from './ManageCommitmentsModal';
import NotificationDrawer from './NotificationDrawer';
import FloatingGuardianChat from './FloatingGuardianChat';
import OnboardingModal from './OnboardingModal';
import CanIAffordModal from './CanIAffordModal';
import WhyThisNumberModal from './WhyThisNumberModal';
import SupabaseConnectModal from './SupabaseConnectModal';
import SpendValueModal from './SpendValueModal';
import { saveSpendValueFeedback } from '../engine/spendValueEngine';

import DashboardView from '../views/DashboardView';
import PaisaTwinView from '../views/PaisaTwinView';
import TransactionsView from '../views/TransactionsView';
import ForecastView from '../views/ForecastView';
import ScenariosView from '../views/ScenariosView';
import GuardianChatView from '../views/GuardianChatView';
import InsightsView from '../views/InsightsView';
import ActionsView from '../views/ActionsView';
import { buildPaisaTwinModel } from '../engine/paisaTwinEngine';
import { 
  fetchUserFromSupabase, 
  subscribeToRealtimeSync, 
  deleteTransactionFromSupabase, 
  updateTransactionInSupabase, 
  insertTransactionToSupabase, 
  broadcastTransactionEvent 
} from '../services/supabaseSync';
import { getSupabase } from '../services/supabaseClient';

import { INITIAL_PERSONAS } from '../engine/mockData';
import { 
  getActiveUser, 
  saveUserData, 
  logoutUser, 
  getDemoUser,
  switchUserByEmail
} from '../engine/userStore';
import { 
  computeCurrentBalance,
  computeEmpiricalDailyBurn,
  deriveCommitments,
  calculateCashflowForecast, 
  calculateSafeToSpend, 
  detectDuplicateTransactions 
} from '../engine/cashflowEngine';
import { globalLearningEngine } from '../engine/learningEngine';
import { soundFX } from '../engine/audioEffects';
import { LanguageProvider, useLanguage } from '../services/i18n.jsx';

function PaisaPulseAppContent({ initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) return tabParam;
      const path = window.location.pathname.replace(/^\//, '').split('/')[0];
      if (path && ['insights', 'transactions', 'forecast', 'scenarios', 'twin', 'actions', 'chat'].includes(path)) {
        return path;
      }
    }
    return initialTab || 'dashboard';
  });
  
  // User Authentication & Session State (Persistent across sessions & accounts)
  const [currentUser, setCurrentUser] = useState(() => {
    return getActiveUser();
  });

  // Horizon selection (7, 14, 30 days)
  const [horizonDays, setHorizonDays] = useState(14);

  // Live Scenario Demonstration Engine
  const [demoBarOpen, setDemoBarOpen] = useState(false);
  const [currentDemoStepIndex, setCurrentDemoStepIndex] = useState(0);

  // What-if scenario modifiers
  const [activeScenario, setActiveScenario] = useState(null);

    const [isSyncing, setIsSyncing] = useState(false);

  // Manual sync triggered from Header button or quick-action
  const handleManualSync = async () => {
    if (!currentUser?.email) return;
    setIsSyncing(true);
    try {
      const fresh = await fetchUserFromSupabase(currentUser.email);
      if (fresh) {
        setCurrentUser(prev => {
          const currentTx = prev?.transactions || [];
          const cloudTx = fresh.transactions || [];
          const mergedTx = cloudTx.length > 0
            ? (currentTx.length > 0 ? [...cloudTx, ...currentTx.filter(lt => !cloudTx.some(ct => ct.id === lt.id))] : cloudTx)
            : currentTx;

          return {
            ...(prev || {}),
            ...fresh,
            id: fresh.id || prev?.id,
            transactions: mergedTx,
            upcomingCommitments: fresh.upcomingCommitments || prev?.upcomingCommitments || [],
            upcomingIncome: fresh.upcomingIncome || prev?.upcomingIncome || []
          };
        });
        soundFX.playSuccess();
      }
    } catch (e) {
      console.debug('Manual sync error:', e);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // 1-Click switch to Android phone account (kamal@gmail.com)
  const handleSwitchToPhoneAccount = async () => {
    setIsSyncing(true);
    try {
      const switched = await switchUserByEmail('kamal@gmail.com');
      if (switched) {
        setCurrentUser(switched);
        soundFX.playSuccess();
      }
    } catch (e) {
      console.error('Failed to switch to phone account:', e);
    } finally {
      setIsSyncing(false);
    }
  };

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
  const [isSpendValueModalOpen, setIsSpendValueModalOpen] = useState(false);

  // Spend Value Intelligence feedback handler
  const handleUpdateSpendValueFeedback = (clusterId, rating) => {
    const uid = currentUser?.id || currentUser?.email || 'default_user';
    saveSpendValueFeedback(uid, clusterId, rating);
    setCurrentUser(prev => ({
      ...prev,
      spendValueFeedbackUpdatedAt: Date.now()
    }));
  };

  // Dynamic alerts list (real-time alerts only, zero static demo alerts)
  const [alerts, setAlerts] = useState([]);

  // Persist active user and sync all changes back to registered users registry
  useEffect(() => {
    if (currentUser && currentUser.email) {
      saveUserData(currentUser);
    }
  }, [currentUser]);

  // On initial mount & session update: pull fresh data from Supabase and subscribe to live changes (Android app & cloud)
  useEffect(() => {
    if (!currentUser?.email) return;

    fetchUserFromSupabase(currentUser.email).then(cloudUser => {
      if (cloudUser) {
        setCurrentUser(prev => {
          const currentTx = prev?.transactions || [];
          const cloudTx = cloudUser.transactions || [];
          const mergedTx = cloudTx.length > 0
            ? (currentTx.length > 0 ? [...cloudTx, ...currentTx.filter(lt => !cloudTx.some(ct => ct.id === lt.id))] : cloudTx)
            : currentTx;

          return {
            ...(prev || {}),
            ...cloudUser,
            id: cloudUser.id, // Canonical Supabase UUID
            transactions: mergedTx,
            upcomingCommitments: cloudUser.upcomingCommitments || prev?.upcomingCommitments || [],
            upcomingIncome: cloudUser.upcomingIncome || prev?.upcomingIncome || []
          };
        });
      }
    }).catch(err => {
      console.debug('Initial Supabase fetch:', err);
    });

    // Instant bidirectional realtime synchronization (Phone <-> Website)
    const unsubscribe = subscribeToRealtimeSync(currentUser.email, currentUser.id, (change) => {
      if (change.table === 'transactions') {
        const action = (change.action || (change.eventType === 'DELETE' ? 'DELETE' : change.eventType === 'UPDATE' ? 'UPDATE' : 'CREATE')).toUpperCase();
        const tx = change.row;
        const oldId = change.old?.id || tx?.id;

        if (action === 'DELETE' && oldId) {
          setCurrentUser(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              transactions: (prev.transactions || []).filter(t => t.id !== oldId)
            };
          });
          soundFX.playPop();
          return;
        }

        if (tx) {
          setCurrentUser(prev => {
            if (!prev) return prev;
            const existing = prev.transactions || [];
            const exists = existing.some(t => t.id === tx.id);
            let updated;
            if (exists) {
              updated = existing.map(t => t.id === tx.id ? { ...t, ...tx } : t);
            } else {
              updated = [tx, ...existing];
            }
            return {
              ...prev,
              transactions: updated
            };
          });

          setAlerts(prev => [
            {
              id: `cloud_tx_${Date.now()}`,
              title: action === 'UPDATE' ? 'Mobile App Sync: Transaction Updated' : 'Mobile App Sync: Transaction Recorded',
              message: `${tx.type === 'income' ? '+' : '-'}₹${tx.amount} (${tx.description || tx.merchant || 'UPI Transfer'}) synchronized live.`,
              severity: 'normal',
              actionLabel: 'View Transactions',
              actionId: 'transactions'
            },
            ...prev
          ]);
          soundFX.playSuccess();
        }
      } else {
        // Incomes, commitments, or profile updated
        fetchUserFromSupabase(currentUser.email).then(freshUser => {
          if (freshUser) {
            setCurrentUser(prev => ({
              ...(prev || {}),
              ...freshUser,
              upcomingIncome: freshUser.upcomingIncome || prev?.upcomingIncome || [],
              upcomingCommitments: freshUser.upcomingCommitments || prev?.upcomingCommitments || []
            }));
          }
        }).catch(() => {});
      }
    });

    // Periodic background sync (every 8s) to ensure phone transactions and salary updates reflect without manual refresh
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && currentUser?.email) {
        fetchUserFromSupabase(currentUser.email).then(freshUser => {
          if (freshUser) {
            setCurrentUser(prev => {
              const prevTx = prev?.transactions || [];
              const cloudTx = freshUser.transactions || [];
              const txChanged = cloudTx.length !== prevTx.length || (cloudTx[0]?.id !== prevTx[0]?.id);
              const incomeChanged = JSON.stringify(freshUser.upcomingIncome || []) !== JSON.stringify(prev?.upcomingIncome || []);
              const comChanged = JSON.stringify(freshUser.upcomingCommitments || []) !== JSON.stringify(prev?.upcomingCommitments || []);

              if (txChanged || incomeChanged || comChanged) {
                return {
                  ...(prev || {}),
                  ...freshUser,
                  transactions: cloudTx.length > 0 ? cloudTx : prevTx,
                  upcomingIncome: freshUser.upcomingIncome || prev?.upcomingIncome || [],
                  upcomingCommitments: freshUser.upcomingCommitments || prev?.upcomingCommitments || []
                };
              }
              return prev;
            });
          }
        }).catch(() => {});
      }
    }, 8000);

    return () => {
      clearInterval(pollInterval);
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.email, currentUser?.id]);

  // Check auth and redirect if logged out
  useEffect(() => {
    if (!currentUser) {
      if (typeof window !== 'undefined') {
        const isLoggedOut = localStorage.getItem('paisapulse_logged_out') === 'true';
        if (isLoggedOut) {
          window.location.href = '/login';
          return;
        }
        const active = getActiveUser();
        if (active) {
          setCurrentUser(active);
        }
      }
    }
  }, [currentUser]);

  // SINGLE SOURCE OF TRUTH CALCULATIONS (Safe effective user)
  const effectiveUser = useMemo(() => {
    if (currentUser) return currentUser;
    return {
      id: '',
      name: 'User',
      email: '',
      role: 'Young Working Professional',
      avatar: 'U',
      avatarBg: '#EA580C',
      initialBalance: 0,
      safetyBuffer: 3000,
      burnRateDaily: 0,
      transactions: [],
      upcomingCommitments: [],
      upcomingIncome: []
    };
  }, [currentUser]);

  // 1. Current Balance = Initial Balance + sum(incomes) - sum(expenses)
  const calculatedBalance = useMemo(() => {
    return computeCurrentBalance(effectiveUser.initialBalance || 0, effectiveUser.transactions || []);
  }, [effectiveUser.initialBalance, effectiveUser.transactions]);

  // 2. Average Daily Burn from variable transactions
  const empiricalDailyBurn = useMemo(() => {
    return computeEmpiricalDailyBurn(effectiveUser.transactions || []);
  }, [effectiveUser.transactions]);

  // 3. Merged Recurring Commitments
  const activeCommitments = useMemo(() => {
    return deriveCommitments(effectiveUser.transactions || [], effectiveUser.upcomingCommitments || []);
  }, [effectiveUser.transactions, effectiveUser.upcomingCommitments]);

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
      upcomingIncome: effectiveUser.upcomingIncome || [],
      upcomingCommitments: activeCommitments,
      burnRateDaily: empiricalDailyBurn,
      horizonDays,
      safetyBuffer: effectiveUser.safetyBuffer || 3000,
      scenarioModifiers: effectiveModifiers
    });
  }, [calculatedBalance, effectiveUser.upcomingIncome, activeCommitments, empiricalDailyBurn, horizonDays, effectiveUser.safetyBuffer, effectiveModifiers]);

  // 6. Dynamic Safe-To-Spend
  const safeToSpendResult = useMemo(() => {
    return calculateSafeToSpend({
      currentBalance: calculatedBalance,
      upcomingIncome: effectiveUser.upcomingIncome || [],
      upcomingCommitments: activeCommitments,
      safetyBuffer: effectiveUser.safetyBuffer || 3000,
      scenarioModifiers: effectiveModifiers
    });
  }, [calculatedBalance, effectiveUser.upcomingIncome, activeCommitments, effectiveUser.safetyBuffer, effectiveModifiers]);

  // 7. PaisaTwin Digital Twin Model (Deterministic Single Source of Truth)
  const twinModel = useMemo(() => {
    return buildPaisaTwinModel({
      currentUser: effectiveUser,
      calculatedBalance,
      empiricalDailyBurn,
      activeCommitments,
      forecastResult,
      safeToSpendResult
    });
  }, [effectiveUser, calculatedBalance, empiricalDailyBurn, activeCommitments, forecastResult, safeToSpendResult]);

  // Alert generation when shortfall detected
  useEffect(() => {
    if (forecastResult?.riskLevel?.label === 'Shortfall Risk') {
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
  }, [forecastResult?.riskLevel]);

  // ================= INPUT METHOD 1: MANUAL TRANSACTION =================
  const handleAddManualTransaction = (newTx) => {
    const canonicalTx = {
      ...newTx,
      id: newTx.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    };

    setCurrentUser(prev => {
      const safePrev = prev || effectiveUser;
      const updatedList = [canonicalTx, ...(safePrev.transactions || [])];
      const withDupes = detectDuplicateTransactions(updatedList);
      const updated = {
        ...safePrev,
        transactions: withDupes
      };
      saveUserData(updated);
      return updated;
    });

    const uid = effectiveUser?.id;
    if (uid) {
      insertTransactionToSupabase(uid, canonicalTx);
      broadcastTransactionEvent(uid, 'CREATE', canonicalTx);
    }
  };

  // ================= INPUT METHOD 2: CSV IMPORT =================
  const handleCSVImportSuccess = (importedTransactions, detectedOpeningBalance) => {
    try {
      setCurrentUser(prev => {
        const safePrev = prev || effectiveUser;
        const combined = [...(importedTransactions || []), ...(safePrev.transactions || [])];
        const withDupes = detectDuplicateTransactions(combined);
        const updated = {
          ...safePrev,
          initialBalance: (detectedOpeningBalance !== undefined && detectedOpeningBalance !== null && !isNaN(detectedOpeningBalance)) 
            ? detectedOpeningBalance 
            : safePrev.initialBalance,
          transactions: withDupes
        };
        saveUserData(updated);
        return updated;
      });

      setAlerts(prev => [
        {
          id: `imp_alt_${Date.now()}`,
          title: `Successfully Imported ${importedTransactions.length} Transactions`,
          message: `Your ledger and cashflow trajectory have been dynamically updated with ${importedTransactions.length} new records.`,
          severity: 'normal',
          actionLabel: 'View Transactions',
          actionId: 'transactions'
        },
        ...prev
      ]);
      soundFX.playSuccess();
    } catch (err) {
      console.error('CSV Import execution error:', err);
    }
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

  // Update existing transaction with instant cloud propagation and Realtime broadcast
  const handleUpdateTransaction = (txId, updates) => {
    setCurrentUser(prev => {
      const updated = (prev?.transactions || []).map(t => 
        t.id === txId ? { ...t, ...updates } : t
      );
      return {
        ...(prev || {}),
        transactions: updated
      };
    });

    const uid = effectiveUser?.id;
    if (uid) {
      updateTransactionInSupabase(uid, txId, updates);
      broadcastTransactionEvent(uid, 'UPDATE', { id: txId, ...updates });
    }
  };

  // Delete transaction with instant cloud propagation and Realtime broadcast
  const handleDeleteTransaction = (txId) => {
    soundFX.playClick();
    setCurrentUser(prev => {
      const updated = (prev?.transactions || []).filter(t => t.id !== txId);
      return {
        ...(prev || {}),
        transactions: updated
      };
    });

    const uid = effectiveUser?.id;
    if (uid) {
      deleteTransactionFromSupabase(uid, txId);
      broadcastTransactionEvent(uid, 'DELETE', { id: txId });
    }
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
    try {
      getSupabase()?.auth?.signOut()?.catch(() => {});
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.href = '/login?logout=true';
    }
  };

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  // Update financial profile (incomes, commitments, initial balance)
  const handleUpdateFinancialProfile = ({ initialBalance, safetyBuffer, upcomingIncome, upcomingCommitments }) => {
    setCurrentUser(prev => {
      const updated = {
        ...prev,
        initialBalance: initialBalance !== undefined ? initialBalance : prev?.initialBalance,
        safetyBuffer: safetyBuffer !== undefined ? safetyBuffer : prev?.safetyBuffer,
        upcomingIncome: upcomingIncome !== undefined ? upcomingIncome : (prev?.upcomingIncome || []),
        upcomingCommitments: upcomingCommitments !== undefined ? upcomingCommitments : (prev?.upcomingCommitments || [])
      };
      saveUserData(updated);
      return updated;
    });
  };

  // Add upcoming bill / expense manually from Dashboard
  const handleAddCommitment = (commitment) => {
    soundFX.playClick();
    setCurrentUser(prev => {
      const newCom = {
        id: `com_${Date.now()}`,
        title: String(commitment.title || 'Upcoming Bill').trim(),
        amount: Math.abs(parseFloat(commitment.amount)) || 0,
        daysAway: parseInt(commitment.daysAway, 10) || 1,
        category: commitment.category || 'Utilities',
        essential: commitment.essential !== undefined ? commitment.essential : true,
        date: commitment.daysAway ? `In ${commitment.daysAway} days` : 'Scheduled',
        createdAt: new Date().toISOString()
      };
      const updated = {
        ...prev,
        upcomingCommitments: [...(prev.upcomingCommitments || []), newCom]
      };
      saveUserData(updated);
      return updated;
    });
  };

  // Delete upcoming bill / expense
  const handleDeleteCommitment = (commitmentId) => {
    soundFX.playClick();
    setCurrentUser(prev => {
      const updated = {
        ...prev,
        upcomingCommitments: (prev.upcomingCommitments || []).filter(c => c.id !== commitmentId)
      };
      saveUserData(updated);
      return updated;
    });
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
          activeTab={activeTab}
          onOpenAuthModal={handleOpenAuthModal}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenSupabase={() => setIsSupabaseModalOpen(true)}
          onLogout={handleLogout}
          onToggleDemoBar={() => setDemoBarOpen(!demoBarOpen)}
          demoBarOpen={demoBarOpen}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          unreadAlertCount={alerts.length}
          setActiveTab={setActiveTab}
          isSyncing={isSyncing}
          onManualSync={handleManualSync}
          onSwitchToPhoneAccount={handleSwitchToPhoneAccount}
        />

        <div className="page-content">
          {/* Active Views (Clean top of webpage) */}
          {activeTab === 'dashboard' && (
            <DashboardView 
              currentPersona={{
                ...currentUser,
                currentBalance: calculatedBalance,
                transactions: effectiveUser.transactions || [],
                upcomingCommitments: activeCommitments,
                upcomingIncome: effectiveUser.upcomingIncome || []
              }}
              forecastResult={forecastResult}
              safeToSpendResult={safeToSpendResult}
              twinModel={twinModel}
              horizonDays={horizonDays}
              onHorizonChange={(days) => setHorizonDays(days)}
              onNavigateToPaisaTwin={() => setActiveTab('paisatwin')}
              onViewForecast={() => setActiveTab('forecast')}
              onViewCommitments={() => setActiveTab('actions')}
              onNavigateToTransactions={() => setActiveTab('transactions')}
              onNavigateToScenarios={() => setActiveTab('scenarios')}
              onOpenAddTransaction={() => setIsAddTxModalOpen(true)}
              onOpenGuardian={() => setActiveTab('guardian')}
              onOpenManageCommitments={() => setIsManageCommitmentsOpen(true)}
              onOpenCanIAfford={() => setIsCanIAffordOpen(true)}
              onOpenWhyThisNumber={() => setIsWhyThisNumberOpen(true)}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onOpenSpendValueMap={() => setIsSpendValueModalOpen(true)}
              onAddCommitment={handleAddCommitment}
              onDeleteCommitment={handleDeleteCommitment}
              onUpdateFinancialProfile={handleUpdateFinancialProfile}
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
              transactions={effectiveUser.transactions || []}
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
              safetyBuffer={effectiveUser.safetyBuffer || 3000}
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
              twinModel={twinModel}
              onOpenSpendValueMap={() => setIsSpendValueModalOpen(true)}
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
                transactions: effectiveUser.transactions || []
              }}
              twinModel={twinModel}
              onOpenSpendValueMap={() => setIsSpendValueModalOpen(true)}
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
          <div className="mt-16 pt-8 border-t border-line-medium">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-accent uppercase tracking-widest text-ink-subtle font-bold block">
                  Simulation Suite
                </span>
                <h3 className="font-editorial text-2xl text-ink font-normal">
                  Interactive real-time transaction testing
                </h3>
              </div>
              <button 
                className="px-4 py-1.5 rounded-full bg-ivory border border-line-medium text-xs font-sans text-ink hover:border-line-dark transition-all"
                onClick={() => setDemoBarOpen(!demoBarOpen)}
              >
                {demoBarOpen ? 'Hide Tour' : 'Show Tour'}
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
                safetyBuffer={effectiveUser.safetyBuffer || 3000}
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
        existingTransactions={effectiveUser.transactions || []}
      />

      {/* Input Method 2: CSV Import Modal with Column Mapping & Validation Preview */}
      <CSVImportModal 
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        existingTransactions={effectiveUser.transactions || []}
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
        upcomingIncome={effectiveUser.upcomingIncome || []}
        upcomingCommitments={activeCommitments}
        safetyBuffer={effectiveUser.safetyBuffer || 3000}
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
          else if (actionId === 'transactions') setActiveTab('transactions');
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

      {/* Spend Value Intelligence: "What is Actually Worth Your Money?" Modal */}
      <SpendValueModal 
        isOpen={isSpendValueModalOpen}
        onClose={() => setIsSpendValueModalOpen(false)}
        currentUser={effectiveUser}
        onUpdateUserFeedback={handleUpdateSpendValueFeedback}
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

export default function PaisaPulseApp(props) {
  return (
    <LanguageProvider>
      <PaisaPulseAppContent {...props} />
    </LanguageProvider>
  );
}

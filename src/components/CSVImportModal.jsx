import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  FileCode,
  ArrowRight, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Sparkles,
  Download,
  Filter,
  Copy,
  RefreshCw,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  detectAndParseStatement, 
  autoDetectMappings, 
  validateAndNormalizeCSVRows 
} from '../engine/csvParser';
import { formatINR } from '../engine/cashflowEngine';
import { soundFX } from '../engine/audioEffects';

// Sample 1: HDFC Bank CSV
const SAMPLE_HDFC_CSV = `Txn_Date,Narration,Withdrawal_Amt,Deposit_Amt,Merchant_Name,Channel
2025-09-22,Swiggy Bangalore UPI,450.00,,Swiggy,UPI
2025-09-22,Uber Premier Ride,280.00,,Uber India,UPI
2025-09-21,Corporate Salary Payout,,35000.00,TCS Payroll,IMPS
2025-09-21,SBI ATM Cash Outflow,3000.00,,SBI ATM,Cash Withdrawal
2025-09-20,Zomato Late Night Canteen,350.00,,Zomato,UPI
2025-09-19,Amazon India Festival Order,1499.00,,Amazon,Debit Card
2025-09-18,Apollo Pharmacy Medicines,620.00,,Apollo Pharmacy,UPI
2025-09-17,Papa SBI Family Support,,4000.00,Family Papa,UPI
2025-09-16,Netflix Premium 4K e-Mandate,649.00,,Netflix India,Auto-Debit`;

// Sample 2: PhonePe / Google Pay JSON Export
const SAMPLE_GPAY_JSON = JSON.stringify([
  {
    date: "2025-09-22",
    description: "Chai Point Koramangala",
    merchant: "Chai Point",
    amount: 140,
    type: "expense",
    category: "Food",
    paymentMethod: "Google Pay UPI"
  },
  {
    date: "2025-09-21",
    description: "Roommate Amit Splitwise Settlement",
    merchant: "Amit (Roommate)",
    amount: 1500,
    type: "income",
    category: "Utilities",
    paymentMethod: "PhonePe UPI"
  },
  {
    date: "2025-09-20",
    description: "Blinkit 10-Min Groceries",
    merchant: "Blinkit",
    amount: 480,
    type: "expense",
    category: "Food",
    paymentMethod: "UPI @okhdfcbank"
  },
  {
    date: "2025-09-19",
    description: "ATM Cash Withdrawal",
    merchant: "HDFC Bank ATM",
    amount: 2500,
    type: "expense",
    category: "Cash Withdrawal",
    paymentMethod: "Debit Card ATM"
  },
  {
    date: "2025-09-18",
    description: "Allowance from Mummy",
    merchant: "Mummy",
    amount: 3500,
    type: "income",
    category: "Family Transfer",
    paymentMethod: "UPI @oksbi"
  }
], null, 2);

// Sample 3: Messy statement with incomplete date, duplicate debit, and zero amount error
const SAMPLE_MESSY_STATEMENT_CSV = `Txn_Date,Narration,Amount,Type,Merchant
2025-09-22,Swiggy Bangalore UPI,450.00,expense,Swiggy
2025-09-22,Swiggy Bangalore UPI,450.00,expense,Swiggy
,Broken Incomplete Date Row,680.00,expense,Zepto Instant
2025-09-20,Razorpay Corporate Stipend,25000.00,income,TechCorp Intern
2025-09-19,Corrupted Zero Amount Row,0.00,expense,Glitch Store
2025-09-18,ATM-WDL/019283/SBI-KORAMANGALA,2000.00,expense,SBI ATM
2025-09-17,Home Allowance Transfer,3000.00,income,Papa Transfer`;

export default function CSVImportModal({ 
  isOpen, 
  onClose, 
  existingTransactions = [], 
  onImportSuccess 
}) {
  const [step, setStep] = useState(1); // 1: Upload / Choose Sample, 2: Map Columns, 3: Preview & Sanitize
  const [rawText, setRawText] = useState('');
  const [parsedHeaders, setParsedHeaders] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [detectedFormat, setDetectedFormat] = useState('csv');
  const [fileName, setFileName] = useState('');
  const [pasteMode, setPasteMode] = useState(false);
  const [columnMapping, setColumnMapping] = useState({
    date: '',
    description: '',
    amount: '',
    type: '',
    merchant: '',
    category: '',
    withdrawal: '',
    deposit: ''
  });
  const [validatedRows, setValidatedRows] = useState([]);
  const [detectedOpeningBalance, setDetectedOpeningBalance] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'clean', 'repaired', 'duplicates', 'errors'
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Step 1: File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    if (/\.(xlsx|xls|pdf)$/i.test(file.name)) {
      setErrorMessage(`Please upload a CSV or JSON statement. If you have an Excel (.xlsx / .xls) or PDF bank statement, please save or export it as a CSV file in Excel or your bank portal.`);
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      processStatementContent(text, file.name);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file. Please check file permissions and try again.');
    };
    reader.readAsText(file);
  };

  const processStatementContent = (text, name) => {
    try {
      setErrorMessage('');
      setRawText(text);
      const { headers, rows, format } = detectAndParseStatement(text);
      if (!rows || rows.length === 0) {
        throw new Error('No transaction rows found in file. Please verify CSV formatting.');
      }
      setParsedHeaders(headers);
      setParsedRows(rows);
      setDetectedFormat(format);

      // Auto-detect column mappings
      const detected = autoDetectMappings(headers);
      setColumnMapping(detected);

      // If key columns (Date & Amount/Withdrawal) were confidently detected, jump straight to Step 3 Preview!
      if (detected.date && (detected.amount || detected.withdrawal || detected.deposit)) {
        const result = validateAndNormalizeCSVRows(rows, detected, existingTransactions);
        const validated = Array.isArray(result) ? result : (result.rows || []);
        setValidatedRows(validated);
        if (result.detectedOpeningBalance !== undefined && result.detectedOpeningBalance !== null) {
          setDetectedOpeningBalance(result.detectedOpeningBalance);
        }
        setStep(3); // Fast-track to Preview!
      } else {
        setStep(2); // Ask user to map columns
      }
      soundFX.playSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Statement Parsing Error. Please check file format.');
    }
  };

  // Step 2: Validate & Preview
  const handleProceedToPreview = () => {
    setErrorMessage('');
    if (!columnMapping.date) {
      setErrorMessage('Please select a Date column to proceed.');
      return;
    }
    if (!columnMapping.amount && !columnMapping.withdrawal && !columnMapping.deposit) {
      setErrorMessage('Please select an Amount or Withdrawal column to proceed.');
      return;
    }

    soundFX.playClick();
    const result = validateAndNormalizeCSVRows(parsedRows, columnMapping, existingTransactions);
    const rows = Array.isArray(result) ? result : (result.rows || []);
    setValidatedRows(rows);
    if (result.detectedOpeningBalance !== undefined && result.detectedOpeningBalance !== null) {
      setDetectedOpeningBalance(result.detectedOpeningBalance);
    }
    setStep(3);
  };

  // Toggle selection
  const handleToggleRow = (index) => {
    setValidatedRows(prev => prev.map(r => r.index === index ? { ...r, selected: !r.selected } : r));
  };

  // Exclude all duplicate suspects
  const handleExcludeDuplicates = () => {
    soundFX.playClick();
    setValidatedRows(prev => prev.map(r => r.isDuplicate ? { ...r, selected: false } : r));
  };

  // Select all valid
  const handleSelectAllValid = () => {
    soundFX.playClick();
    setValidatedRows(prev => prev.map(r => r.isValid ? { ...r, selected: true } : r));
  };

  // Final Import
  const handleFinalImport = () => {
    setErrorMessage('');
    const toImport = validatedRows.filter(r => r.selected).map(r => r.normalized);
    if (toImport.length === 0) {
      setErrorMessage('No transactions selected for import. Please check at least one row.');
      return;
    }

    soundFX.playSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }

    onImportSuccess(toImport, detectedOpeningBalance);
    onClose();
  };

  // Statistics for Step 3
  const totalCount = validatedRows.length;
  const validCount = validatedRows.filter(r => r.isValid).length;
  const repairedCount = validatedRows.filter(r => r.autoRepaired).length;
  const duplicateCount = validatedRows.filter(r => r.isDuplicate).length;
  const errorCount = validatedRows.filter(r => !r.isValid).length;
  const selectedCount = validatedRows.filter(r => r.selected).length;

  const displayedRows = validatedRows.filter(r => {
    if (filterMode === 'clean') return r.isValid && !r.autoRepaired && !r.isDuplicate;
    if (filterMode === 'repaired') return r.autoRepaired;
    if (filterMode === 'duplicates') return r.isDuplicate;
    if (filterMode === 'errors') return !r.isValid;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-[#171512]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-ivory border border-line-medium rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-lifted flex flex-col overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="p-6 border-b border-line-medium flex items-start justify-between bg-ivory">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cream border border-line-light flex items-center justify-center text-coral">
              {detectedFormat === 'json' ? <FileCode size={18} /> : <FileSpreadsheet size={18} />}
            </div>
            <div>
              <span className="text-[11px] font-accent uppercase tracking-widest text-coral font-bold block">
                Data Integration
              </span>
              <h2 className="font-editorial text-2xl text-ink font-normal">
                Statement Importer (CSV & JSON)
              </h2>
              <p className="font-sans text-xs text-ink-muted">
                Auto-categorises UPI, salary, cash withdrawals, and cleans merchant records.
              </p>
            </div>
          </div>
          <button 
            className="w-8 h-8 rounded-full border border-line-medium hover:border-line-dark flex items-center justify-center text-ink-muted hover:text-ink transition-colors cursor-pointer"
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '12px 20px',
          background: '#FAF7F2',
          borderBottom: '1px solid #EFE8DF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: step === 1 ? 800 : 600, color: step === 1 ? '#EA580C' : '#78716C', fontSize: '0.84rem' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step === 1 ? '#EA580C' : '#E5E5E5', color: step === 1 ? '#FFF' : '#78716C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>1</span>
            <span>Upload or Pick Sample</span>
          </div>
          <ArrowRight size={14} color="#A8A29E" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: step === 2 ? 800 : 600, color: step === 2 ? '#EA580C' : '#78716C', fontSize: '0.84rem' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step === 2 ? '#EA580C' : '#E5E5E5', color: step === 2 ? '#FFF' : '#78716C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>2</span>
            <span>Column Mapping</span>
          </div>
          <ArrowRight size={14} color="#A8A29E" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: step === 3 ? 800 : 600, color: step === 3 ? '#EA580C' : '#78716C', fontSize: '0.84rem' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step === 3 ? '#EA580C' : '#E5E5E5', color: step === 3 ? '#FFF' : '#78716C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>3</span>
            <span>Sanitize & Import</span>
          </div>
        </div>

        {/* Inline Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-bold">Import Notice</strong>
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage('')}
              className="text-red-500 hover:text-red-700 font-bold ml-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* STEP 1: UPLOAD / PICK SAMPLE */}
        {step === 1 && (
          <div style={{ padding: '24px' }}>
            {/* Quick 1-Click Indian Sample Pickers */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Sparkles size={16} color="#EA580C" />
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1C1917' }}>
                  Instant 1-Click Indian Test Statements:
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {/* HDFC CSV */}
                <button
                  onClick={() => {
                    setFileName('HDFC_Bank_Statement.csv');
                    processStatementContent(SAMPLE_HDFC_CSV, 'HDFC_Bank_Statement.csv');
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #EFE8DF',
                    background: '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                  className="preset-btn"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#1C1917', fontSize: '0.86rem' }}>
                    <FileSpreadsheet size={16} color="#0284C7" />
                    <span>HDFC Bank UPI & Salary (CSV)</span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#78716C', marginTop: '4px' }}>
                    Swiggy, Uber, TCS Salary, SBI ATM Cash, Netflix, Papa support
                  </p>
                </button>

                {/* Google Pay / PhonePe JSON */}
                <button
                  onClick={() => {
                    setFileName('GPay_PhonePe_Statement.json');
                    processStatementContent(SAMPLE_GPAY_JSON, 'GPay_PhonePe_Statement.json');
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #EFE8DF',
                    background: '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                  className="preset-btn"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#1C1917', fontSize: '0.86rem' }}>
                    <FileCode size={16} color="#059669" />
                    <span>GPay & PhonePe Export (JSON)</span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#78716C', marginTop: '4px' }}>
                    Chai Point, Roommate Splitwise, Blinkit, ATM Cash, Mummy UPI
                  </p>
                </button>

                {/* Messy statement with anomalies */}
                <button
                  onClick={() => {
                    setFileName('Messy_Statement_With_Glitches.csv');
                    processStatementContent(SAMPLE_MESSY_STATEMENT_CSV, 'Messy_Statement_With_Glitches.csv');
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #FED7AA',
                    background: '#FFF7ED',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                  className="preset-btn"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#EA580C', fontSize: '0.86rem' }}>
                    <AlertTriangle size={16} color="#EA580C" />
                    <span>Glitchy Bank File (CSV)</span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#9A3412', marginTop: '4px' }}>
                    Tests missing dates, duplicate Swiggy debit, and zero amount recovery
                  </p>
                </button>
              </div>
            </div>

            {/* Drag & Drop File Upload Area */}
            <div style={{
              border: '2px dashed #EA580C',
              borderRadius: '16px',
              padding: '36px 20px',
              textAlign: 'center',
              background: '#FFFBF7',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <input 
                type="file" 
                accept=".csv, .json, text/csv, application/json"
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%'
                }}
              />
              <UploadCloud size={38} color="#EA580C" style={{ margin: '0 auto 10px auto' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917' }}>
                Drag & Drop your CSV or JSON statement
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#78716C', marginTop: '4px' }}>
                Supports Indian bank statements (HDFC, SBI, ICICI, Axis), Google Pay, PhonePe, Paytm, and Splitwise exports
              </p>
              <div style={{ marginTop: '14px', display: 'inline-block', background: '#EA580C', color: '#FFF', padding: '8px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                Browse Files
              </div>
            </div>

            {/* Direct Paste Toggle */}
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={() => setPasteMode(!pasteMode)}
                style={{ fontSize: '0.8rem', color: '#EA580C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>{pasteMode ? '▲ Hide Direct Paste' : '▼ Or paste raw CSV/JSON text directly'}</span>
              </button>
              {pasteMode && (
                <div style={{ marginTop: '10px' }}>
                  <textarea
                    rows={5}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste CSV rows or JSON array here..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #EFE8DF',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      background: '#FFFFFF'
                    }}
                  />
                  <button
                    onClick={() => processStatementContent(rawText, 'pasted_statement')}
                    className="btn-primary"
                    style={{ marginTop: '8px', padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    Parse Pasted Text
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: COLUMN MAPPING */}
        {step === 2 && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917' }}>
                  Verify Detected Columns ({detectedFormat.toUpperCase()})
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#78716C' }}>
                  We automatically matched columns from <strong>{fileName}</strong>. Confirm or adjust below:
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', background: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
                {parsedRows.length} Rows Found
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              {/* Date */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '4px' }}>
                  Date Column *
                </label>
                <select
                  value={columnMapping.date}
                  onChange={(e) => setColumnMapping({ ...columnMapping, date: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D6D3D1', background: '#FFF' }}
                >
                  <option value="">-- Select Date --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '4px' }}>
                  Narration / Description *
                </label>
                <select
                  value={columnMapping.description}
                  onChange={(e) => setColumnMapping({ ...columnMapping, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D6D3D1', background: '#FFF' }}
                >
                  <option value="">-- Select Description --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Amount or Dual Columns */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '4px' }}>
                  Amount Column *
                </label>
                <select
                  value={columnMapping.amount}
                  onChange={(e) => setColumnMapping({ ...columnMapping, amount: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D6D3D1', background: '#FFF' }}
                >
                  <option value="">-- Select Amount --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Withdrawal Column (Bank statements) */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '4px' }}>
                  Withdrawal / Debit (Optional)
                </label>
                <select
                  value={columnMapping.withdrawal}
                  onChange={(e) => setColumnMapping({ ...columnMapping, withdrawal: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D6D3D1', background: '#FFF' }}
                >
                  <option value="">-- None (Single Amount) --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Deposit Column */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '4px' }}>
                  Deposit / Credit (Optional)
                </label>
                <select
                  value={columnMapping.deposit}
                  onChange={(e) => setColumnMapping({ ...columnMapping, deposit: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D6D3D1', background: '#FFF' }}
                >
                  <option value="">-- None --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '4px' }}>
                  Category (Optional)
                </label>
                <select
                  value={columnMapping.category}
                  onChange={(e) => setColumnMapping({ ...columnMapping, category: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D6D3D1', background: '#FFF' }}
                >
                  <option value="">-- Auto-Categorize with AI --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #EFE8DF' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn-primary" onClick={handleProceedToPreview}>
                <span>Proceed to Sanitize & Preview</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SANITIZE & VALIDATION PREVIEW */}
        {step === 3 && (
          <div style={{ padding: '20px 24px' }}>
            {/* Opening Balance Notification */}
            {detectedOpeningBalance !== null && (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <CheckCircle2 size={20} color="#059669" />
                <div>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#065F46' }}>
                    Starting Cash Balance Identified: {formatINR(detectedOpeningBalance)}
                  </span>
                  <p style={{ fontSize: '0.78rem', color: '#047857', marginTop: '2px' }}>
                    This entry sets your account's opening balance baseline. It will <strong>NOT</strong> be deducted as an expense!
                  </p>
                </div>
              </div>
            )}

            {/* Data Health Header Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block' }}>Total Records</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{totalCount}</span>
              </div>
              <div style={{ padding: '10px 12px', background: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                <span style={{ fontSize: '0.74rem', color: '#047857', display: 'block' }}>Clean & Valid</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065F46' }}>{validCount}</span>
              </div>
              <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: '0.74rem', color: '#B45309', display: 'block' }}>Auto-Repaired</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400E' }}>{repairedCount}</span>
              </div>
              <div style={{ padding: '10px 12px', background: '#FFF7ED', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                <span style={{ fontSize: '0.74rem', color: '#C2410C', display: 'block' }}>Duplicates Flagged</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#9A3412' }}>{duplicateCount}</span>
              </div>
              <div style={{ padding: '10px 12px', background: '#FEF2F2', borderRadius: '10px', border: '1px solid #FECACA' }}>
                <span style={{ fontSize: '0.74rem', color: '#B91C1C', display: 'block' }}>Corrupted Errors</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991B1B' }}>{errorCount}</span>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setFilterMode('all')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: filterMode === 'all' ? '#1C1917' : '#F5EFE6',
                    color: filterMode === 'all' ? '#FFF' : '#44403C',
                    fontWeight: 700
                  }}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setFilterMode('duplicates')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: filterMode === 'duplicates' ? '#EA580C' : '#F5EFE6',
                    color: filterMode === 'duplicates' ? '#FFF' : '#44403C',
                    fontWeight: 700
                  }}
                >
                  Duplicates ({duplicateCount})
                </button>
                <button
                  onClick={() => setFilterMode('repaired')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: filterMode === 'repaired' ? '#D97706' : '#F5EFE6',
                    color: filterMode === 'repaired' ? '#FFF' : '#44403C',
                    fontWeight: 700
                  }}
                >
                  Auto-Repaired ({repairedCount})
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {duplicateCount > 0 && (
                  <button
                    onClick={handleExcludeDuplicates}
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#FFF7ED',
                      border: '1px solid #FDBA74',
                      color: '#C2410C',
                      fontWeight: 700
                    }}
                  >
                    Exclude Duplicates ({duplicateCount})
                  </button>
                )}
                <button
                  onClick={handleSelectAllValid}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    fontWeight: 700
                  }}
                >
                  Select All Valid
                </button>
              </div>
            </div>

            {/* Transactions Preview Table */}
            <div style={{
              maxHeight: '260px',
              overflowY: 'auto',
              borderRadius: '10px',
              border: '1px solid #EFE8DF',
              background: '#FFFFFF',
              marginBottom: '16px'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: '#FAF7F2', borderBottom: '1px solid #EFE8DF', textAlign: 'left', color: '#78716C' }}>
                    <th style={{ padding: '8px 10px', width: '32px' }}>Import</th>
                    <th style={{ padding: '8px 10px' }}>Date</th>
                    <th style={{ padding: '8px 10px' }}>Clean Narration</th>
                    <th style={{ padding: '8px 10px' }}>Category</th>
                    <th style={{ padding: '8px 10px' }}>Channel</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '8px 10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map(row => (
                    <tr 
                      key={row.index}
                      style={{
                        borderBottom: '1px solid #F5EFE6',
                        background: !row.isValid ? '#FEF2F2' : (row.isDuplicate ? '#FFFBEB' : '#FFFFFF')
                      }}
                    >
                      <td style={{ padding: '8px 10px' }}>
                        <input
                          type="checkbox"
                          checked={row.selected}
                          disabled={!row.isValid}
                          onChange={() => handleToggleRow(row.index)}
                        />
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                        {row.normalized.date}
                        {row.autoRepaired && (
                          <span style={{ display: 'block', fontSize: '0.68rem', color: '#D97706' }}>repaired date</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ fontWeight: 700, color: '#1C1917' }}>{row.normalized.description}</div>
                        <div style={{ fontSize: '0.72rem', color: '#A8A29E' }}>{row.normalized.merchant}</div>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          background: '#F5EFE6',
                          color: '#44403C',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}>
                          {row.normalized.category}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.74rem', color: '#78716C' }}>
                        {row.normalized.paymentMethod}
                      </td>
                      <td style={{
                        padding: '8px 10px',
                        textAlign: 'right',
                        fontWeight: 800,
                        color: row.normalized.type === 'income' ? '#10B981' : '#1C1917'
                      }}>
                        {row.normalized.type === 'income' ? '+' : '-'}{formatINR(row.normalized.amount)}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {row.errors.length > 0 ? (
                          <span style={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: 700 }}>
                            {row.errors[0]}
                          </span>
                        ) : row.isDuplicate ? (
                          <span style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 700 }}>
                            Duplicate
                          </span>
                        ) : row.autoRepaired ? (
                          <span style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 700 }}>
                            Repaired
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>
                            Clean
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #EFE8DF' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>
                Back to Mapping
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: '#78716C' }}>
                  Ready to import: <strong>{selectedCount} transactions</strong>
                </span>
                <button
                  className="btn-primary"
                  onClick={handleFinalImport}
                  disabled={selectedCount === 0}
                  style={{ opacity: selectedCount === 0 ? 0.5 : 1 }}
                >
                  <Check size={16} />
                  <span>Import {selectedCount} Transactions</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

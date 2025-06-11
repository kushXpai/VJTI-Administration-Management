// Mess Management Page for Admin
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';
import { format } from 'date-fns';

// Types for student payment info
interface StudentPayment {
  student_id: string;
  name: string;
  transaction_id: string;
  fees_paid: number;
  receipt_url: string;
  current_balance: number;
  status: string;
  date?: string; // include date field
}

interface MessPaymentRow {
  id: string;
  transaction_id: string;
  fees_paid: number;
  receipt_url: string;
  status: string;
}

export default function ManagePayments() {
  const supabase = createClientComponentClient();
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Collapsible state for each section
  const [collapsed, setCollapsed] = useState({
    pending: false,
    accepted: false,
    rejected: false,
    history: false,
    summary: false,
  });
  const toggleSection = (section: 'pending' | 'accepted' | 'rejected' | 'history' | 'summary') => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper to filter payments by status
  const getPaymentsByStatus = (status: string) => payments.filter((p) => p.status === status);

  // For date filtering in history
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Group accepted payments by month for history, with date filtering
  const getAcceptedPaymentsByMonth = () => {
    const accepted = getPaymentsByStatus('Accepted');
    let filtered = accepted;
    // Remove setHistoryError(null) from here to avoid re-render loop
    if (historyStartDate && historyEndDate) {
      const start = new Date(historyStartDate);
      const end = new Date(historyEndDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        // setHistoryError is now handled in useEffect below
        return {};
      }
      if (start > end) {
        // setHistoryError is now handled in useEffect below
        return {};
      }
      filtered = accepted.filter((p) => {
        let dateStr = (p as any).date || '';
        if (!dateStr && p.transaction_id && /^\d{4}-\d{2}/.test(p.transaction_id)) {
          dateStr = p.transaction_id.substring(0, 10);
        }
        if (!dateStr || !/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return false;
        const d = new Date(dateStr);
        return d >= start && d <= end;
      });
    }
    const grouped: { [month: string]: StudentPayment[] } = {};
    filtered.forEach((p) => {
      let month = '';
      let dateStr = (p as any).date || '';
      if (!dateStr && p.transaction_id && /^\d{4}-\d{2}/.test(p.transaction_id)) {
        dateStr = p.transaction_id.substring(0, 10);
      }
      let label = '';
      if (dateStr && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        const d = new Date(dateStr);
        label = format(d, 'MMMM yyyy');
      } else {
        const d = new Date();
        label = format(d, 'MMMM yyyy');
      }
      month = label;
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(p);
    });
    return grouped;
  };

  // Error handling for date range (avoid setState in render)
  useEffect(() => {
    if (historyStartDate && historyEndDate) {
      const start = new Date(historyStartDate);
      const end = new Date(historyEndDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setHistoryError('Invalid date range.');
        return;
      }
      if (start > end) {
        setHistoryError('Start date cannot be after end date.');
        return;
      }
      setHistoryError(null);
    } else {
      setHistoryError(null);
    }
  }, [historyStartDate, historyEndDate]);

  // Handler for payments button
  const handleCheckPayments = async () => {
    setLoading(true);
    setNotification(null);
    try {
      // 1. Fetch all mess_payments
      const { data: paymentsData, error } = await supabase
        .from('mess_payments')
        .select('*');
      if (error) {
        setNotification({ type: 'error', message: error.message || 'Failed to fetch payments.' });
        setPayments([]);
        setLoading(false);
        return;
      }
      if (!paymentsData || paymentsData.length === 0) {
        setNotification({ type: 'error', message: 'No payment records found.' });
        setPayments([]);
        setLoading(false);
        return;
      }
      // 2. Batch fetch all related profiles and hostel_applications
      const ids = paymentsData.map((row: MessPaymentRow) => row.id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', ids);
      const { data: applications } = await supabase
        .from('hostel_applications')
        .select('id, current_balance')
        .in('id', ids);
      // 3. Map results together
      const results = paymentsData.map((row: MessPaymentRow & { date?: string }) => {
        const profile = profiles?.find((p: { id: string; name: string }) => p.id === row.id);
        const application = applications?.find((a: { id: string; current_balance: number }) => a.id === row.id);
        return {
          student_id: row.id,
          name: profile?.name || '',
          transaction_id: row.transaction_id,
          fees_paid: row.fees_paid,
          receipt_url: row.receipt_url,
          current_balance: application?.current_balance || 0,
          status: row.status,
          date: (row as any).date || '', // include date if present
        };
      });
      setPayments(results);
    } catch (error: unknown) {
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Unexpected error fetching payments.' });
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handler for updating payment info
  const handleUpdatePayment = async (idx: number) => {
    const payment = payments[idx];
    setLoading(true);
    setNotification(null);
    try {
      // Always get the current value from the select element for this row
      const select = document.getElementById(`status-select-${idx}`) as HTMLSelectElement | null;
      const newStatus = select ? select.value : payment.status;
      const newFeesPaid = editAmount !== '' ? Number(editAmount) : payment.fees_paid;
      // Always update status and fees_paid
      const { error: updateError } = await supabase
        .from('mess_payments')
        .update({
          fees_paid: newFeesPaid,
          status: newStatus,
          // If status is being set to Accepted, set date to today
          ...(payment.status !== 'Accepted' && newStatus === 'Accepted' ? { date: new Date().toISOString().slice(0, 10) } : {})
        })
        .eq('id', payment.student_id)
        .eq('transaction_id', payment.transaction_id); // Use both id and transaction_id for precise update
      if (updateError) {
        setNotification({ type: 'error', message: updateError.message || 'Failed to update payment.' });
        setLoading(false);
        return;
      }
      // Only update current_balance if status is Accepted
      if (newStatus === 'Accepted') {
        const { data: appData, error: appFetchError } = await supabase
          .from('hostel_applications')
          .select('current_balance')
          .eq('id', payment.student_id)
          .single();
        if (appFetchError || !appData) {
          setNotification({ type: 'error', message: 'Failed to fetch current balance.' });
          setLoading(false);
          return;
        }
        const addAmount = editAmount !== '' ? Number(editAmount) : 0;
        const newBalance = Number(appData.current_balance) + addAmount;
        const { error: appUpdateError } = await supabase
          .from('hostel_applications')
          .update({ current_balance: newBalance })
          .eq('id', payment.student_id);
        if (appUpdateError) {
          setNotification({ type: 'error', message: appUpdateError.message || 'Failed to update current balance.' });
          setLoading(false);
          return;
        }
      }
      setNotification({ type: 'success', message: 'Payment updated successfully.' });
      await handleCheckPayments();
    } catch (error: unknown) {
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Unexpected error updating payment.' });
    } finally {
      setEditIdx(null);
      setEditAmount('');
      setEditStatus('');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only run on client to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      handleCheckPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-200 text-black">
      <div className="flex-1 flex flex-row">
        <main className="flex-1 p-8">
          <Header
            rightContent={
              <div className="flex flex-col items-end">
                <span className="text-2xl font-extrabold text-[#800000] tracking-tight drop-shadow-sm">Mess Management</span>
                <span className="text-base text-gray-500 font-medium">Manage Payments</span>
              </div>
            }
          />
          {/* Sticky Navigation Bar below Header */}
          <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm flex items-center justify-center py-2 px-4 gap-4 md:gap-8 mb-6">
            <a href="#pending-section" className="px-3 py-1 rounded-lg font-semibold text-yellow-800 hover:bg-yellow-100 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400">Pending</a>
            <a href="#accepted-section" className="px-3 py-1 rounded-lg font-semibold text-green-800 hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400">Accepted</a>
            <a href="#rejected-section" className="px-3 py-1 rounded-lg font-semibold text-red-800 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400">Rejected</a>
            <a href="#history-section" className="px-3 py-1 rounded-lg font-semibold text-gray-800 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">Payment Record</a>
            <a href="#summary-section" className="px-3 py-1 rounded-lg font-semibold text-gray-900 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">Summary</a>
          </nav>
          {/* End Navigation Bar */}
          {notification && (
            <div className={`mb-4 p-3 rounded-lg shadow text-center font-semibold transition-all duration-300 ${notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{notification.message}</div>
          )}
          <div className="flex flex-col gap-8 mt-6">
            {/* Pending Section */}
            <section id="pending-section" className="bg-yellow-50/80 border border-yellow-200 rounded-2xl shadow-lg p-6 mb-4 transition-all duration-300 scroll-mt-24">
              <button
                className="flex items-center gap-2 mb-4 text-yellow-700 font-bold text-xl focus:outline-none hover:underline hover:text-yellow-800 transition-colors"
                onClick={() => toggleSection('pending')}
                aria-expanded={!collapsed.pending}
              >
                <span className="text-2xl font-bold">{collapsed.pending ? '+' : '−'}</span> Pending
              </button>
              <div className={`transition-all duration-300 ${collapsed.pending ? 'max-h-0 overflow-hidden' : 'max-h-[1000px]' }`}>
                {!collapsed.pending && (
                  <PaymentsTable
                    payments={getPaymentsByStatus('pending')}
                    loading={loading}
                    editIdx={editIdx}
                    setEditIdx={setEditIdx}
                    editAmount={editAmount}
                    setEditAmount={setEditAmount}
                    editStatus={editStatus}
                    setEditStatus={setEditStatus}
                    handleUpdatePayment={handleUpdatePayment}
                    section="pending"
                  />
                )}
              </div>
            </section>
            {/* Accepted Section */}
            <section id="accepted-section" className="bg-green-50/80 border border-green-200 rounded-2xl shadow-lg p-6 mb-4 transition-all duration-300 scroll-mt-24">
              <button
                className="flex items-center gap-2 mb-4 text-green-700 font-bold text-xl focus:outline-none hover:underline hover:text-green-800 transition-colors"
                onClick={() => toggleSection('accepted')}
                aria-expanded={!collapsed.accepted}
              >
                <span className="text-2xl font-bold">{collapsed.accepted ? '+' : '−'}</span> Accepted
              </button>
              <div className={`transition-all duration-300 ${collapsed.accepted ? 'max-h-0 overflow-hidden' : 'max-h-[1000px]' }`}>
                {!collapsed.accepted && (
                  <PaymentsTable
                    payments={getPaymentsByStatus('Accepted')}
                    loading={loading}
                    editIdx={null}
                    setEditIdx={() => {}}
                    editAmount={''}
                    setEditAmount={() => {}}
                    editStatus={''}
                    setEditStatus={() => {}}
                    handleUpdatePayment={() => {}}
                    section="accepted"
                  />
                )}
              </div>
            </section>
            {/* Rejected Section */}
            <section id="rejected-section" className="bg-red-50/80 border border-red-200 rounded-2xl shadow-lg p-6 mb-4 transition-all duration-300 scroll-mt-24">
              <button
                className="flex items-center gap-2 mb-4 text-red-700 font-bold text-xl focus:outline-none hover:underline hover:text-red-800 transition-colors"
                onClick={() => toggleSection('rejected')}
                aria-expanded={!collapsed.rejected}
              >
                <span className="text-2xl font-bold">{collapsed.rejected ? '+' : '−'}</span> Rejected
              </button>
              <div className={`transition-all duration-300 ${collapsed.rejected ? 'max-h-0 overflow-hidden' : 'max-h-[1000px]' }`}>
                {!collapsed.rejected && (
                  <PaymentsTable
                    payments={getPaymentsByStatus('Rejected')}
                    loading={loading}
                    editIdx={null}
                    setEditIdx={() => {}}
                    editAmount={''}
                    setEditAmount={() => {}}
                    editStatus={''}
                    setEditStatus={() => {}}
                    handleUpdatePayment={() => {}}
                    section="rejected"
                  />
                )}
              </div>
            </section>
            {/* History Section: Accepted Payments Month-wise */}
            <section id="history-section" className="bg-gray-50/90 border border-gray-200 rounded-2xl shadow-lg p-6 mb-4 transition-all duration-300 scroll-mt-24">
              <button
                className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-xl focus:outline-none hover:underline hover:text-gray-900 transition-colors"
                onClick={() => toggleSection('history')}
                aria-expanded={!collapsed.history}
              >
                <span className="text-2xl font-bold">{collapsed.history ? '+' : '−'}</span> Payment Record
              </button>
              <div className={`transition-all duration-300 ${collapsed.history ? 'max-h-0 overflow-hidden' : 'max-h-[2000px]' }`}>
                {!collapsed.history && (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-4 items-center mb-4">
                      <span className="font-bold text-black">Sort:</span>
                      <label className="font-medium">Start Date:
                        <input
                          type="date"
                          className="ml-2 border rounded-lg p-1 shadow-sm focus:ring-2 focus:ring-[#800000] focus:border-[#800000] transition-all"
                          value={historyStartDate}
                          onChange={e => setHistoryStartDate(e.target.value)}
                          max={historyEndDate || undefined}
                        />
                      </label>
                      <label className="font-medium">End Date:
                        <input
                          type="date"
                          className="ml-2 border rounded-lg p-1 shadow-sm focus:ring-2 focus:ring-[#800000] focus:border-[#800000] transition-all"
                          value={historyEndDate}
                          onChange={e => setHistoryEndDate(e.target.value)}
                          min={historyStartDate || undefined}
                        />
                      </label>
                    </div>
                    {historyError && <div className="text-red-600 font-semibold mb-2">{historyError}</div>}
                    {Object.entries(getAcceptedPaymentsByMonth()).map(([month, rows]) => (
                      <div key={month} className="mb-2">
                        <div className="font-semibold text-base text-gray-700 mb-2">{month}</div>
                        <PaymentsTable
                          payments={rows}
                          loading={loading}
                          editIdx={null}
                          setEditIdx={() => {}}
                          editAmount={''}
                          setEditAmount={() => {}}
                          editStatus={''}
                          setEditStatus={() => {}}
                          handleUpdatePayment={() => {}}
                          section="accepted"
                        />
                      </div>
                    ))}
                    {Object.keys(getAcceptedPaymentsByMonth()).length === 0 && !historyError && (
                      <div className="text-gray-500">No accepted payments found.</div>
                    )}
                  </div>
                )}
              </div>
            </section>
            {/* Payment Summary Section */}
            <section id="summary-section" className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 border border-gray-300 rounded-2xl shadow-lg p-6 mb-4 transition-all duration-300 scroll-mt-24">
              <button
                className="flex items-center gap-2 mb-4 text-gray-800 font-bold text-xl focus:outline-none hover:underline hover:text-black transition-colors"
                onClick={() => toggleSection('summary')}
                aria-expanded={!collapsed.summary}
              >
                <span className="text-2xl font-bold">{collapsed.summary ? '+' : '−'}</span> Payment Summary
              </button>
              <div className={`transition-all duration-300 ${collapsed.summary ? 'max-h-0 overflow-hidden' : 'max-h-[1000px]' }`}>
                {!collapsed.summary && (
                  <div className="w-full">
                    <PaymentSummaryTable getAcceptedPaymentsByMonth={getAcceptedPaymentsByMonth} />
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

// PaymentsTable component for reuse
function PaymentsTable({ payments, loading, editIdx, setEditIdx, editAmount, setEditAmount, editStatus, setEditStatus, handleUpdatePayment, section }: {
  payments: StudentPayment[];
  loading: boolean;
  editIdx: number | null;
  setEditIdx: (idx: number | null) => void;
  editAmount: string;
  setEditAmount: (val: string) => void;
  editStatus: string;
  setEditStatus: (val: string) => void;
  handleUpdatePayment: (idx: number) => void;
  section: string;
}) {
  if (loading && payments.length === 0) return <div>Loading...</div>;
  if (payments.length === 0) return <div className="text-gray-500">No records found.</div>;
  return (
    <div className="overflow-x-auto rounded-xl shadow-md">
      <table className="min-w-full border border-gray-300 text-sm bg-white rounded-xl">
        <thead className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 sticky top-0 z-10">
          <tr>
            <th className="p-3 border font-semibold">Student ID</th>
            <th className="p-3 border font-semibold">Name</th>
            <th className="p-3 border font-semibold">Transaction ID</th>
            <th className="p-3 border font-semibold">Fees Paid</th>
            <th className="p-3 border font-semibold">Receipt</th>
            <th className="p-3 border font-semibold">Current Balance</th>
            {section === 'accepted' && <th className="p-3 border font-semibold">Date</th>}
            {section === 'pending' && <th className="p-3 border font-semibold">Update Payment</th>}
            <th className="p-3 border font-semibold">Status</th>
            {section === 'pending' && <th className="p-3 border font-semibold">Update</th>}
          </tr>
        </thead>
        <tbody>
          {payments.map((row, idx) => (
            <tr key={row.student_id + '-' + row.transaction_id} className={`text-center transition-colors duration-200 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-[#f3e8ff]/60`}>
              <td className="p-2 border font-mono">{row.student_id}</td>
              <td className="p-2 border">{row.name}</td>
              <td className="p-2 border font-mono text-xs">{row.transaction_id}</td>
              <td className="p-2 border">{row.fees_paid}</td>
              <td className="p-2 border">
                <a href={row.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 transition-colors">View</a>
              </td>
              <td className="p-2 border">{row.current_balance}</td>
              {section === 'accepted' && (
                <td className="p-2 border">{
                  (row as any).date && /^\d{4}-\d{2}-\d{2}/.test((row as any).date)
                    ? format(new Date((row as any).date), 'dd MMM yyyy')
                    : ''
                }</td>
              )}
              {section === 'pending' && (
                <td className="p-2 border">
                  {editIdx === idx ? (
                    <input
                      type="number"
                      className="border rounded-lg p-1 w-24 shadow-sm focus:ring-2 focus:ring-[#800000] focus:border-[#800000] transition-all"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                    />
                  ) : (
                    <span>{row.fees_paid}</span>
                  )}
                </td>
              )}
              <td className="p-2 border">
                {section === 'pending' && editIdx === idx ? (
                  <select
                    id={`status-select-${idx}`}
                    className="border rounded-lg p-1 shadow-sm focus:ring-2 focus:ring-[#800000] focus:border-[#800000] transition-all"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                  >
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'Accepted' ? 'bg-green-100 text-green-700' : row.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{row.status}</span>
                )}
              </td>
              {section === 'pending' && (
                <td className="p-2 border">
                  {editIdx === idx ? (
                    <>
                      <button
                        className="bg-gradient-to-r from-green-500 to-green-700 text-white px-3 py-1 rounded-lg shadow hover:scale-105 hover:from-green-600 hover:to-green-800 transition-all mr-2"
                        onClick={() => handleUpdatePayment(idx)}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-400 text-white px-3 py-1 rounded-lg shadow hover:bg-gray-500 transition-all"
                        onClick={() => setEditIdx(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1 rounded-lg shadow hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all"
                      onClick={() => {
                        setEditIdx(idx);
                        setEditAmount(row.fees_paid.toString());
                        setEditStatus(row.status);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// PaymentSummaryTable component
function PaymentSummaryTable({ getAcceptedPaymentsByMonth }: { getAcceptedPaymentsByMonth: () => { [month: string]: StudentPayment[] } }) {
  const monthData = getAcceptedPaymentsByMonth();
  const months = Object.keys(monthData);
  if (months.length === 0) {
    return <div className="text-gray-500">No data to summarize.</div>;
  }
  return (
    <div className="overflow-x-auto rounded-xl shadow-md">
      <table className="w-full border border-gray-400 text-sm bg-white rounded-xl">
        <thead className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 sticky top-0 z-10">
          <tr>
            <th className="p-3 border font-semibold">Month Year</th>
            <th className="p-3 border font-semibold">Number of Students</th>
            <th className="p-3 border font-semibold">Total Fees Paid</th>
          </tr>
        </thead>
        <tbody>
          {months.map(month => (
            <tr key={month} className="text-center transition-colors duration-200 hover:bg-[#f3e8ff]/60">
              <td className="p-2 border font-medium">{month}</td>
              <td className="p-2 border font-semibold text-blue-700">
                {monthData[month].length}
              </td>
              <td className="p-2 border font-semibold text-green-700">
                {monthData[month].reduce((sum, row) => sum + (row.fees_paid || 0), 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
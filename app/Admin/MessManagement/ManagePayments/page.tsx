// Mess Management Page for Admin
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '@/app/Components/Header';
import Footer from '@/app/Components/Footer';

// Types for student payment info
interface StudentPayment {
  student_id: string;
  name: string;
  transaction_id: string;
  fees_paid: number;
  receipt_url: string;
  current_balance: number;
  status: string;
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
  });
  const toggleSection = (section: 'pending' | 'accepted' | 'rejected') => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper to filter payments by status
  const getPaymentsByStatus = (status: string) => payments.filter((p) => p.status === status);

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
      const results = paymentsData.map((row: MessPaymentRow) => {
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
        })
        .eq('id', payment.student_id);
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
    <div className="min-h-screen flex flex-col bg-white text-black">
      <div className="flex-1 flex flex-row">
        <main className="flex-1 p-8">
          <Header
            rightContent={
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-[#800000]">Mess Management</span>
                <span className="text-sm text-gray-600">Manage Payments</span>
              </div>
            }
          />
          {notification && (
            <div className={`mb-4 p-3 rounded text-center font-semibold ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{notification.message}</div>
          )}
          <div className="flex flex-col gap-8 mt-6">
            {/* Pending Section */}
            <section>
              <button
                className="flex items-center gap-2 mb-4 text-yellow-700 font-bold text-xl focus:outline-none"
                onClick={() => toggleSection('pending')}
                aria-expanded={!collapsed.pending}
              >
                <span>{collapsed.pending ? '+' : '−'}</span> Pending
              </button>
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
            </section>
            {/* Accepted Section */}
            <section>
              <button
                className="flex items-center gap-2 mb-4 text-green-700 font-bold text-xl focus:outline-none"
                onClick={() => toggleSection('accepted')}
                aria-expanded={!collapsed.accepted}
              >
                <span>{collapsed.accepted ? '+' : '−'}</span> Accepted
              </button>
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
            </section>
            {/* Rejected Section */}
            <section>
              <button
                className="flex items-center gap-2 mb-4 text-red-700 font-bold text-xl focus:outline-none"
                onClick={() => toggleSection('rejected')}
                aria-expanded={!collapsed.rejected}
              >
                <span>{collapsed.rejected ? '+' : '−'}</span> Rejected
              </button>
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
    <table className="min-w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">Student ID</th>
          <th className="p-2 border">Name</th>
          <th className="p-2 border">Transaction ID</th>
          <th className="p-2 border">Fees Paid</th>
          <th className="p-2 border">Receipt</th>
          <th className="p-2 border">Current Balance</th>
          {section === 'pending' && <th className="p-2 border">Update Payment</th>}
          <th className="p-2 border">Status</th>
          {section === 'pending' && <th className="p-2 border">Update</th>}
        </tr>
      </thead>
      <tbody>
        {payments.map((row, idx) => (
          <tr key={row.student_id} className="text-center">
            <td className="p-2 border">{row.student_id}</td>
            <td className="p-2 border">{row.name}</td>
            <td className="p-2 border">{row.transaction_id}</td>
            <td className="p-2 border">{row.fees_paid}</td>
            <td className="p-2 border">
              <a href={row.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
            </td>
            <td className="p-2 border">{row.current_balance}</td>
            {section === 'pending' && (
              <td className="p-2 border">
                {editIdx === idx ? (
                  <input
                    type="number"
                    className="border rounded p-1 w-24"
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
                  className="border rounded p-1"
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                >
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              ) : (
                <span>{row.status}</span>
              )}
            </td>
            {section === 'pending' && (
              <td className="p-2 border">
                {editIdx === idx ? (
                  <button
                    className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                    onClick={() => handleUpdatePayment(idx)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                    onClick={() => {
                      setEditIdx(idx);
                      setEditAmount(row.fees_paid.toString());
                      setEditStatus(row.status);
                    }}
                  >
                    Edit
                  </button>
                )}
                {editIdx === idx && (
                  <button
                    className="bg-gray-400 text-white px-2 py-1 rounded"
                    onClick={() => setEditIdx(null)}
                  >
                    Cancel
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
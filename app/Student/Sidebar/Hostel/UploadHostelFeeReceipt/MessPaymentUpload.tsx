// MessPaymentUpload.tsx
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface MessPaymentUploadProps {
  user: { id: string };
  onUploadSuccess: () => void;
}

export default function MessPaymentUpload({ user, onUploadSuccess }: MessPaymentUploadProps) {
  const [paymentType, setPaymentType] = useState<'Full' | 'Partial'>('Full');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [messName, setMessName] = useState('');
  

  useEffect(() => {
    async function fetchMessName() {
      const { data } = await supabase
        .from('hostel_applications_db')
        .select('mess_id')
        .eq('student_id', user.id)
        .single();

      if (data?.mess_id) {
        const { data: messData } = await supabase
          .from('mess_db')
          .select('name')
          .eq('mess_id', data.mess_id)
          .single();
        setMessName(messData?.name || '');
        
      }
    }
    fetchMessName();
  }, [user.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
    setFileName(file?.name || '');
  };

  const handleSubmit = async () => {
    if (!file) return;

    const { data: userData } = await supabase
      .from('hostel_applications_db')
      .select('mess_fees')
      .eq('student_id', user.id)
      .single();

    const messFees = userData?.mess_fees || 0;
    const mess_feed_paid = paymentType === 'Full' ? messFees : paidAmount;
    const mess_feed_pending = paymentType === 'Full' ? 0 : messFees - paidAmount;

    await supabase.storage
      .from('bucket_mess_fee_receipts')
      .upload(`${user.id}/${file.name}`, file, { upsert: true });

    const url = supabase.storage.from('bucket_mess_fee_receipts').getPublicUrl(`${user.id}/${file.name}`).data.publicUrl;

    await supabase
      .from('hostel_applications_db')
      .update({
        mess_payment_type: paymentType,
        mess_partial: paymentType === 'Partial',
        mess_feed_paid,
        mess_feed_pending,
        mess_fees_url: url,
      })
      .eq('student_id', user.id);

    setSubmitted(true);
    onUploadSuccess();
  };

  if (submitted) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <strong className="font-bold">Success!</strong>
        <span className="block"> Your mess fee receipt has been submitted successfully.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">Mess: {messName}</p>
    
      <div>
        <label className="block font-medium mb-1">Payment Type:</label>
        <div className="flex space-x-4">
          <label><input type="radio" value="Full" checked={paymentType === 'Full'} onChange={() => setPaymentType('Full')} /> Full</label>
          <label><input type="radio" value="Partial" checked={paymentType === 'Partial'} onChange={() => setPaymentType('Partial')} /> Partial</label>
        </div>
      </div>
      {paymentType === 'Partial' && (
        <div>
          <label className="block font-medium mb-1">Amount Paid:</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={paidAmount}
            onChange={(e) => setPaidAmount(Number(e.target.value))}
          />
        </div>
      )}
      <div>
        <label className="block font-medium mb-1">Upload Receipt:</label>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="w-full border rounded px-3 py-2" />
        {fileName && <p className="mt-2 text-sm text-gray-600">Selected: {fileName}</p>}
      </div>
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </div>
  );
}

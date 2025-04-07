// app/Student/Sidebar/Hostel/UploadHostelFeeReceipt/page.tsx

'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
    name: string;
    email: string;
    id: string;
    role: string;
    department: string;
    year: string;
}

interface UploadHostelFeeReceiptProps {
    user: User;
}

export default function UploadHostelFeeReceipt({ user }: UploadHostelFeeReceiptProps) {
    const [feeReceipt, setFeeReceipt] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [hasUploadedReceipt, setHasUploadedReceipt] = useState(false);
    const [isAllotmentAccepted, setIsAllotmentAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkEligibilityAndReceipt() {
            if (!user || !user.id) {
                setIsLoading(false);
                return;
            }

            try {
                // Check application status and if receipt is already uploaded
                const { data, error } = await supabase
                    .from('hostel_applications')
                    .select('hostel_application_status, allotment_status, hostel_fee_receipt_url')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching hostel receipt:', error?.message || 'Unknown error');
                }

                // Check if both hostel_application_status and allotment_status are Accepted
                setIsAllotmentAccepted(
                    data !== null &&
                    data.hostel_application_status === 'Accepted' &&
                    data.allotment_status === 'Accepted'
                );

                // If hostel_fee_receipt_url exists, set hasUploadedReceipt to true
                setHasUploadedReceipt(data !== null && data.hostel_fee_receipt_url !== null);

            } catch (error) {
                console.error('Error checking hostel receipt:', error);
            } finally {
                setIsLoading(false);
            }
        }

        checkEligibilityAndReceipt();
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFeeReceipt(e.target.files[0]);
        }
    };

    const handleUploadReceipt = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!feeReceipt || !user?.id) return;

        setIsUploading(true);

        try {
            // Upload file to storage - directly to bucket without additional folder
            const fileName = `hostel_fee_receipt_${user.id}_${Date.now()}`;
            const fileExt = feeReceipt.name.split('.').pop();
            const filePath = `${fileName}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('hostel_fee_receipts')
                .upload(filePath, feeReceipt);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('hostel_fee_receipts')
                .getPublicUrl(filePath);

            const fileUrl = urlData.publicUrl;

            // Update hostel application with receipt URL
            const { error: updateError } = await supabase
                .from('hostel_applications')
                .update({ hostel_fee_receipt_url: fileUrl })
                .eq('id', user.id);

            if (updateError) {
                throw updateError;
            }

            setSuccess(true);
            setHasUploadedReceipt(true);
        } catch (error: unknown) {
            console.error('Error uploading receipt:', error);
            if (error instanceof Error) {
                alert(`Upload failed: ${error.message}`);
            } else {
                alert('Upload failed: Unknown error');
            }
        }
        finally {
            setIsUploading(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    // Only show component if both conditions are met
    if (!isAllotmentAccepted) {
        return null;
    }

    if (success || hasUploadedReceipt) {
        return (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> Your hostel fee receipt has been submitted successfully.</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleUploadReceipt}>
            <div>
                <label className="block text-sm font-medium text-gray-700">Fee Receipt</label>
                <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            const file = e.target.files[0];
                            if (file && file.size > 80 * 1024) {
                                alert("Fee receipt size exceeds 80KB limit. Please choose a smaller file.");
                                e.target.value = "";
                            } else {
                                handleFileChange(e);
                            }
                        }
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                    required
                />
                <p className="mt-1 text-sm text-gray-500">Upload a scan or clear photo of your fee receipt (maximum 80KB).</p>
            </div>

            <div className="mt-4">
                <button
                    type="submit"
                    disabled={isUploading || !feeReceipt}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                >
                    {isUploading ? 'Uploading...' : 'Upload Receipt'}
                </button>
            </div>
        </form>
    );
}
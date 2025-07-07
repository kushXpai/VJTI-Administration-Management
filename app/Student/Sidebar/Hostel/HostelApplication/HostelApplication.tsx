'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';




interface User {
    name: string;
    email: string;
    id: string;
    role: string;
    department: string;
    year: string;
}

interface HostelApplicationProps {
    user: User;
}

export default function HostelApplication({ user }: HostelApplicationProps) {

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const [formData, setFormData] = useState({
        date_of_birth: '',
        gender: '',
        mobile_number: '',
        father_name: '',
        father_mobile: '',
        mother_name: '',
        mother_mobile: '',
        guardian_name: '',
        guardian_mobile: '',
        present_address_line1: '',
        present_address_line2: '',
        present_state: '',
        present_city: '',
        present_pin_code: '',
        permanent_address_line1: '',
        permanent_address_line2: '',
        permanent_state: '',
        permanent_city: '',
        permanent_pin_code: '',
        cet_application_id: '',
        cet_rank: '',
        course: '',
        category: '',
        is_pwd: false,
        pwd_details: '',
        is_ews: false,
        is_religious_minority: false,
        religious_minority_details: '',
        aadhar_card_number: '',
    });

    const [ageError, setAgeError] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [aadharCard, setAadharCard] = useState<File | null>(null);
    const [acknowledgementReceipt, setAcknowledgementReceipt] = useState<File | null>(null);
    const [feeReceipt, setFeeReceipt] = useState<File | null>(null);
    const [consentForm, setConsentForm] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const getMinimumAge = (course: string) => {
        if (course.startsWith('Diploma')) return { years: 15, months: 6 };
        if (course.startsWith('BTech')) return { years: 17, months: 6 };
        if (course === 'MCA') return { years: 20, months: 6 };
        if (course.startsWith('MTech')) return { years: 21, months: 6 };
        return { years: 15, months: 6 };
    };

    const validateAge = (dob: string, course: string) => {
        if (!dob || !course) return { isValid: true, message: '' };
        const birthDate = new Date(dob);
        const now = new Date();
        const min = getMinimumAge(course);
        const minDate = new Date(now);
        minDate.setFullYear(now.getFullYear() - min.years);
        minDate.setMonth(now.getMonth() - min.months);

        if (birthDate > minDate) {
            return {
                isValid: false,
                message: `Minimum age required: ${min.years} years and ${min.months} months for ${course}`,
            };
        }
        return { isValid: true, message: '' };
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => {
                const newForm = { ...prev, [name]: value };
                if (name === 'date_of_birth' || name === 'course') {
                    const validation = validateAge(
                        name === 'date_of_birth' ? value : newForm.date_of_birth,
                        name === 'course' ? value : newForm.course
                    );
                    setAgeError(validation.isValid ? '' : validation.message);
                }
                return newForm;
            });
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setFile: (f: File | null) => void) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const uploadFile = async (file: File, bucket: string, prefix: string) => {
        const ext = file.name.split('.').pop();
        const filename = `${prefix}_${user.id}_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from(bucket).upload(filename, file);
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
        return data.publicUrl;
    };


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const ageValidation = validateAge(formData.date_of_birth, formData.course);
        if (!ageValidation.isValid) {
            setError(ageValidation.message);
            setIsLoading(false);
            return;
        }

        try {
            const applicationId = uuidv4();

            const photoUrl = photo ? await uploadFile(photo, 'bucket_student_photos', 'student_photo') : null;
            const aadharUrl = aadharCard ? await uploadFile(aadharCard, 'bucket_aadhar_cards', 'aadhar_card') : null;
            const ackUrl = acknowledgementReceipt ? await uploadFile(acknowledgementReceipt, 'bucket_application_acknowledgements', 'acknowledgement_receipt') : null;
            const feeUrl = feeReceipt ? await uploadFile(feeReceipt, 'bucket_college_fee_receipts', 'fee_receipt') : null;
            const consentUrl = consentForm ? await uploadFile(consentForm, 'bucket_consent_forms', 'consent_form') : null;

            const { error: insertError } = await supabase.from('hostel_applications_db').insert([
                {
                    id: applicationId,
                    student_id: user.id,
                    ...formData,
                    student_photo_url: photoUrl,
                    aadhar_card_url: aadharUrl,
                    college_application_form_url: ackUrl,
                    college_fees_url: feeUrl,
                    consent_form_url: consentUrl,
                }
            ]);

            if (insertError) {
                console.error("Insert Error:", insertError);
                throw insertError;
            }

            setSuccess(true);
        } catch (err: any) {
            console.error("Catch Error:", err);
            if (err?.message) {
                setError(err.message);
            } else if (err?.details) {
                setError(err.details);
            } else {
                setError('An unknown error occurred while submitting your application.');
            }
        } finally {
            setIsLoading(false);
        }
    };


    const copyPermanentAddressToPresent = () => {
        setFormData(prev => ({
            ...prev,
            present_address_line1: prev.permanent_address_line1,
            present_address_line2: prev.permanent_address_line2,
            present_state: prev.permanent_state,
            present_city: prev.permanent_city,
            present_pin_code: prev.permanent_pin_code,
        }));
    };

    if (success) {
        return (
            <div className="p-6 w-full">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> Your hostel application has been submitted successfully.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full">
            <h1 className="text-2xl font-bold mb-6">Hostel Application Form</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>


                {/* Academic Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Academic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">CET Application ID</label>
                            <input
                                type="text"
                                name="cet_application_id"
                                value={formData.cet_application_id}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">CET Rank</label>
                            <input
                                type="number"
                                name="cet_rank"
                                value={formData.cet_rank}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course</label>
                            <select
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-800 focus:ring-red-800"
                                required
                            >
                                <option value="">Select a course</option>
                                {/* Diploma Courses */}
                                <optgroup label="Diploma Courses">
                                    <option value="Diploma in Civil Engineering">Diploma in Civil Engineering</option>
                                    <option value="Diploma in Electrical Engineering">Diploma in Electrical Engineering</option>
                                    <option value="Diploma in Electronics Engineering">Diploma in Electronics Engineering</option>
                                    <option value="Diploma in Mechanical Engineering">Diploma in Mechanical Engineering</option>
                                    <option value="Diploma in Textile Manufacturers">Diploma in Textile Manufacturers</option>
                                    <option value="Diploma in Chemical Engineering">Diploma in Chemical Engineering</option>
                                </optgroup>

                                {/* Undergraduate Courses */}
                                <optgroup label="Undergraduate Courses">
                                    <option value="B.Tech Degree in Civil Engineering">B.Tech Degree in Civil Engineering</option>
                                    <option value="B.Tech Degree in Computer Engineering">B.Tech Degree in Computer Engineering</option>
                                    <option value="B.Tech Degree in Electrical Engineering">B.Tech Degree in Electrical Engineering</option>
                                    <option value="B.Tech Degree in Electronics Engineering">B.Tech Degree in Electronics Engineering</option>
                                    <option value="B.Tech Degree in Electronics & Telecommunication Engineering">B.Tech Degree in Electronics & Telecommunication Engineering</option>
                                    <option value="B.Tech Degree in Information Technology">B.Tech Degree in Information Technology</option>
                                    <option value="B.Tech Degree in Mechanical Engineering">B.Tech Degree in Mechanical Engineering</option>
                                    <option value="B.Tech Degree in Production Engineering">B.Tech Degree in Production Engineering</option>
                                    <option value="B.Tech Degree in Textile Technology">B.Tech Degree in Textile Technology</option>
                                </optgroup>

                                {/* Postgraduate Courses */}
                                <optgroup label="Postgraduate Courses">
                                    <option value="Master of Computer Application">Master of Computer Application</option>
                                    <option value="M.Tech Degree in Civil Engineering">M.Tech Degree in Civil Engineering</option>
                                    <option value="M.Tech Degree in Computer Engineering">M.Tech Degree in Computer Engineering</option>
                                    <option value="M.Tech Degree in Electrical Engineering">M.Tech Degree in Electrical Engineering</option>
                                    <option value="M.Tech Degree in Internet of Things (IOT)">M.Tech Degree in Internet of Things (IOT)</option>
                                    <option value="M.Tech Degree in Electronics & Telecommunication Engineering">M.Tech Degree in Electronics & Telecommunication Engineering</option>
                                    <option value="M.Tech Degree in Mechanical Engineering">M.Tech Degree in Mechanical Engineering</option>
                                    <option value="M.Tech Degree in Production Engineering">M.Tech Degree in Production Engineering</option>
                                    <option value="M.Tech Degree in Project Management">M.Tech Degree in Project Management</option>
                                    <option value="M.Tech Degree in Technical Textile">M.Tech Degree in Technical Textile</option>
                                    <option value="M.Tech Degree in Defence Technology">M.Tech Degree in Defence Technology</option>
                                </optgroup>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-800 focus:ring-red-800"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="General">General</option>
                                <option value="OBC">OBC</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                                <option value="NT">NT</option>
                                <option value="SBC">SBC</option>
                                <option value="SEBC">SEBC</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${ageError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {ageError && (
                                <p className="mt-1 text-sm text-red-600">{ageError}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile_number"
                                value={formData.mobile_number}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Aadhar Card Number</label>
                            <input
                                type="text"
                                name="aadhar_card_number"
                                value={formData.aadhar_card_number}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Parent/Guardian Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Parent/Guardian Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Father&apos;s Name</label>
                            <input
                                type="text"
                                name="father_name"
                                value={formData.father_name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Father&apos;s Mobile</label>
                            <input
                                type="tel"
                                name="father_mobile"
                                value={formData.father_mobile}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mother&apos;s Name</label>
                            <input
                                type="text"
                                name="mother_name"
                                value={formData.mother_name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mother&apos;s Mobile</label>
                            <input
                                type="tel"
                                name="mother_mobile"
                                value={formData.mother_mobile}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Guardian&apos;s Name</label>
                            <input
                                type="text"
                                name="guardian_name"
                                value={formData.guardian_name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Guardian&apos;s Mobile</label>
                            <input
                                type="tel"
                                name="guardian_mobile"
                                value={formData.guardian_mobile}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Permanent Address */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Permanent Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                            <input
                                type="text"
                                name="permanent_address_line1"
                                value={formData.permanent_address_line1}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                            <input
                                type="text"
                                name="permanent_address_line2"
                                value={formData.permanent_address_line2}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">State</label>
                            <input
                                type="text"
                                name="permanent_state"
                                value={formData.permanent_state}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input
                                type="text"
                                name="permanent_city"
                                value={formData.permanent_city}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                            <input
                                type="text"
                                name="permanent_pin_code"
                                value={formData.permanent_pin_code}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Present Address */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Present Address</h2>
                        <button
                            type="button"
                            onClick={copyPermanentAddressToPresent}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Same as Permanent
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                            <input
                                type="text"
                                name="present_address_line1"
                                value={formData.present_address_line1}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                            <input
                                type="text"
                                name="present_address_line2"
                                value={formData.present_address_line2}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">State</label>
                            <input
                                type="text"
                                name="present_state"
                                value={formData.present_state}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input
                                type="text"
                                name="present_city"
                                value={formData.present_city}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                            <input
                                type="text"
                                name="present_pin_code"
                                value={formData.present_pin_code}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="is_pwd"
                                    name="is_pwd"
                                    type="checkbox"
                                    checked={formData.is_pwd}
                                    onChange={handleChange}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="is_pwd" className="font-medium text-gray-700">Person with Disability</label>
                            </div>
                        </div>

                        {formData.is_pwd && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Disability Details</label>
                                <textarea
                                    name="pwd_details"
                                    value={formData.pwd_details}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        )}

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="is_ews"
                                    name="is_ews"
                                    type="checkbox"
                                    checked={formData.is_ews}
                                    onChange={handleChange}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="is_ews" className="font-medium text-gray-700">Economically Weaker Section (EWS)</label>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="is_religious_minority"
                                    name="is_religious_minority"
                                    type="checkbox"
                                    checked={formData.is_religious_minority}
                                    onChange={handleChange}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="is_religious_minority" className="font-medium text-gray-700">Religious Minority</label>
                            </div>
                        </div>

                        {formData.is_religious_minority && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Religious Minority Details</label>
                                <textarea
                                    name="religious_minority_details"
                                    value={formData.religious_minority_details}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Document Upload */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Document Upload</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        const file = e.target.files[0];
                                        if (file && file.size > 50 * 1024) {
                                            alert("Photo size exceeds 50KB limit. Please choose a smaller file.");
                                            e.target.value = "";
                                        } else {
                                            handleFileChange(e, setPhoto);
                                        }
                                    }
                                }}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">Please upload a recent passport size photo (maximum 50KB).</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Aadhar Card</label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        const file = e.target.files[0];
                                        if (file && file.size > 100 * 1024) {
                                            alert("Aadhar card size exceeds 100KB limit. Please choose a smaller file.");
                                            e.target.value = "";
                                        } else {
                                            handleFileChange(e, setAadharCard);
                                        }
                                    }
                                }}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">Upload a scan or clear photo of your Aadhar card (maximum 100KB).</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Acknowledgement Receipt</label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        const file = e.target.files[0];
                                        if (file && file.size > 80 * 1024) {
                                            alert("Acknowledgement receipt size exceeds 80KB limit. Please choose a smaller file.");
                                            e.target.value = "";
                                        } else {
                                            handleFileChange(e, setAcknowledgementReceipt);
                                        }
                                    }
                                }}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">Upload the acknowledgement receipt provided during your application (maximum 80KB).</p>
                        </div>
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
                                            handleFileChange(e, setFeeReceipt);
                                        }
                                    }
                                }}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">Upload the payment receipt of your course fees (maximum 80KB).</p>
                        </div>

                        {/* Consent Form Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Consent Form</label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        const file = e.target.files[0];
                                        if (file.size > 80 * 1024) {
                                            alert("Consent form exceeds 80KB limit.");
                                            e.target.value = "";
                                        } else {
                                            handleFileChange(e, setConsentForm);
                                        }
                                    }
                                }}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100"
                            />
                            <p className="mt-1 text-sm text-gray-500">Upload your signed consent form (max 80KB).</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-red-700 text-white rounded hover:bg-red-800 disabled:opacity-50"
                    >
                        {isLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </div>
            </form>
        </div>
    );
}

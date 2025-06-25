// // app/Student/Sidebar/Grievances/Components/GrievanceForm.tsx

// 'use client';

// import { useState, useRef } from 'react';
// import { createClient } from '@supabase/supabase-js';
// import { User } from '../GrievancesContent';
// import Image from 'next/image';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// interface GrievanceFormProps {
//     user: User;
//     onGrievanceSubmitted: () => void;
// }

// type CategoryType = 'Hostel' | 'Mess' | 'General';

// export default function GrievanceForm({ user, onGrievanceSubmitted }: GrievanceFormProps) {
//     const [category, setCategory] = useState<CategoryType>('General');
//     const [issueText, setIssueText] = useState('');
//     const [imageFile, setImageFile] = useState<File | null>(null);
//     const [imagePreview, setImagePreview] = useState<string | null>(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [success, setSuccess] = useState<string | null>(null);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files && e.target.files[0];

//         if (file) {
//             if (file.size > 1 * 1024 * 1024) { // 1MB limit
//                 setError('Image size cannot exceed 1MB');
//                 return;
//             }

//             setImageFile(file);

//             // Create preview
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setImagePreview(reader.result as string);
//             };
//             reader.readAsDataURL(file);
//             setError(null);
//         }
//     };

//     const handleRemoveImage = () => {
//         setImageFile(null);
//         setImagePreview(null);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!issueText.trim()) {
//             setError('Please describe your issue');
//             return;
//         }

//         setIsSubmitting(true);
//         setError(null);

//         try {
//             let imageUrl = null;

//             // Upload image if provided
//             if (imageFile) {
//                 const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;

//                 const { error: uploadError } = await supabase.storage
//                     .from('grievances')
//                     .upload(fileName, imageFile);

//                 if (uploadError) {
//                     throw new Error(`Error uploading image: ${uploadError.message}`);
//                 }

//                 // Get public URL
//                 const { data: urlData } = supabase.storage
//                     .from('grievances')
//                     .getPublicUrl(fileName);

//                 imageUrl = urlData.publicUrl;
//             }

//             // Insert grievance record
//             const { error: insertError } = await supabase
//                 .from('grievances')
//                 .insert([
//                     {
//                         student_id: user.id,
//                         category,
//                         issue_text: issueText,
//                         image_url: imageUrl,
//                         status: 'Pending'
//                     }
//                 ])
//                 .select();

//             if (insertError) {
//                 throw new Error(`Error submitting grievance: ${insertError.message}`);
//             }

//             setSuccess('Your grievance has been submitted successfully!');
//             setIssueText('');
//             setCategory('General');
//             setImageFile(null);
//             setImagePreview(null);

//             // Call the callback after successful submission
//             setTimeout(() => {
//                 onGrievanceSubmitted();
//             }, 1500);

//         } catch (err) {
//             const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
//             setError(errorMessage);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div className="bg-white rounded-lg shadow-sm p-6">
//             <h2 className="text-xl font-bold mb-6">Submit New Grievance</h2>

//             {error && (
//                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
//                     {error}
//                 </div>
//             )}

//             {success && (
//                 <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
//                     {success}
//                 </div>
//             )}

//             <form onSubmit={handleSubmit}>
//                 <div className="mb-4">
//                     <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
//                         Category
//                     </label>
//                     <select
//                         id="category"
//                         value={category}
//                         onChange={(e) => setCategory(e.target.value as CategoryType)}
//                         className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
//                         disabled={isSubmitting}
//                         required
//                     >
//                         <option value="General">General</option>
//                         <option value="Hostel">Hostel</option>
//                         <option value="Mess">Mess</option>
//                     </select>
//                 </div>

//                 <div className="mb-4">
//                     <label htmlFor="issueText" className="block text-sm font-medium text-gray-700 mb-1">
//                         Describe your issue
//                     </label>
//                     <textarea
//                         id="issueText"
//                         value={issueText}
//                         onChange={(e) => setIssueText(e.target.value)}
//                         placeholder="Please describe your issue in detail. If it's related to a specific room, please mention your room number (e.g., T204)..."
//                         className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
//                         rows={5}
//                         disabled={isSubmitting}
//                         required
//                     ></textarea>
//                 </div>

//                 <div className="mb-6">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Attach Image (Optional)
//                     </label>

//                     {!imagePreview ? (
//                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
//                             <div className="space-y-1 text-center">
//                                 <svg
//                                     className="mx-auto h-12 w-12 text-gray-400"
//                                     stroke="currentColor"
//                                     fill="none"
//                                     viewBox="0 0 48 48"
//                                     aria-hidden="true"
//                                 >
//                                     <path
//                                         d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
//                                         strokeWidth={2}
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                     />
//                                 </svg>
//                                 <div className="flex text-sm text-gray-600">
//                                     <label
//                                         htmlFor="file-upload"
//                                         className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
//                                     >
//                                         <span>Upload a file</span>
//                                         <input
//                                             id="file-upload"
//                                             name="file-upload"
//                                             type="file"
//                                             ref={fileInputRef}
//                                             className="sr-only"
//                                             accept="image/*"
//                                             onChange={handleImageChange}
//                                             disabled={isSubmitting}
//                                         />
//                                     </label>
//                                     <p className="pl-1">or drag and drop</p>
//                                 </div>
//                                 <p className="text-xs text-gray-500">PNG, JPG, GIF up to 1MB</p>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="mt-1 relative">
//                             <Image
//                                 src={imagePreview || '/default-image.jpg'}
//                                 alt="Preview"
//                                 width={200}
//                                 height={200}
//                                 className="max-h-40 rounded border border-gray-300"
//                             />
//                             <button
//                                 type="button"
//                                 className="absolute top-2 right-2 bg-red-600 rounded-full p-1 text-white shadow-sm"
//                                 onClick={handleRemoveImage}
//                                 disabled={isSubmitting}
//                             >
//                                 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 <div className="flex justify-end space-x-4">
//                     <button
//                         type="button"
//                         className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
//                         onClick={() => onGrievanceSubmitted()}
//                         disabled={isSubmitting}
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded flex items-center"
//                         disabled={isSubmitting}
//                     >
//                         {isSubmitting ? (
//                             <>
//                                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                 </svg>
//                                 Submitting...
//                             </>
//                         ) : (
//                             'Submit Grievance'
//                         )}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }
//--------------------------------------------------------------------------------
// 'use client';

// import { useState, useRef } from 'react';
// import { createClient } from '@supabase/supabase-js';
// import { User } from '../GrievancesContent';
// import Image from 'next/image';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// interface GrievanceFormProps {
//     user: User;
//     onGrievanceSubmitted: () => void;
// }

// type CategoryType = 'Hostel' | 'Mess' | 'General';
// type SubcategoryType = 'Plumber' | 'Carpenter' | 'Mason' | 'Electrician' | 'Other';

// const SUBCATEGORIES: SubcategoryType[] = ['Plumber', 'Carpenter', 'Mason', 'Electrician', 'Other'];

// export default function GrievanceForm({ user, onGrievanceSubmitted }: GrievanceFormProps) {
//     const [category, setCategory] = useState<CategoryType>('General');
//     const [subcategory, setSubcategory] = useState<SubcategoryType>('Other');
//     const [location, setLocation] = useState('');
//     const [issueText, setIssueText] = useState('');
//     const [imageFile, setImageFile] = useState<File | null>(null);
//     const [imagePreview, setImagePreview] = useState<string | null>(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [success, setSuccess] = useState<string | null>(null);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             if (file.size > 1 * 1024 * 1024) {
//                 setError('Image size cannot exceed 1MB');
//                 return;
//             }
//             setImageFile(file);
//             const reader = new FileReader();
//             reader.onloadend = () => setImagePreview(reader.result as string);
//             reader.readAsDataURL(file);
//             setError(null);
//         }
//     };

//     const handleRemoveImage = () => {
//         setImageFile(null);
//         setImagePreview(null);
//         if (fileInputRef.current) fileInputRef.current.value = '';
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!issueText.trim()) {
//             setError('Please describe your issue');
//             return;
//         }

//         if ((category === 'Hostel' || category === 'General') && !subcategory) {
//             setError('Please select a subcategory');
//             return;
//         }

//         setIsSubmitting(true);
//         setError(null);

//         try {
//             let imageUrl: string | null = null;

//             if (imageFile) {
//                 const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;

//                 const { error: uploadError } = await supabase.storage
//                     .from('bucket_grievance_images')
//                     .upload(fileName, imageFile);

//                 if (uploadError) throw new Error(`Error uploading image: ${uploadError.message}`);

//                 const { data: urlData } = supabase.storage
//                     .from('bucket_grievance_images')
//                     .getPublicUrl(fileName);

//                 imageUrl = urlData.publicUrl;
//             }


//             const { error: insertError } = await supabase
//                 .from('grievances_db')
//                 .insert([{
//                     student_id: user.id,
//                     category,
//                     subcategory,
//                     location: location || null,
//                     description: issueText,
//                     image_url: imageUrl,
//                     status: 'Pending'
//                 }]);

//             if (insertError) throw new Error(`Error submitting grievance: ${insertError.message}`);

//             setSuccess('Your grievance has been submitted successfully!');
//             setIssueText('');
//             setLocation('');
//             setCategory('General');
//             setSubcategory('Other');
//             setImageFile(null);
//             setImagePreview(null);
//             setTimeout(() => onGrievanceSubmitted(), 1500);
//         } catch (err) {
//             const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
//             setError(errorMessage);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div className="bg-white rounded-lg shadow-sm p-6">
//             <h2 className="text-xl font-bold mb-6">Submit New Grievance</h2>

//             {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
//             {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

//             <form onSubmit={handleSubmit}>
//                 {/* Category */}
//                 <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//                     <select
//                         value={category}
//                         onChange={(e) => setCategory(e.target.value as CategoryType)}
//                         className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
//                         disabled={isSubmitting}
//                         required
//                     >
//                         <option value="General">General</option>
//                         <option value="Hostel">Hostel</option>
//                         <option value="Mess">Mess</option>
//                     </select>
//                 </div>

//                 {/* Subcategory */}
//                 {(category === 'Hostel' || category === 'General') && (
//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
//                         <select
//                             value={subcategory}
//                             onChange={(e) => setSubcategory(e.target.value as SubcategoryType)}
//                             className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
//                             disabled={isSubmitting}
//                             required
//                         >
//                             {SUBCATEGORIES.map((s) => (
//                                 <option key={s} value={s}>{s}</option>
//                             ))}
//                         </select>
//                     </div>
//                 )}

//                 {/* Location */}
//                 <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
//                     <input
//                         type="text"
//                         value={location}
//                         onChange={(e) => setLocation(e.target.value)}
//                         placeholder="E.g., Room T204, 2nd Floor"
//                         className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
//                         disabled={isSubmitting}
//                     />
//                 </div>

//                 {/* Description */}
//                 <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Describe your issue</label>
//                     <textarea
//                         value={issueText}
//                         onChange={(e) => setIssueText(e.target.value)}
//                         placeholder="Describe your issue clearly..."
//                         className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
//                         rows={5}
//                         disabled={isSubmitting}
//                         required
//                     ></textarea>
//                 </div>

//                 {/* Image upload */}
//                 <div className="mb-6">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Attach Image (Optional)</label>
//                     {!imagePreview ? (
//                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
//                             <div className="text-center space-y-1">
//                                 <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
//                                     <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
//                                 </svg>
//                                 <label htmlFor="file-upload" className="text-sm text-red-600 hover:text-red-500 cursor-pointer">
//                                     Upload a file
//                                     <input id="file-upload" type="file" ref={fileInputRef} className="sr-only" accept="image/*" onChange={handleImageChange} disabled={isSubmitting} />
//                                 </label>
//                                 <p className="text-xs text-gray-500">PNG, JPG, GIF up to 1MB</p>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="relative mt-1">
//                             <Image src={imagePreview} alt="Preview" width={200} height={200} className="rounded border border-gray-300 max-h-40" />
//                             <button
//                                 type="button"
//                                 className="absolute top-2 right-2 bg-red-600 rounded-full p-1 text-white shadow-sm"
//                                 onClick={handleRemoveImage}
//                                 disabled={isSubmitting}
//                             >
//                                 <svg className="h-4 w-4" stroke="currentColor" fill="none" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 {/* Action buttons */}
//                 <div className="flex justify-end gap-4">
//                     <button
//                         type="button"
//                         className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
//                         onClick={() => onGrievanceSubmitted()}
//                         disabled={isSubmitting}
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded flex items-center"
//                         disabled={isSubmitting}
//                     >
//                         {isSubmitting ? (
//                             <>
//                                 <svg className="animate-spin mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
//                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
//                                     <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
//                                 </svg>
//                                 Submitting...
//                             </>
//                         ) : (
//                             'Submit Grievance'
//                         )}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }










'use client';

import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '../GrievancesContent';
import Image from 'next/image';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface GrievanceFormProps {
    user: User;
    onGrievanceSubmitted: () => void;
}

type CategoryType = 'Hostel' | 'Mess' | 'General';
type SubcategoryType = 'Plumber' | 'Carpenter' | 'Mason' | 'Electrician' | 'Other';

const SUBCATEGORIES: SubcategoryType[] = ['Plumber', 'Carpenter', 'Mason', 'Electrician', 'Other'];

export default function GrievanceForm({ user, onGrievanceSubmitted }: GrievanceFormProps) {
    const [category, setCategory] = useState<CategoryType>('General');
    const [subcategory, setSubcategory] = useState<SubcategoryType>('Other');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) {
                setError('Image size cannot exceed 1MB');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            setError('Please describe your issue');
            return;
        }

        if ((category === 'Hostel' || category === 'General') && !subcategory) {
            setError('Please select a subcategory');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            let imageUrl: string | null = null;

            if (imageFile) {
                const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('bucket_grievance_images')
                    .upload(fileName, imageFile);

                if (uploadError) throw new Error(`Error uploading image: ${uploadError.message}`);

                const { data: urlData } = supabase.storage
                    .from('bucket_grievance_images')
                    .getPublicUrl(fileName);

                imageUrl = urlData.publicUrl;
            }

            const { error: insertError } = await supabase
                .from('grievances_db')
                .insert([{
                    student_id: user.id,
                    category,
                    subcategory,
                    location: location || null,
                    description,
                    image_url: imageUrl,
                    status: 'Pending'
                }]);

            if (insertError) throw new Error(`Error submitting grievance: ${insertError.message}`);

            setSuccess('Your grievance has been submitted successfully!');
            setDescription('');
            setLocation('');
            setCategory('General');
            setSubcategory('Other');
            setImageFile(null);
            setImagePreview(null);
            setTimeout(() => onGrievanceSubmitted(), 1500);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Submit New Grievance</h2>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

            <form onSubmit={handleSubmit}>
                {/* Category */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CategoryType)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                        disabled={isSubmitting}
                        required
                    >
                        <option value="General">General</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Mess">Mess</option>
                    </select>
                </div>

                {/* Subcategory */}
                {(category === 'Hostel' || category === 'General') && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                        <select
                            value={subcategory}
                            onChange={(e) => setSubcategory(e.target.value as SubcategoryType)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                            disabled={isSubmitting}
                            required
                        >
                            {SUBCATEGORIES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Location */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="E.g., Room T204, 2nd Floor"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Describe your issue</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your issue clearly..."
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                        rows={5}
                        disabled={isSubmitting}
                        required
                    ></textarea>
                </div>

                {/* Image upload */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attach Image (Optional)</label>
                    {!imagePreview ? (
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                            <div className="text-center space-y-1">
                                <label htmlFor="file-upload" className="text-sm text-red-600 hover:text-red-500 cursor-pointer">
                                    Upload a file
                                    <input id="file-upload" type="file" ref={fileInputRef} className="sr-only" accept="image/*" onChange={handleImageChange} disabled={isSubmitting} />
                                </label>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 1MB</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative mt-1">
                            <Image src={imagePreview} alt="Preview" width={200} height={200} className="rounded border border-gray-300 max-h-40" />
                            <button
                                type="button"
                                className="absolute top-2 right-2 bg-red-600 rounded-full p-1 text-white shadow-sm"
                                onClick={handleRemoveImage}
                                disabled={isSubmitting}
                            >
                                <svg className="h-4 w-4" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                        onClick={() => onGrievanceSubmitted()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded flex items-center"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                                </svg>
                                Submitting...
                            </>
                        ) : (
                            'Submit Grievance'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

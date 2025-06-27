"use client";

import { useState } from "react";
import Header from "@/app/Components/Header";
import Footer from "@/app/Components/Footer";
import { supabase } from "@/supabase/supabaseClient";

export default function GenerateNotice() {
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!pdfFile) {
        alert("Please upload a PDF");
        return;
      }

      const { data: storageData, error: uploadError } = await supabase.storage
        .from("bucket_notice_documents")
        .upload(`${Date.now()}-${pdfFile.name}`, pdfFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return;
      }

      const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bucket_notice_documents/${storageData?.path}`;

      const { error: insertError } = await supabase
        .from("notices_db")
        .insert({ title, description: desc, notice_url: pdfUrl });

      if (insertError) {
        console.error("Insert error:", insertError);
      } else {
        alert("Notice uploaded successfully");
        setTitle("");
        setDesc("");
        setPdfFile(null);
      }
    } catch (err) {
      console.error("Unhandled error:", err); // ✅ This will catch unexpected issues
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header
        rightContent={
          <div className="flex flex-col items-end">
            <span className="text-2xl font-extrabold text-[#800000] tracking-tight drop-shadow-sm">
              Notice Management
            </span>
            <span className="text-base text-gray-500 font-medium">
              Generate Notice
            </span>
          </div>
        }
      />

      <div className="flex flex-col gap-4 max-w-6xl mx-auto w-full py-6 px-4">
        <h1 className="text-2xl font-bold text-[#800000] mb-2">
          Generate new notice
        </h1>
      </div>

      <form
        onSubmit={handleNoticeSubmit}
        className="w-[60%] mx-auto p-6 bg-white rounded-xl shadow-md space-y-6 mb-20"
      >
        <div>
          <label className="block text-xl font-semibold mb-2">
            Notice Title
          </label>
          <input
            type="text"
            value={title}
            placeholder="Enter title"
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xl font-semibold mb-2">
            Notice Description
          </label>
          <textarea
            placeholder="Write the description here..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div>
          <label className="block text-xl font-semibold mb-2">Upload PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target?.files?.[0];
              if (file) {
                // safe to use file
                setPdfFile(file);
              }
            }}
            className="w-full file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        </div>

        <button
          type="submit"
          disabled={!title || !desc || !pdfFile}
          className="w-full py-3 bg-red-700 text-white rounded-lg text-lg hover:bg-red-800 transition duration-300 hover: cursor-pointer disabled:cursor-not-allowed disabled:bg-red-300"
        >
          Submit
        </button>
      </form>

      <Footer />
    </div>
  );
}

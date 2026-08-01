import React, { useState, useEffect } from "react";
import { Plus, Upload, FileText, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import DocumentCard from "../../components/documents/DocumentCard";

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data || []);
    } catch (error) {
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a valid PDF document.");
        return;
      }
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile || !uploadTitle.trim()) {
      toast.error("Please provide a title and select a PDF file.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadTitle.trim());

      await documentService.uploadDocument(formData);

      toast.success("Document uploaded successfully! AI text processing started.");

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");

      fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);

    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`${selectedDoc.title} deleted successfully`);

      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      setDocuments((prev) => prev.filter((d) => d._id !== selectedDoc._id));
    } catch (error) {
      toast.error(error.message || "Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Study Documents
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload PDF materials to automatically generate flashcards, quizzes, and AI study chats.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-btn text-sm font-bold text-white shadow-lg shadow-indigo-600/30"
        >
          <Plus size={18} strokeWidth={2.5} />
          Upload PDF Document
        </button>
      </div>

      {/* Document Grid */}
      {loading ? (
        <Spinner />
      ) : documents.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 my-10 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No documents yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Upload your first textbook, lecture notes, or article PDF to start AI learning!
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-6 py-3 rounded-xl gradient-btn text-sm font-bold text-white"
          >
            Upload PDF Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Upload size={20} />
              </div>
              <h2 className="text-xl font-bold text-white">Upload PDF</h2>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Document Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 - Machine Learning Basics"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Select PDF File
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer bg-slate-900/40 relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  <FileText className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-white">
                    {uploadFile ? uploadFile.name : "Click or drag PDF file here"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Maximum file size 10MB</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-xl gradient-btn text-sm font-bold text-white shadow-md disabled:opacity-50"
                >
                  {uploading ? "Processing PDF..." : "Upload & Analyze"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-sm p-6 rounded-2xl border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Document?</h3>
            <p className="text-slate-400 text-xs mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">{selectedDoc?.title}</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
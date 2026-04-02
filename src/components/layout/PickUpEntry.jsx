import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiX,
  FiFileText,
  FiCheckCircle,
  FiUploadCloud,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://192.168.1.14:8005").replace(/\/$/, "");

const TABLE_COLUMNS = [
  { key: "order_no", label: "Order No." },
  { key: "po_number", label: "PO Number" },
  { key: "invoice_no", label: "Invoice No." },
  { key: "order_date", label: "Order Date" },
  { key: "invoice_date", label: "Invoice Date" },
  { key: "customer_name", label: "Customer Name" },
  { key: "full_address", label: "Full Address" },
  { key: "sku_name", label: "SKU Name" },
  { key: "size", label: "Size" },
  { key: "qty", label: "Qty" },
  { key: "color", label: "Color" },
  { key: "grand_total", label: "Grand Total" },
  { key: "order_items_summary", label: "Order Items" },
];

const formatOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return "—";

  return items
    .map((item) => {
      const product = item?.product || "Item";
      const qty = item?.qty ?? "—";
      const total = item?.total ?? "—";
      return `${product} | Qty: ${qty} | Total: ${total}`;
    })
    .join(" ; ");
};

const PickUpEntry = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { activeAccount } = useAuth();
  const accountName = activeAccount?.account_name || "No account selected";
  const activeAccountId = activeAccount?.id;
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedRows, setUploadedRows] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const tableRows = useMemo(
    () =>
      uploadedRows.map((row, index) => ({
        ...row,
        id: row?.order_no || row?.invoice_no || `${index}`,
        order_items_summary: formatOrderItems(row?.order_items),
      })),
    [uploadedRows]
  );

  const handleUploadButtonClick = () => {
    if (!activeAccountId || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF files are allowed.");
      setSuccessMessage("");
      return;
    }

    if (!activeAccountId) {
      setErrorMessage("Active account not selected.");
      setSuccessMessage("");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/upload-label`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          account: String(activeAccountId),
        },
        body: formData,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok || responseData?.status === false) {
        throw new Error(
          responseData?.message || `Upload failed with status ${response.status}.`
        );
      }

      const rows = responseData?.data || [];
      setUploadedRows(Array.isArray(rows) ? rows : []);
      setUploadedFileName(file.name);
      setSuccessMessage(responseData?.message || "PDF uploaded successfully.");
    } catch (error) {
      setUploadedRows([]);
      setUploadedFileName("");
      setErrorMessage(error?.message || "PDF upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg p-4 flex flex-col gap-4 font-sans max-w-[1600px] mx-auto">
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-4 rounded-2xl flex justify-between items-center shadow-lg shadow-red-600/20">
        <div className="flex items-center gap-3">
          <FiFileText size={20} className="text-white/80" />
          <h1 className="font-black tracking-tight text-lg uppercase">
            Import Label File (Pick-Up) <span className="text-white/60 font-medium">— {accountName}</span>
          </h1>
        </div>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-90"
          onClick={() => navigate("/dashboard")}
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="flex-1">
        <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 relative min-h-[calc(100vh-180px)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex items-center gap-2 text-gray-900">
                <h2 className="text-lg font-black tracking-tight uppercase">Order Details Preview</h2>
                <div className="h-px flex-1 bg-gray-50 min-w-[80px]" />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {uploadedFileName ? (
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    File: <span className="text-gray-800 normal-case">{uploadedFileName}</span>
                  </span>
                ) : null}

                <button
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${
                    !activeAccountId || isUploading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover"
                  }`}
                  onClick={handleUploadButtonClick}
                  disabled={!activeAccountId || isUploading}
                >
                  {isUploading ? <FiLoader size={14} className="animate-spin" /> : <FiUploadCloud size={14} />}
                  {isUploading ? "Uploading..." : "Upload Label"}
                </button>
              </div>
            </div>

            {errorMessage ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <FiAlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {successMessage ? (
              <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <FiCheckCircle size={16} />
                <span>{successMessage}</span>
              </div>
            ) : null}
          </div>

          <div className="flex-1 overflow-auto rounded-2xl border border-gray-50 shadow-inner bg-gray-50/20">
            <table className="w-full text-left text-[0.7rem] border-collapse min-w-[1600px]">
              <thead className="sticky top-0 bg-amber-50 text-amber-800 font-bold uppercase tracking-tighter z-10">
                <tr>
                  {TABLE_COLUMNS.map((column) => (
                    <th key={column.key} className="px-4 py-3 border-b border-amber-100 whitespace-nowrap">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {tableRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMNS.length}
                      className="px-4 py-32 text-center text-gray-400 font-bold uppercase tracking-widest italic opacity-50"
                    >
                      Upload a PDF label file to preview contents
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors align-top">
                      {TABLE_COLUMNS.map((column) => (
                        <td key={column.key} className="px-4 py-3 text-gray-700">
                          <div className={column.key === "full_address" || column.key === "order_items_summary" ? "min-w-[260px] whitespace-normal" : "whitespace-nowrap"}>
                            {row?.[column.key] ?? "—"}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
              Total Rows: {tableRows.length}
            </span>

            <div className="flex gap-3">
              <button
                className="px-6 py-2.5 bg-gray-100 text-gray-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                onClick={() => navigate("/dashboard")}
              >
                Close
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[0.6rem] font-bold text-amber-600 uppercase tracking-widest">
            <FiCheckCircle size={12} className="opacity-50" />
            * Please verify all entries before committing to import
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickUpEntry;

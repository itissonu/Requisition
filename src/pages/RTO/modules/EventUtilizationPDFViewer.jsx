import React, { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { Download, X } from "lucide-react";
import logo from '../../../assests/logo.png';

const EventUtilizationPDFViewer = ({ eventData, isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfContentRef = useRef(null);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = pdfContentRef.current;
      const opt = {
        margin: 10,
        filename: `Event_Requisition_${eventData.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF: " + error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || !eventData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div style={{ backgroundColor: '#1e3a8a' }} className="text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Vehicle Requisition Report</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              style={{ backgroundColor: '#16a34a' }}
              className="flex items-center gap-2 hover:opacity-90 px-4 py-2 rounded transition-all disabled:opacity-50 text-white"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#f3f4f6' }}>
          <div
            ref={pdfContentRef}
            style={{ 
              width: '210mm', 
              minHeight: '297mm',
              backgroundColor: '#ffffff',
              padding: '48px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              margin: '0 auto'
            }}
          >
            {/* Header with Logo */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '24px',
              borderBottom: '2px solid #1f2937',
              paddingBottom: '16px'
            }}>
              <div style={{ fontSize: '12px' }}>
                <p style={{ fontWeight: 'bold', margin: '2px 0' }}>OFFICE OF THE</p>
                <p style={{ fontWeight: 'bold', margin: '2px 0' }}>COLLECTOR & DISTRICT MAGISTRATE</p>
                <p style={{ fontWeight: 'bold', margin: '2px 0' }}>{eventData.district?.toUpperCase() || "GANJAM"}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={logo} alt="Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
              </div>

              <div style={{ textAlign: 'right', fontSize: '12px' }}>
                <p style={{ margin: '2px 0' }}>Ph: {eventData.collectorPhone || "+91-XXXXXXXXXX"}</p>
                <p style={{ margin: '2px 0' }}>Email: {eventData.collectorEmail || "collector@odisha.gov.in"}</p>
              </div>
            </div>

            {/* Document Number and Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '12px' }}>
              <p style={{ margin: 0 }}>No. {eventData.requestEventLetterNo || `REQ/${eventData.id}/2025`}</p>
              <p style={{ margin: 0 }}>Date: {new Date(eventData.createdAt || Date.now()).toLocaleDateString('en-GB')}</p>
            </div>

            {/* Title */}
            <h1 style={{ 
              textAlign: 'center', 
              fontWeight: 'bold', 
              fontSize: '16px', 
              marginBottom: '24px',
              textDecoration: 'underline',
              margin: '0 0 24px 0'
            }}>
              VEHICLE REQUISITION ORDER
            </h1>

            {/* Event Details */}
            <div style={{ marginBottom: '24px', fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ textAlign: 'justify', marginBottom: '12px' }}>
                <span style={{ fontWeight: '600' }}>Whereas</span>, it appears to me that vehicles are required for 
                <span style={{ fontWeight: '600' }}> {eventData.eventName}</span> by 
                <span style={{ fontWeight: '600' }}> {eventData.requestingDepartment}</span> from 
                <span style={{ fontWeight: '600' }}> {new Date(eventData.dateOfReporting).toLocaleDateString('en-GB')}</span> to 
                <span style={{ fontWeight: '600' }}> {new Date(eventData.dateOfRelease).toLocaleDateString('en-GB')}</span>.
              </p>

              <p style={{ textAlign: 'justify', marginBottom: '12px' }}>
                <span style={{ fontWeight: '600' }}>Now, therefore</span>, in exercise of powers conferred on me under Section 3 of Omnibus Requisition Act, 1984, 
                I, the Collector & District Magistrate, {eventData.district || "Ganjam"} do hereby requisition the vehicles specified in the Schedule below.
              </p>

              {eventData.remarks && (
                <p style={{ textAlign: 'justify', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '600' }}>Remarks:</span> {eventData.remarks}
                </p>
              )}
            </div>

            {/* SCHEDULE */}
            <h2 style={{ 
              fontWeight: 'bold', 
              fontSize: '14px', 
              marginBottom: '12px',
              marginTop: '24px',
              textAlign: 'center'
            }}>
              SCHEDULE
            </h2>

            {eventData.subEventUtilizations?.map((subEvent, idx) => (
              <div key={idx} style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontWeight: '600', 
                  fontSize: '12px', 
                  marginBottom: '12px',
                  backgroundColor: '#f3f4f6',
                  padding: '8px'
                }}>
                  {idx + 1}. {subEvent.subEventPlace} 
                  ({new Date(subEvent.subEventReportingDate).toLocaleDateString('en-GB')} at {subEvent.subEventStartTime})
                </h3>

                <table style={{ 
                  width: '100%', 
                  fontSize: '11px',
                  borderCollapse: 'collapse',
                  border: '2px solid #9ca3af',
                  marginBottom: '16px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e5e7eb' }}>
                      <th style={{ 
                        border: '2px solid #9ca3af', 
                        padding: '8px', 
                        textAlign: 'left',
                        fontWeight: 'bold'
                      }}>S.No</th>
                      <th style={{ 
                        border: '2px solid #9ca3af', 
                        padding: '8px', 
                        textAlign: 'left',
                        fontWeight: 'bold'
                      }}>Vehicle Type</th>
                      <th style={{ 
                        border: '2px solid #9ca3af', 
                        padding: '8px', 
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}>Quantity Required</th>
                      <th style={{ 
                        border: '2px solid #9ca3af', 
                        padding: '8px', 
                        textAlign: 'right',
                        fontWeight: 'bold'
                      }}>Estimated Cost (₹)</th>
                      <th style={{ 
                        border: '2px solid #9ca3af', 
                        padding: '8px', 
                        textAlign: 'left',
                        fontWeight: 'bold'
                      }}>Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subEvent.vehicleUtilizations?.map((vehicle, vIdx) => (
                      <tr key={vIdx} style={{ backgroundColor: vIdx % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                        <td style={{ border: '2px solid #9ca3af', padding: '8px' }}>{vIdx + 1}</td>
                        <td style={{ border: '2px solid #9ca3af', padding: '8px' }}>{vehicle.vehicleName}</td>
                        <td style={{ border: '2px solid #9ca3af', padding: '8px', textAlign: 'center' }}>{vehicle.actualQuantity}</td>
                        <td style={{ border: '2px solid #9ca3af', padding: '8px', textAlign: 'right' }}>
                          {vehicle.totalCost?.toLocaleString('en-IN') || 'TBD'}
                        </td>
                        <td style={{ border: '2px solid #9ca3af', padding: '8px' }}>
                          {vehicle.utilizationNotes || eventData.eventName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Summary */}
            <div style={{ 
              marginTop: '32px', 
              borderTop: '2px solid #1f2937',
              paddingTop: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <div>
                  <p style={{ fontWeight: '600', margin: '4px 0' }}>Total Estimated Cost:</p>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#16a34a', margin: '4px 0' }}>
                    ₹{eventData.totalCost?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '600', margin: '4px 0' }}>Status:</p>
                  <p style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    backgroundColor: eventData.utilizationStatus === 'COMPLETED' ? '#dcfce7' :
                      eventData.utilizationStatus === 'APPROVED' ? '#dbeafe' : '#fef9c3',
                    color: eventData.utilizationStatus === 'COMPLETED' ? '#166534' :
                      eventData.utilizationStatus === 'APPROVED' ? '#1e40af' : '#854d0e',
                    margin: '4px 0',
                    display: 'inline-block'
                  }}>
                    {eventData.utilizationStatus?.replace(/_/g, ' ') || 'PENDING'}
                  </p>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div style={{ marginTop: '48px', textAlign: 'right' }}>
              <p style={{ fontWeight: 'bold', margin: '4px 0' }}>{eventData.collectorApprovedByName || "Collector"}</p>
              <p style={{ fontSize: '12px', margin: '4px 0' }}>Collector & District Magistrate</p>
              <p style={{ fontSize: '12px', margin: '4px 0' }}>{eventData.district || "Ganjam"}</p>
            </div>

            {/* Footer Note */}
            <div style={{ 
              marginTop: '32px',
              fontSize: '10px',
              textAlign: 'center',
              color: '#6b7280',
              borderTop: '1px solid #d1d5db',
              paddingTop: '16px'
            }}>
              <p style={{ margin: '4px 0' }}>This is a computer-generated document issued under the Omnibus Requisition Act, 1984</p>
              <p style={{ margin: '4px 0' }}>Government of Odisha - Commerce & Transport Department</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventUtilizationPDFViewer;

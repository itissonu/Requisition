import React, { useRef, useState, useEffect } from "react";
import { Download, X } from "lucide-react";

import logo from '../../../assests/logo.png';
import { eventAPI } from "../../../apis/apiService";

const EventUtilizationPDFViewer = ({ eventId, isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pdfContentRef = useRef(null);

  // Fetch event data by ID
  useEffect(() => {
    if (isOpen && eventId) {
      fetchEventData();
    }
  }, [isOpen, eventId]);

  const fetchEventData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventAPI.details(eventId);
      setEventData(response.data);
    } catch (error) {
      console.error("Error fetching event data:", error);
      setError("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    // Ensure the content is available before attempting to download
    if (!pdfContentRef.current) {
      alert("Cannot generate PDF, content not ready.");
      return;
    }

    setIsDownloading(true);
    try {
      const element = pdfContentRef.current;
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [9, 9, 9, 9],
        filename: `Vehicle_Requisition_Order_${eventId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2, // You can try reducing this to 1.5 or 1 if quality is okay but alignment is still off
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          // --- FIX APPLIED ---
          // Explicitly set the width for the canvas capture to match the element's rendered width.
          // This is the key fix for preventing right-side content from being cut off.
          width: element.offsetWidth,
          x: 0,
          y: 0,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF: " + error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-GB');
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getDistrictName = () => {
    return eventData?.collectorDistrict || "GANJAM";
  };

  const getRequisitionNumber = () => {
    return eventData?.requestEventLetterNo || `${eventId}/RQN`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div style={{ backgroundColor: '#1e3a8a' }} className="text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Vehicle Requisition Order</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading || loading || !eventData}
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
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-600">Loading event data...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-600">{error}</div>
            </div>
          )}

          {eventData && (
            <div
              ref={pdfContentRef}
              style={{
                width: '210mm',
                minHeight: '297mm',
                backgroundColor: '#ffffff',
                // --- FIX APPLIED ---
                // Reduced horizontal padding and added boxSizing to prevent overflow.
                padding: '12mm 10mm',
                boxSizing: 'border-box',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                margin: '0 auto',
                fontFamily: 'Times New Roman, serif',
                position: 'relative',
                fontSize: '10.5pt',
                lineHeight: '1.27',
                color: '#000',
              }}
            >
              {/* Logo Watermark */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                opacity: 0.05
              }}>
                <img
                  src={logo}
                  alt="Watermark"
                  style={{
                    width: '350px',
                    height: '350px',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                {/* Header */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  fontSize: '11pt',
                  lineHeight: '1.2'
                }}>
                  OFFICE OF THE COLLECTOR & DISTRICT MAGISTRATE,<br />
                  {getDistrictName().toUpperCase()} DISTRICT
                </div>

                {/* Document Number and Date */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '10.5pt'
                }}>
                  <div>No. {getRequisitionNumber()}/RQN</div>
                  <div>Date: {formatDate()}</div>
                </div>

                {/* Title */}
                <h2 style={{
                  textAlign: 'center',
                  fontSize: '11pt',
                  fontWeight: 'bold',
                  margin: '10px 0 12px 0',
                  textDecoration: 'underline',
                  textUnderlineOffset: '6px',
                }}>
                  VEHICLE REQUISITION ORDER
                </h2>

                {/* Legal Text */}
                <div style={{ fontSize: '10.5pt', lineHeight: '1.35', marginBottom: '12px', textAlign: 'justify' }}>
                  <p style={{ marginBottom: '8px', textIndent: '50px' }}>
                    In exercise of the powers conferred under the provisions of the <strong>[Section 160 of the Representation of the People Act, 1951 / Section 65 of the Disaster Management Act, 2005 / Rule 3 of the Odisha Requisitioning of Omnibus Rules, 1976 / Rule 3 of the Odisha Requisitioning of Goods Vehicle Rules, 1980, etc.], and in the interest of public service / disaster management / election duty / essential government work / law & order duty,</strong> the undersigned hereby requisitions the following vehicle(s) for official use as per details below.
                  </p>

                  <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                    Disobedience of this order shall entail action under the relevant section of law, including but not limited to Section 188 of the Indian Penal Code, 1860 (disobedience to order duly promulgated by a public servant), and/or the corresponding penal provisions of the respective Act/Rule under which this requisition has been issued.
                  </p>
                </div>

                {/* Vehicle Details Header */}
                <h3 style={{
                  fontSize: '10.5pt',
                  fontWeight: 'bold',
                  margin: '10px 0 8px 0',
                  textAlign: 'center'
                }}>
                  DETAILS OF VEHICLE REQUISITIONED
                </h3>

                {/* Table */}
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '10.5pt',
                  marginBottom: '15px'
                }}>
                  <tbody>
                    <tr>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        fontWeight: 'bold',
                        width: '50%',
                        verticalAlign: 'top'
                      }}>
                        1. Vehicle Registration No.
                      </td>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '24px',
                        verticalAlign: 'top'
                      }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        fontWeight: 'bold',
                        verticalAlign: 'top'
                      }}>
                        2. Type of Vehicle<br />
                        (Bus/Truck/Car/Jeep etc.)
                      </td>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '30px',
                        verticalAlign: 'top'
                      }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        fontWeight: 'bold',
                        verticalAlign: 'top'
                      }}>
                        3. Owner's Name & Address
                      </td>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '30px',
                        verticalAlign: 'top'
                      }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        fontWeight: 'bold',
                        verticalAlign: 'top'
                      }}>
                        4. Owner's Mobile Number
                      </td>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '24px',
                        verticalAlign: 'top'
                      }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        fontWeight: 'bold',
                        verticalAlign: 'top'
                      }}>
                        5. Driver's Name
                      </td>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '24px',
                        verticalAlign: 'top'
                      }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        fontWeight: 'bold',
                        verticalAlign: 'top'
                      }}>
                        6. Driver's Mobile Number
                      </td>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '24px',
                        verticalAlign: 'top'
                      }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        fontWeight: 'bold',
                        verticalAlign: 'top'
                      }}>
                        7. Date & Time of Reporting
                      </td>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '24px',
                        verticalAlign: 'top'
                      }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        fontWeight: 'bold',
                        verticalAlign: 'top'
                      }}>
                        8. Place of Reporting
                      </td>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '24px',
                        verticalAlign: 'top'
                      }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        fontWeight: 'bold',
                        verticalAlign: 'top'
                      }}>
                        9. Officer / Office to Whom the Vehicle<br />
                        Shall Report
                      </td>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '30px',
                        verticalAlign: 'top'
                      }}>
                        &nbsp;
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Signature Section */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '15px',
                  marginTop: '10px'
                }}>
                  <div style={{
                    textAlign: 'center',
                    position: 'relative',
                    width: '180px'
                  }}>
                    {/* Signature */}
                    <div style={{ marginBottom: '5px', height: '35px', position: 'relative' }}>
                      <img
                        src="/signature.png"
                        alt="Signature"
                        style={{
                          width: '110px',
                          height: '50px',
                          objectFit: 'contain',
                          display: 'block',
                          margin: '0 auto'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Stamp */}
                    <div style={{
                      position: 'absolute',
                      top: '-5px',
                      left: '25px',
                      opacity: 0.8,
                      zIndex: 3
                    }}>
                      <img
                        src="/stamp.png"
                        alt="Official Stamp"
                        style={{
                          width: '95px',
                          height: '95px',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Text */}
                    <div style={{
                      fontSize: '10.5pt',
                      fontWeight: 'normal',
                      lineHeight: '1.3'
                    }}>
                      (Signature & Seal)<br />
                      Collector & District Magistrate<br />
                      {getDistrictName()} District
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div style={{
                  fontSize: '10.5pt',
                  lineHeight: '1.4',
                  marginBottom: '12px'
                }}>
                  <h4 style={{ fontSize: '12pt',textUnderlineOffset: '6px', textDecoration: 'underline', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>
                    CONDITIONS OF REQUISITION:
                  </h4>

                  <div style={{ marginBottom: '5px' }}>
                    <strong>1.</strong> The vehicle shall be a deemed to be under Government requisition from the date and time of reporting until formally released by the Requisitioning Authority.
                  </div>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>2.</strong> The vehicle owner/driver shall ensure the vehicle is in good running condition.
                  </div>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>3.</strong> The vehicle shall not be used for any private purpose during the period of requisition.
                  </div>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>4.</strong> The vehicle shall be released after completion of duty, and compensation (if any) shall be paid as per the prescribed rate of the Government.
                  </div>
                </div>

                {/* Acknowledgement */}
                <div style={{
                  fontSize: '10.5pt',
                  lineHeight: '1.4'
                }}>
                  <h4 style={{
                    fontSize: '12pt', textUnderlineOffset: '6px',
                    textDecoration: 'underline', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center'
                  }}>
                    ACKNOWLEDGEMENT OF SERVICE:
                  </h4>
                  <p style={{ marginBottom: '12px' }}>
                    I, Shri/Smt. __________________________ (Driver/Owner), hereby acknowledge that I have received a copy of this requisition order on this day __________ at __________ hrs.
                  </p>
                  <div style={{ textAlign: 'right' }}>
                    Signature of Owner/Driver: _____________________
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventUtilizationPDFViewer;
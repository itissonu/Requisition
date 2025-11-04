import React, { useRef, useState, useEffect } from "react";
import { Download, X } from "lucide-react";

import logo from '../../../assests/logo.png';
import { eventAPI, districtStampAPI } from "../../../apis/apiService";

// utils/imageUtils.js

 const removeWhiteBackground = (base64Image) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Process pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Calculate brightness
        const brightness = (r + g + b) / 3;
        
        // If pixel is light (background), make transparent
        if (brightness > 200) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        } else if (brightness > 150) {
          // Semi-transparent for light gray
          data[i + 3] = Math.floor(a * 0.4);
        } else {
          // Keep dark pixels and darken them slightly
          const darkFactor = 0.9;
          data[i] = Math.floor(r * darkFactor);
          data[i + 1] = Math.floor(g * darkFactor);
          data[i + 2] = Math.floor(b * darkFactor);
          data[i + 3] = 255; // Full opacity
        }
      }
      
      // Put modified image data back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert canvas to base64
      const processedBase64 = canvas.toDataURL('image/png');
      resolve(processedBase64);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = base64Image;
  });
};


const EventUtilizationPDFViewer = ({ eventId, isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [stampData, setStampData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pdfContentRef = useRef(null);
   const [processedSignature, setProcessedSignature] = useState(null);
  const [processedStamp, setProcessedStamp] = useState(null);

  // Fetch event data and stamp/signature separately
  useEffect(() => {
    if (isOpen && eventId) {
      fetchEventData();
      fetchStampAndSignature();
    }
  }, [isOpen, eventId]);

  const fetchEventData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventAPI.details(eventId);
      console.log("Fetched event data:", response.data);
      setEventData(response?.data);
    } catch (error) {
      console.error("Error fetching event data:", error);
      setError("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

 
  const fetchStampAndSignature = async () => {
    try {
      const response = await districtStampAPI.getCurrent();
      console.log("Fetched stamp and signature:", response.data);
      setStampData(response?.data);
      
   
      if (response?.data?.collectorSignature) {
        const signatureBase64 = `data:image/png;base64,${response.data.collectorSignature}`;
      //  const processed = await removeWhiteBackground(signatureBase64);
        setProcessedSignature(signatureBase64);
      }
      
      if (response?.data?.collectorStamp) {
        const stampBase64 = `data:image/png;base64,${response.data.collectorStamp}`;
      //  const processed = await removeWhiteBackground(stampBase64);
        setProcessedStamp(stampBase64);
      }
    } catch (error) {
      console.error("Error fetching stamp and signature:", error);
    }
  };

  const handleDownloadPDF = async () => {
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
        filename: `Vehicle_Requisition_Order_${eventData?.referenceNumber || eventId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
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
    return eventData?.collectorDistrict?.toUpperCase() || "GANJAM";
  };

  const getRequisitionNumber = () => {
    return eventData?.referenceNumber || `${eventId}/RQN`;
  };

  const getRequisitionDate = () => {
    return formatDate(eventData?.referenceDate);
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
                  {getDistrictName()} DISTRICT
                </div>

                {/* Document Number and Date - FROM EVENT */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '10.5pt'
                }}>
                  <div>No. {getRequisitionNumber()}</div>
                  <div>Date: {getRequisitionDate()}</div>
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
                        width: '50%',
                        verticalAlign: 'top'
                      }}>
                        1. Vehicle Registration No.
                      </td>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '35px',
                        verticalAlign: 'top'
                      }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '40px',
                        alignItems: 'center',
                        verticalAlign: 'center'
                      }}>
                        2. Type of Vehicle<br />
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
                        height: '40px',
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
                        height: '40px',
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
                        height: '40px',
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
                        height: '40px',
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
                        height: '40px',
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
                        {/* {formatDate(eventData?.subEvents?.[0]?.reportingDate)} &nbsp; */}
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '40px',
                        verticalAlign: 'middle'
                      }}>
                        8. Place of Reporting
                      </td>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        height: '24px',
                        verticalAlign: 'top'
                      }}>
                        {/* {eventData?.subEvents?.[0]?.place || '&nbsp;'} */}
                      </td>
                    </tr>
                    <tr>
                      <td style={{
                        border: '1px solid #000',
                        padding: '6px 8px',
                        paddingBottom: '8px',
                        height: '40px',
                        verticalAlign: 'middle'
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

                {/* Signature Section - USE STAMP DATA */}
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
                      {stampData?.collectorSignature && (
                        <img
                          src={processedSignature}
                          alt="Signature"
                          style={{
                            width: '150px',
                            height: '70px',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto',
                             //filter: 'contrast(1.5) brightness(1.2) drop-shadow(0px 0px 1px rgba(0,0,0,0.2))',
                            // backgroundColor: 'transparent'
                           // backgroundColor: 'transparent',
                          //filter: 'contrast(1.3) brightness(1.1)'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>

                    {/* Stamp */}
                    <div style={{
                      position: 'absolute',
                      top: '55px',
                      left: '45px',
                      opacity: 0.8,
                      zIndex: 3
                    }}> 
                      {stampData?.collectorStamp && (
                        <img
                          src={processedStamp}
                          alt="Official Stamp"
                          style={{
                            width: '95px',
                            height: '95px',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto',
                          
                         // filter: 'contrast(1.3) brightness(1.1)'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
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
                  <h4 style={{
                    fontSize: '12pt',
                    textUnderlineOffset: '6px',
                    textDecoration: 'underline',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    textAlign: 'center'
                  }}>
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
                    fontSize: '12pt',
                    textUnderlineOffset: '6px',
                    textDecoration: 'underline',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    textAlign: 'center'
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

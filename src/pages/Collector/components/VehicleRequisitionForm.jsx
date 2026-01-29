import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { FileText, Plus, Trash2, Eye, Download, Calendar, MapPin, User, Hash, Car, Clock } from "lucide-react";
import logo from '../../../assests/logo.png';
export default function VehicleRequisitionForm() {
    const [formData, setFormData] = useState({
        orderNo: "",
        orderDate: new Date().toISOString().split('T')[0],
        district: "Khordha",
        effectiveFrom: new Date().toISOString().split('T')[0],
        deliveryLocation: "",
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryTime: "",
        reason: "",
        eventStartDate: "",
        eventEndDate: "",
        referenceLetterNo: "",
        referenceLetterDate: "",
        referenceAuthority: "",
    });

    const [vehicleInputs, setVehicleInputs] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const vehicleTypes = [
        { id: 7, name: "Bus (up to 20 seater)", ratePerKm: 2150 },
        { id: 8, name: "Bus (21 to 31 seater)", ratePerKm: 2700 },
        { id: 9, name: "Bus (32 to 40 seater)", ratePerKm: 3500 },
        { id: 10, name: "Bus (41 & above)", ratePerKm: 4400 },
        { id: 11, name: "10 wheeler Truck (GVW above 18,500 Kg. and less than & equal to 28,000 Kg.)", ratePerKm: 3000 },
        { id: 12, name: "Standard Truck (GVW above 12,000 Kg. and less than & equal to 18,500 Kg.)", ratePerKm: 2600 },
        { id: 13, name: "Mini Truck (GVW up to 12,000 Kg.)", ratePerKm: 1600 },
        { id: 14, name: "Tata Ace/Force/Mahindra Minidor (GVW up to 2,000 Kg.)", ratePerKm: 1000 },
        { id: 15, name: "Non-AC (Tata Indica/Tata Indigo/Dezire) Non-AC vehicles (5 seater or less)", ratePerKm: 1000 },
        { id: 16, name: "Non-AC (Bolero/Marshal/Jeep Non-AC vehicle (more than 5 seater)", ratePerKm: 1200 },
        { id: 17, name: "AC (Bolero/Bolero Neo/Marshal/Jeep)", ratePerKm: 1400 },
        { id: 18, name: "AC (Chevrolet Tavera/Mahindra Scorpio)", ratePerKm: 1650 },
        { id: 19, name: "AC (Toyota Innova/Tata Safari)", ratePerKm: 2100 },
        { id: 20, name: "Auto-Rickshaw", ratePerKm: 800 },
        { id: 21, name: "Tractor with Trailer", ratePerKm: 1150 },
        { id: 22, name: "Motor Cycle", ratePerKm: 400 },
        { id: 23, name: "E-Rickshaw/E-Kart", ratePerKm: 700 },
        { id: 24, name: "Maruti Omni/Ecco Ambulance", ratePerKm: 1600 },
        { id: 25, name: "Bolero Ambulance", ratePerKm: 1750 },
        { id: 26, name: "Winger/Force Traveller etc.", ratePerKm: 2200 }
    ];

    const collectorInfo = {
        phone: "06755-220001",
        email: "dm-khurda@nic.in",
        name: "Collector & District Magistrate",
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addVehicleRow = () => {
        setVehicleInputs([...vehicleInputs, {
            id: Date.now(),
            vehicleTypeId: "",
            registrationNumber: "",
            seatingCapacity: "",
            ownerName: "",
            ownerAddress: "",
            mobileNumber: ""
        }]);
    };

    const updateVehicleRow = (id, field, value) => {
        setVehicleInputs(vehicleInputs.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        ));
    };

    const removeVehicleRow = (id) => {
        setVehicleInputs(vehicleInputs.filter(v => v.id !== id));
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const generatePDF = async () => {
        setLoading(true);
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595.28, 841.89]);
            const { width, height } = page.getSize();

            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            let yPosition = height - 70;
            const leftMargin = 60;
            const rightMargin = width - 60;

            let logoImage = null;
            try {
                const logoImageBytes = await fetch(logo).then(res => res.arrayBuffer());
                logoImage = await pdfDoc.embedPng(logoImageBytes);
            } catch (error) {
                console.error("Logo not found, continuing without logo");
            }

            // Header - Left Side
            page.drawText("OFFICE OF THE", {
                x: leftMargin,
                y: yPosition,
                size: 10,
                font: boldFont,
                color: rgb(0, 0, 0),
            });

            yPosition -= 12;
            page.drawText("COLLECTOR & DISTRICT MAGISTRATE", {
                x: leftMargin,
                y: yPosition,
                size: 10,
                font: boldFont,
                color: rgb(0, 0, 0),
            });

            yPosition -= 12;
            page.drawText(formData.district.toUpperCase(), {
                x: leftMargin,
                y: yPosition,
                size: 10,
                font: boldFont,
                color: rgb(0, 0, 0),
            });

            if (logoImage) {
                const logoSize = 50;
                const centerX = width / 2 - logoSize / 2;
                page.drawImage(logoImage, {
                    x: centerX,
                    y: height - 90,
                    width: logoSize,
                    height: logoSize,
                });
            }

            // Header - Right Side
            let rightYPosition = height - 70;
            page.drawText(`Ph: ${collectorInfo.phone}`, {
                x: rightMargin - 130,
                y: rightYPosition,
                size: 9,
                font: font,
                color: rgb(0, 0, 0),
            });

            rightYPosition -= 12;
            page.drawText(`Email: ${collectorInfo.email}`, {
                x: rightMargin - 130,
                y: rightYPosition,
                size: 9,
                font: font,
                color: rgb(0, 0, 0),
            });

            // Horizontal line
            yPosition -= 15;
            page.drawLine({
                start: { x: leftMargin, y: yPosition },
                end: { x: rightMargin, y: yPosition },
                thickness: 1.5,
                color: rgb(0, 0, 0),
            });

            // Order Number and Date
            yPosition -= 20;
            page.drawText(`No. ${formData.orderNo}`, {
                x: leftMargin,
                y: yPosition,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
            });

            page.drawText(`Date: ${formatDate(formData.orderDate)}`, {
                x: rightMargin - 90,
                y: yPosition,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
            });

            // ORDER Title
            yPosition -= 25;
            page.drawText("ORDER", {
                x: width / 2 - 20,
                y: yPosition,
                size: 12,
                font: boldFont,
                color: rgb(0, 0, 0),
            });

            // Paragraphs with proper left margin
            yPosition -= 25;
            const para1 = `         Wheras, it appears to me that, vehicles are required for ${formData.reason} from ${formatDate(formData.eventStartDate)} to ${formatDate(formData.eventEndDate)} as intimated by ${formData.referenceAuthority} in their letter no. ${formData.referenceLetterNo} dated ${formatDate(formData.referenceLetterDate)}.`;

            let words = para1.split(' ');
            let line = '';
            for (let word of words) {
                const testLine = line + word + ' ';
                const textWidth = font.widthOfTextAtSize(testLine, 10);
                if (textWidth > (rightMargin - leftMargin - 60) && line !== '') {
                    page.drawText(line, { x: leftMargin + 30, y: yPosition, size: 10, font: font, color: rgb(0, 0, 0) });
                    line = word + ' ';
                    yPosition -= 14;
                } else {
                    line = testLine;
                }
            }
            if (line !== '') {
                page.drawText(line, { x: leftMargin + 30, y: yPosition, size: 10, font: font, color: rgb(0, 0, 0) });
                yPosition -= 14;
            }

            yPosition -= 10;
            const para2 = `         Now, therefore in exercise of powers conferred on me under Section 3 of Omnibus Requisition Act, 1984 the Collector & District Magistrate, ${formData.district} do hereby requisition the vehicles specified in Schedule below with effect from ${formatDate(formData.effectiveFrom)}.`;

            words = para2.split(' ');
            line = '';
            for (let word of words) {
                const testLine = line + word + ' ';
                const textWidth = font.widthOfTextAtSize(testLine, 10);
                if (textWidth > (rightMargin - leftMargin - 60) && line !== '') {
                    page.drawText(line, { x: leftMargin + 30, y: yPosition, size: 10, font: font, color: rgb(0, 0, 0) });
                    line = word + ' ';
                    yPosition -= 14;
                } else {
                    line = testLine;
                }
            }
            if (line !== '') {
                page.drawText(line, { x: leftMargin + 30, y: yPosition, size: 10, font: font, color: rgb(0, 0, 0) });
                yPosition -= 14;
            }

            yPosition -= 10;
            const para3 = `         I do further order that the vehicles requisitioned should be delivered at ${formData.deliveryLocation} on ${formatDate(formData.deliveryDate)} at ${formData.deliveryTime}.`;

            words = para3.split(' ');
            line = '';
            for (let word of words) {
                const testLine = line + word + ' ';
                const textWidth = font.widthOfTextAtSize(testLine, 10);
                if (textWidth > (rightMargin - leftMargin - 60) && line !== '') {
                    page.drawText(line, { x: leftMargin + 30, y: yPosition, size: 10, font: font, color: rgb(0, 0, 0) });
                    line = word + ' ';
                    yPosition -= 14;
                } else {
                    line = testLine;
                }
            }
            if (line !== '') {
                page.drawText(line, { x: leftMargin + 30, y: yPosition, size: 10, font: font, color: rgb(0, 0, 0) });
                yPosition -= 14;
            }

            // SCHEDULE
            yPosition -= 25;
            page.drawText("SCHEDULE", {
                x: width / 2 - 35,
                y: yPosition,
                size: 11,
                font: boldFont,
                color: rgb(0, 0, 0),
            });

            // Table
            yPosition -= 20;
            const colWidths = [40, 100, 80, 80, 160];
            const colX = [leftMargin, leftMargin + 40, leftMargin + 140, leftMargin + 220, leftMargin + 300];

            const headers = ["Sl. No", "Registration No", "Type", "Capacity", "Owner/Driver Details"];

            page.drawRectangle({
                x: leftMargin,
                y: yPosition - 5,
                width: rightMargin - leftMargin,
                height: 20,
                color: rgb(0.9, 0.9, 0.9),
            });

            headers.forEach((header, i) => {
                page.drawText(header, {
                    x: colX[i] + 5,
                    y: yPosition + 5,
                    size: 9,
                    font: boldFont,
                    color: rgb(0, 0, 0),
                });
            });

            // Header borders
            page.drawLine({
                start: { x: leftMargin, y: yPosition + 15 },
                end: { x: rightMargin, y: yPosition + 15 },
                thickness: 1,
                color: rgb(0, 0, 0),
            });
            page.drawLine({
                start: { x: leftMargin, y: yPosition - 5 },
                end: { x: rightMargin, y: yPosition - 5 },
                thickness: 1,
                color: rgb(0, 0, 0),
            });

            colX.forEach(x => {
                page.drawLine({
                    start: { x: x, y: yPosition + 15 },
                    end: { x: x, y: yPosition - 5 },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                });
            });
            page.drawLine({
                start: { x: rightMargin, y: yPosition + 15 },
                end: { x: rightMargin, y: yPosition - 5 },
                thickness: 1,
                color: rgb(0, 0, 0),
            });

            yPosition -= 5;

            // Vehicle Rows
            vehicleInputs.forEach((vehicle, index) => {
                const vehicleType = vehicleTypes.find(vt => vt.id === parseInt(vehicle.vehicleTypeId));
                const rowHeight = 35;

                if (index % 2 === 0) {
                    page.drawRectangle({
                        x: leftMargin,
                        y: yPosition - rowHeight,
                        width: rightMargin - leftMargin,
                        height: rowHeight,
                        color: rgb(0.98, 0.98, 0.98),
                    });
                }

                page.drawText(`${index + 1}`, {
                    x: colX[0] + 10,
                    y: yPosition - 18,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0),
                });

                page.drawText(vehicle.registrationNumber, {
                    x: colX[1] + 5,
                    y: yPosition - 18,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0),
                });

                if (vehicleType) {
                    const typeText = vehicleType.name.length > 20
                        ? vehicleType.name.substring(0, 18) + "..."
                        : vehicleType.name;
                    page.drawText(typeText, {
                        x: colX[2] + 5,
                        y: yPosition - 18,
                        size: 7,
                        font: font,
                        color: rgb(0, 0, 0),
                    });
                }

                page.drawText(vehicle.seatingCapacity || "-", {
                    x: colX[3] + 15,
                    y: yPosition - 18,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0),
                });

                page.drawText(vehicle.ownerName, {
                    x: colX[4] + 5,
                    y: yPosition - 12,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0),
                });

                page.drawText(vehicle.mobileNumber, {
                    x: colX[4] + 5,
                    y: yPosition - 24,
                    size: 7,
                    font: font,
                    color: rgb(0.3, 0.3, 0.3),
                });

                // Row borders
                page.drawLine({
                    start: { x: leftMargin, y: yPosition - rowHeight },
                    end: { x: rightMargin, y: yPosition - rowHeight },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                });

                colX.forEach(x => {
                    page.drawLine({
                        start: { x: x, y: yPosition },
                        end: { x: x, y: yPosition - rowHeight },
                        thickness: 1,
                        color: rgb(0, 0, 0),
                    });
                });
                page.drawLine({
                    start: { x: rightMargin, y: yPosition },
                    end: { x: rightMargin, y: yPosition - rowHeight },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                });

                yPosition -= rowHeight;
            });

            // Signature
            yPosition -= 40;
            page.drawText(`${collectorInfo.name}`, {
                x: rightMargin - 150,
                y: yPosition,
                size: 10,
                font: boldFont,
                color: rgb(0, 0, 0),
            });

            yPosition -= 14;
            page.drawText(formData.district, {
                x: rightMargin - 150,
                y: yPosition,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `Vehicle_Requisition_${formData.orderNo}.pdf`;
            link.click();

            alert("PDF generated successfully!");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (previewMode) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-16">
                    {/* Header with logo */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xs font-bold">OFFICE OF THE</h2>
                            <h3 className="text-xs font-bold">COLLECTOR & DISTRICT MAGISTRATE</h3>
                            <h4 className="text-xs font-bold">{formData.district.toUpperCase()}</h4>
                        </div>

                        <div className="mx-6 flex items-center justify-center">
                            <div className="w-16 h-16  rounded-full flex items-center justify-center">
                               
                                    <img
                                        src={logo}
                                        alt="Odisha Logo"
                                        className="w-16 h-16 object-contain"
                                    />
                              
                            </div>
                        </div>

                        <div className="text-right text-xs">
                            <p>Ph: {collectorInfo.phone}</p>
                            <p>Email: {collectorInfo.email}</p>
                        </div>
                    </div>

                    <hr className="border-t-2 border-black mb-6" />

                    {/* Order Details */}
                    <div className="flex justify-between mb-6 text-sm">
                        <p>No. {formData.orderNo}</p>
                        <p>Date: {formatDate(formData.orderDate)}</p>
                    </div>

                    {/* ORDER Title */}
                    <h3 className="text-center font-bold text-base mb-6">ORDER</h3>

                    {/* Content with left margin */}
                    <div className="space-y-4 text-sm leading-relaxed text-justify ml-8">
                        <p>
                            <span className="font-semibold">Whereas</span>, it appears to me that, vehicles are required for <span className="font-semibold">{formData.reason}</span> from <span className="font-semibold">{formatDate(formData.eventStartDate)}</span> to <span className="font-semibold">{formatDate(formData.eventEndDate)}</span> as intimated by {formData.referenceAuthority} in their letter no. {formData.referenceLetterNo} dated {formatDate(formData.referenceLetterDate)}.
                        </p>

                        <p>
                            <span className="font-semibold">Now, therefore</span> in exercise of powers conferred on me under Section 3 of Omnibus Requisition Act, 1984 the Collector & District Magistrate, {formData.district} do hereby requisition the vehicles specified in Schedule below with effect from <span className="font-semibold">{formatDate(formData.effectiveFrom)}</span>.
                        </p>

                        <p>
                            <span className="font-semibold">I do further order</span> that the vehicles requisitioned should be delivered at <span className="font-semibold">{formData.deliveryLocation}</span> on <span className="font-semibold">{formatDate(formData.deliveryDate)}</span> at <span className="font-semibold">{formData.deliveryTime}</span>.
                        </p>
                    </div>

                    {/* SCHEDULE */}
                    <h3 className="text-center font-bold text-base mt-8 mb-4">SCHEDULE</h3>

                    <table className="w-full border-collapse border-2 border-black text-xs">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border-2 border-black p-2">Sl. No</th>
                                <th className="border-2 border-black p-2">Registration No</th>
                                <th className="border-2 border-black p-2">Type of Vehicle</th>
                                <th className="border-2 border-black p-2">Seating Capacity</th>
                                <th className="border-2 border-black p-2">Name & Address of Owner/Driver with Mobile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicleInputs.map((vehicle, index) => {
                                const vehicleType = vehicleTypes.find(vt => vt.id === parseInt(vehicle.vehicleTypeId));
                                return (
                                    <tr key={vehicle.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                                        <td className="border-2 border-black p-2 text-center">{index + 1}</td>
                                        <td className="border-2 border-black p-2">{vehicle.registrationNumber}</td>
                                        <td className="border-2 border-black p-2 text-xs">{vehicleType?.name || "-"}</td>
                                        <td className="border-2 border-black p-2 text-center">{vehicle.seatingCapacity || "-"}</td>
                                        <td className="border-2 border-black p-2">
                                            {vehicle.ownerName}
                                            <br />
                                            <span className="text-xs text-gray-600">{vehicle.ownerAddress}</span>
                                            <br />
                                            <span className="text-xs text-gray-600">{vehicle.mobileNumber}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Signature */}
                    <div className="mt-12 text-right">
                        <p className="font-bold">{collectorInfo.name}</p>
                        <p>{formData.district}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => setPreviewMode(false)}
                            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-all"
                        >
                            Back to Edit
                        </button>
                        <button
                            onClick={generatePDF}
                            disabled={loading}
                            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Download PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Vehicle Requisition Order
                            </h1>
                            <p className="text-gray-600 text-sm">Create official requisition order</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Hash className="w-4 h-4 mr-2 text-blue-600" />
                                Order Number *
                            </label>
                            <input
                                type="text"
                                name="orderNo"
                                value={formData.orderNo}
                                onChange={handleInputChange}
                                placeholder="e.g., 15504 / RTA"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                Order Date *
                            </label>
                            <input
                                type="date"
                                name="orderDate"
                                value={formData.orderDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                District *
                            </label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                placeholder="e.g., Khordha"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                Effective From *
                            </label>
                            <input
                                type="date"
                                name="effectiveFrom"
                                value={formData.effectiveFrom}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                Event Start Date *
                            </label>
                            <input
                                type="date"
                                name="eventStartDate"
                                value={formData.eventStartDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                Event End Date *
                            </label>
                            <input
                                type="date"
                                name="eventEndDate"
                                value={formData.eventEndDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                Delivery Location *
                            </label>
                            <input
                                type="text"
                                name="deliveryLocation"
                                value={formData.deliveryLocation}
                                onChange={handleInputChange}
                                placeholder="e.g., Collector's Office, Khordha"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                Delivery Date *
                            </label>
                            <input
                                type="date"
                                name="deliveryDate"
                                value={formData.deliveryDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        {/* <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                Delivery Time *
                            </label>
                            <input
                                type="time"
                                name="deliveryTime"
                                value={formData.deliveryTime}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div> */}

                        <div className="md:col-span-2">
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                Reason for Requisition *
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder="e.g., security personnel during visit of Dr. Pravinbhai Togadia"
                                rows="3"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <User className="w-4 h-4 mr-2 text-blue-600" />
                                Reference Authority *
                            </label>
                            <input
                                type="text"
                                name="referenceAuthority"
                                value={formData.referenceAuthority}
                                onChange={handleInputChange}
                                placeholder="e.g., Dy. Commissioner of Police"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Hash className="w-4 h-4 mr-2 text-blue-600" />
                                Reference Letter No *
                            </label>
                            <input
                                type="text"
                                name="referenceLetterNo"
                                value={formData.referenceLetterNo}
                                onChange={handleInputChange}
                                placeholder="e.g., 18543"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                Reference Letter Date *
                            </label>
                            <input
                                type="date"
                                name="referenceLetterDate"
                                value={formData.referenceLetterDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Vehicle Input Table */}
                    <div className="border-t-2 border-gray-200 pt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <Car className="w-5 h-5 mr-2 text-blue-600" />
                                Vehicle Details
                            </h3>
                            <button
                                onClick={addVehicleRow}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Add Vehicle
                            </button>
                        </div>

                        {vehicleInputs.length === 0 ? (
                            <div className="bg-gray-50 rounded-xl p-8 text-center">
                                <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600">No vehicles added yet. Click "Add Vehicle" to start.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border-2 border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border-2 border-gray-300 p-3 text-left text-sm font-semibold">Sl. No</th>
                                            <th className="border-2 border-gray-300 p-3 text-left text-sm font-semibold">Vehicle Type</th>
                                            <th className="border-2 border-gray-300 p-3 text-left text-sm font-semibold">Registration No</th>
                                            <th className="border-2 border-gray-300 p-3 text-left text-sm font-semibold">Capacity</th>
                                            <th className="border-2 border-gray-300 p-3 text-left text-sm font-semibold">Owner Name</th>
                                            <th className="border-2 border-gray-300 p-3 text-left text-sm font-semibold">Owner Address</th>
                                            <th className="border-2 border-gray-300 p-3 text-left text-sm font-semibold">Mobile</th>
                                            <th className="border-2 border-gray-300 p-3 text-center text-sm font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vehicleInputs.map((vehicle, index) => (
                                            <tr key={vehicle.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                <td className="border-2 border-gray-300 p-3 text-center font-medium">{index + 1}</td>
                                                <td className="border-2 border-gray-300 p-2">
                                                    <select
                                                        value={vehicle.vehicleTypeId}
                                                        onChange={(e) => updateVehicleRow(vehicle.id, 'vehicleTypeId', e.target.value)}
                                                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                                    >
                                                        <option value="">Select Type</option>
                                                        {vehicleTypes.map((vt) => (
                                                            <option key={vt.id} value={vt.id}>
                                                                {vt.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="border-2 border-gray-300 p-2">
                                                    <input
                                                        type="text"
                                                        value={vehicle.registrationNumber}
                                                        onChange={(e) => updateVehicleRow(vehicle.id, 'registrationNumber', e.target.value)}
                                                        placeholder="OD-02-AB-1234"
                                                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                                    />
                                                </td>
                                                <td className="border-2 border-gray-300 p-2">
                                                    <input
                                                        type="text"
                                                        value={vehicle.seatingCapacity}
                                                        onChange={(e) => updateVehicleRow(vehicle.id, 'seatingCapacity', e.target.value)}
                                                        placeholder="7"
                                                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                                    />
                                                </td>
                                                <td className="border-2 border-gray-300 p-2">
                                                    <input
                                                        type="text"
                                                        value={vehicle.ownerName}
                                                        onChange={(e) => updateVehicleRow(vehicle.id, 'ownerName', e.target.value)}
                                                        placeholder="Owner Name"
                                                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                                    />
                                                </td>
                                                <td className="border-2 border-gray-300 p-2">
                                                    <input
                                                        type="text"
                                                        value={vehicle.ownerAddress}
                                                        onChange={(e) => updateVehicleRow(vehicle.id, 'ownerAddress', e.target.value)}
                                                        placeholder="Address"
                                                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                                    />
                                                </td>
                                                <td className="border-2 border-gray-300 p-2">
                                                    <input
                                                        type="tel"
                                                        value={vehicle.mobileNumber}
                                                        onChange={(e) => updateVehicleRow(vehicle.id, 'mobileNumber', e.target.value)}
                                                        placeholder="9876543210"
                                                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                                    />
                                                </td>
                                                <td className="border-2 border-gray-300 p-2 text-center">
                                                    <button
                                                        onClick={() => removeVehicleRow(vehicle.id)}
                                                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Preview Button */}
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => {
                                if (!formData.orderNo || !formData.district || !formData.reason || vehicleInputs.length === 0) {
                                    alert("Please fill all required fields and add at least one vehicle");
                                    return;
                                }

                                const hasEmptyFields = vehicleInputs.some(v =>
                                    !v.vehicleTypeId || !v.registrationNumber || !v.ownerName || !v.ownerAddress || !v.mobileNumber
                                );

                                // if (hasEmptyFields) {
                                //   alert("Please fill all vehicle details");
                                //   return;
                                // }

                                setPreviewMode(true);
                            }}
                            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            <Eye className="w-5 h-5" />
                            Preview Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell, Legend, Sector
} from "recharts";
import { eventAPI, utilizationAPI, billSanctionAPI } from "../../../apis/apiService";

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <Sector
            cx={cx} cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 10}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />
    );
};

export default function RTOMainDashboard() {
    const [events, setEvents] = useState([]);
    const [utilizations, setUtilizations] = useState([]);
    const [bills, setBills] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [evRes, utilRes, billRes] = await Promise.all([
                    eventAPI.list(),
                    utilizationAPI.getByStatus("COMMISSIONER_APPROVED"),
                    billSanctionAPI.list()
                ]);
                setEvents(evRes.data);
                setUtilizations(utilRes.data);
                setBills(billRes.data);
            } catch (err) {
                console.error(err);
                alert("Failed to load dashboard data");
            }
        }
        fetchData();
    }, []);

    // Stats

    console.log(events, "events");
    const totalEvents = events.length;
    const pendingEvents = events.filter(e => e.status === "CREATED").length;
    const utilizationSubmited = events.filter(e => e.status === "UTILIZATION_SUBMITTED").length;
    const approvedEvents = events.filter(e => e.status === "COLLECTOR_APPROVED").length;
    const totalUtilizations = utilizations.length;
    const totalBills = bills.length;

    // Bar chart: count events per month
    const eventsData = events.reduce((acc, e) => {
        const m = new Date(e.createdAt).toLocaleString("en-US", { month: "short" });
        const idx = acc.findIndex(d => d.month === m);
        if (idx > -1) acc[idx].events += 1;
        else acc.push({ month: m, events: 1 });
        return acc;
    }, []).sort((a, b) => new Date(`${a.month} 1`) - new Date(`${b.month} 1`));

    // Pie: distribution of event statuses
    const statusData = [
        { name: "Pending", value: pendingEvents },
        { name: "Commissioner Approved", value: approvedEvents },
        // { name: "Other", value: totalEvents - pendingEvents - approvedEvents },
        { name: "Utilization Submitted", value: utilizationSubmited }
    ];
    const COLORS = ["#fbbf24", "#16a34a", "#1e40af", "#6b21a8"];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">RTO Dashboard</h1>
                <p className="text-gray-600">Overview & Statistics</p>
            </div>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 shadow rounded">
                    <h4 className="text-sm text-gray-500">Total Events</h4>
                    <p className="text-2xl font-bold">{totalEvents}</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <h4 className="text-sm text-gray-500">Approved Events</h4>
                    <p className="text-2xl font-bold text-orange-600">7</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <h4 className="text-sm text-gray-500">Pending Events</h4>
                    <p className="text-2xl font-bold text-yellow-600">{pendingEvents}</p>
                </div>
                {/* <div className="bg-white p-4 shadow rounded">
          <h4 className="text-sm text-gray-500">Approved Events</h4>
          <p className="text-2xl font-bold text-green-600">{approvedEvents}</p>
        </div> */}
                <div className="bg-white p-4 shadow rounded">
                    <h4 className="text-sm text-gray-500">Utilizations Created</h4>
                    <p className="text-2xl font-bold text-blue-600">{totalUtilizations}</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <h4 className="text-sm text-gray-500">Payment Bills</h4>
                    <p className="text-2xl font-bold text-indigo-600">{totalBills}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 shadow rounded">
                    <h3 className="font-semibold mb-4">Events Per Month</h3>
                    <BarChart width={400} height={250} data={eventsData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="events" fill="#1e40af" />
                    </BarChart>
                </div>

                <div className="bg-white p-4 shadow rounded">
                    <h3 className="font-semibold mb-4">Event Status</h3>
                    <PieChart width={400} height={250}>
                        <Pie
                            data={statusData}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            onMouseEnter={(_, i) => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {statusData.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                    </PieChart>
                </div>
            </div>
        </div>
    );
}

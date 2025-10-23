import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell, Legend, Sector
} from "recharts";
import { eventAPI, utilizationAPI, billSanctionAPI } from "../../../apis/apiService";
import { CalendarDays, FileText, Hourglass } from "lucide-react";

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <Sector
            cx={cx} cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius }
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

    
    const totalEvents = events.length;
    const pendingEvents = events.filter(e => e.status === "CREATED").length;
    const utilizationSubmited = events.filter(e => e.status === "UTILIZATION_SUBMITTED").length;
    const approvedEvents = events.filter(e => e.status === "COLLECTOR_APPROVED").length;
    const commisionerApproved = events.filter(e => e.status === "COOMMISIONER_APPROVED").length;
    const completedEvents = events.filter(e => e.status === "COMPLETED").length;
    const totalUtilizations = utilizationSubmited;
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
        { name: "Collector Approved", value: approvedEvents },
        { name: "Commissioner Approved", value: commisionerApproved },
        { name: "Utilization Submitted", value: utilizationSubmited },
        { name: "Event Completed", value: completedEvents }
    ];
    const COLORS = ["#fbbf24", "#16a34a", "#1e40af", "#6b21a8", "#F54927"];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">RTO Dashboard</h1>
                <p className="text-gray-600">Overview & Statistics</p>
            </div>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 shadow rounded">
                    <div className="flex justify-between p-2 ">
                        <h4 className="text-sm font-bold text-gray-500">Total Events</h4>
                        <CalendarDays />
                    </div>

                    <p className="text-2xl p-2 font-bold">{totalEvents}</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <div className="flex justify-between p-2 ">
                        <h4 className="text-sm text-gray-500 font-bold">Pending Events</h4>
                        <Hourglass />
                    </div>

                    <p className="text-2xl font-bold p-2 text-yellow-600">{pendingEvents}</p>
                </div>
                {/* <div className="bg-white p-4 shadow rounded">
          <h4 className="text-sm text-gray-500">Approved Events</h4>
          <p className="text-2xl font-bold text-green-600">{approvedEvents}</p>
        </div> */}
                {/* <div className="bg-white p-4 shadow rounded">
                    <h4 className="text-sm text-gray-500">Utilizations Created</h4>
                    <p className="text-2xl font-bold text-blue-600">{totalUtilizations}</p>
                </div> */}
                <div className="bg-white p-4 shadow rounded">
                    <div className="flex justify-between p-2 ">
                        <h4 className="text-sm text-gray-500 font-bold">Payment Bills</h4>
                        <FileText />
                    </div>

                    <p className="text-2xl p-2 font-bold text-indigo-600">{totalBills}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 shadow rounded">
                    <h3 className="font-semibold mb-4">Events Per Month</h3>
                   <BarChart
                        width={400}
                        height={250}
                        data={eventsData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                        <XAxis dataKey="month" tick={{ fill: "#374151" }} />
                        <YAxis tick={{ fill: "#374151" }} />
                        <Tooltip cursor={{ fill: "rgba(37,99,235,0.1)" }} />
                        <Bar
                            dataKey="events"
                            fill="#2563EB"
                            barSize={65}
                            animationDuration={700}
                            style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.25))" }}
                        />
                    </BarChart>
                </div>

                <div className="bg-white p-4 shadow rounded">
                    <h3 className="font-semibold mb-4">Event Status</h3>
                    <PieChart width={400} height={250}>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={85}
                            // paddingAngle={0}
                            dataKey="value"
                            animationDuration={1000}
                            isAnimationActive={true}
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            onMouseEnter={(_, i) => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(null)}
                            style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.25))" }}
                        >
                            {statusData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="#fff"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                boxShadow: "0px 2px 6px rgba(0,0,0,0.15)"
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value) => (
                                <span style={{ color: "#374151", fontSize: "14px" }}>{value}</span>
                            )}
                        />
                    </PieChart>
                </div>
            </div>
        </div>
    );
}

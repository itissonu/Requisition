import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, Sector } from "recharts";
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10} // +10 px for pop-out
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  };
export default function RTOMainDashboard() {
  const [activeIndex, setActiveIndex] = useState(null);
    // Dummy data (replace with API later)
    const eventsData = [
        { month: "Jan", events: 12 },
        { month: "Feb", events: 18 },
        { month: "Mar", events: 9 },
        { month: "Apr", events: 15 },
        { month: "May", events: 20 }
    ];

    const statusData = [
        { name: "Pending", value: 8 },
        { name: "Approved", value: 12 },
        { name: "Disposed", value: 5 }
    ];

    const COLORS = ["#fbbf24", "#16a34a", "#dc2626"];

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="bg-white p-4 shadow rounded">
                    <h4 className="text-sm text-gray-500">Total Events</h4>
                    <p className="text-2xl font-bold">54</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <h4 className="text-sm text-gray-500">Pending Events</h4>
                    <p className="text-2xl font-bold text-yellow-600">8</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <h4 className="text-sm text-gray-500">Completed</h4>
                    <p className="text-2xl font-bold text-green-600">30</p>
                </div>
                <div className="bg-white p-4 shadow rounded">
                    <h4 className="text-sm text-gray-500">Payment Bills</h4>
                    <p className="text-2xl font-bold text-blue-600">22</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white p-4 shadow rounded">
                    <h3 className="font-semibold mb-4">Events Per Month</h3>
                    <BarChart width={400} height={250} data={eventsData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="events" fill="#1e40af" />
                    </BarChart>
                </div>

                {/* Pie Chart */}
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
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
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

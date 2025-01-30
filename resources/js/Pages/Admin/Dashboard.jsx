import React, { useState, useEffect } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, BarElement, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, BarElement, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


export default function Dashboard({ status, canResetPassword }) {
    
    const [salesData, setSalesData] = useState({
        labels: [],
        datasets: [
          {
            label: "Sales",
            data: [],
            borderColor: "rgba(75,192,192,1)",
            fill: false,
          },
        ],
      });
    
      const [orderData, setOrderData] = useState({
        labels: [],
        datasets: [
          {
            label: "Orders",
            data: [],
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      });
    
      const [statistics, setStatistics] = useState({
        totalSales: 0,
        totalOrders: 0,
        newCustomers: 0,
        returningCustomers: 0,
      });

    // Simulated data fetching
  useEffect(() => {
    // Here you would fetch your data from an API
    const fetchData = () => {
      const sales = [1200, 1500, 1600, 1400, 2000, 2500, 2800]; // example sales data
      const orders = [50, 70, 65, 60, 80, 95, 100]; // example order data
      const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

      setSalesData({
        labels: labels,
        datasets: [
          {
            label: "Sales ($)",
            data: sales,
            borderColor: "rgba(75,192,192,1)",
            fill: false,
          },
        ],
      });

      setOrderData({
        labels: labels,
        datasets: [
          {
            label: "Orders",
            data: orders,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      });

      setStatistics({
        totalSales: sales.reduce((acc, curr) => acc + curr, 0),
        totalOrders: orders.reduce((acc, curr) => acc + curr, 0),
        newCustomers: 120, // example number of new customers
        returningCustomers: 80, // example number of returning customers
      });
    };

    fetchData();
  }, []);


    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="container-fluid">
                <h1 className="text-center my-4">Admin Dashboard</h1>

                <div className="row mb-4">
                    <div className="col-lg-3 col-md-6 col-sm-12">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h3 className="card-title">Total Sales</h3>
                                <p className="card-text">${statistics.totalSales}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h3 className="card-title">Total Orders</h3>
                                <p className="card-text">{statistics.totalOrders}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h3 className="card-title">New Customers</h3>
                                <p className="card-text">{statistics.newCustomers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h3 className="card-title">Returning Customers</h3>
                                <p className="card-text">{statistics.returningCustomers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-6 col-md-12 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h3 className="card-title">Sales Over Time</h3>
                                <Bar data={salesData} options={{ responsive: true }} />
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-12 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h3 className="card-title">Orders Over Time</h3>
                                <Line data={orderData} options={{ responsive: true }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </AppLayout>
    );
}
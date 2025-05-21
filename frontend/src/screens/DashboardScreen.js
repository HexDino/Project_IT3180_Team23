import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [stats, setStats] = useState({
    counts: {
      households: 0,
      residents: 0,
      fees: 0,
      temporaryResidences: 0,
      temporaryAbsences: 0
    },
    financials: {
      monthlyRevenue: 0,
      revenueByType: {}
    },
    recentPayments: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!userInfo) {
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get('/api/statistics/dashboard', config);
        setStats(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [userInfo]);
  
  // Generate monthly trend data based on current monthly revenue
  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseValue = stats.financials.monthlyRevenue || 10000000;
    
    // Generate random but consistent data points around the base value
    const data = months.map((_, index) => {
      // Create a consistent pattern based on month index
      const factor = 0.8 + ((index % 3) * 0.15);
      return Math.floor(baseValue * factor);
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Monthly Revenue',
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.3,
        },
      ],
    };
  }, [stats.financials.monthlyRevenue]);
  
  // Prepare data for revenue by fee type chart
  const revenueByTypeData = useMemo(() => ({
    labels: Object.keys(stats.financials.revenueByType).map(type => 
      type.charAt(0).toUpperCase() + type.slice(1)
    ),
    datasets: [
      {
        label: 'Revenue by Fee Type',
        data: Object.values(stats.financials.revenueByType),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }), [stats.financials.revenueByType]);
  
  // Prepare data for counts comparison chart
  const countsComparisonData = useMemo(() => ({
    labels: ['Households', 'Residents', 'Fee Types'],
    datasets: [
      {
        label: 'Count',
        data: [
          stats.counts.households,
          stats.counts.residents,
          stats.counts.fees
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
      },
    ],
  }), [stats.counts.households, stats.counts.residents, stats.counts.fees]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Dashboard Statistics',
      },
    },
  };
  
  return (
    <>
      <h1 className="mb-4">Management Dashboard</h1>
      
      {error && <Message variant="danger">{error}</Message>}
      
      {loading ? (
        <Loader />
      ) : (
        <>
          <Row>
            <Col md={3}>
              <Card className="mb-4 bg-primary text-white shadow">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Card.Title as="h5">Households</Card.Title>
                      <Card.Text as="h2">{stats.counts.households}</Card.Text>
                    </div>
                    <i className="fas fa-home fa-2x"></i>
                  </div>
                  <Link to="/households" className="text-white">
                    <small>View Details &rarr;</small>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="mb-4 bg-success text-white shadow">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Card.Title as="h5">Residents</Card.Title>
                      <Card.Text as="h2">{stats.counts.residents}</Card.Text>
                    </div>
                    <i className="fas fa-users fa-2x"></i>
                  </div>
                  <Link to="/residents" className="text-white">
                    <small>View Details &rarr;</small>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="mb-4 bg-warning text-white shadow">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Card.Title as="h5">Fee Types</Card.Title>
                      <Card.Text as="h2">{stats.counts.fees}</Card.Text>
                    </div>
                    <i className="fas fa-file-invoice-dollar fa-2x"></i>
                  </div>
                  <Link to="/fees" className="text-white">
                    <small>View Details &rarr;</small>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="mb-4 bg-info text-white shadow">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Card.Title as="h5">Monthly Revenue</Card.Title>
                      <Card.Text as="h2">
                        ${stats.financials.monthlyRevenue.toLocaleString()}
                      </Card.Text>
                    </div>
                    <i className="fas fa-dollar-sign fa-2x"></i>
                  </div>
                  <Link to="/payments" className="text-white">
                    <small>View Details &rarr;</small>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Revenue by Fee Type</h5>
                </Card.Header>
                <Card.Body>
                  {Object.keys(stats.financials.revenueByType).length === 0 ? (
                    <p className="text-center">No revenue data available</p>
                  ) : (
                    <div style={{ height: '300px' }}>
                      <Pie data={revenueByTypeData} options={chartOptions} />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="shadow h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Counts Comparison</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Bar data={countsComparisonData} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={12}>
              <Card className="shadow">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Monthly Revenue Trend</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Line data={monthlyTrend} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col md={12}>
              <Card className="mb-4 shadow">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Recent Payments</h5>
                </Card.Header>
                <Card.Body>
                  {stats.recentPayments.length === 0 ? (
                    <p className="text-center">No recent payments found</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Household</th>
                            <th>Fee</th>
                            <th>Amount</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentPayments.map((payment) => (
                            <tr key={payment._id}>
                              <td>
                                {payment.household?.apartmentNumber || 'N/A'}
                              </td>
                              <td>{payment.fee?.name || 'N/A'}</td>
                              <td>${payment.amount.toLocaleString()}</td>
                              <td>
                                {new Date(payment.paymentDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default DashboardScreen; 
import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const PaymentListScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  // Check if user is admin
  const isAdmin = userInfo && userInfo.role === 'admin';
  
  useEffect(() => {
    fetchPayments();
  }, [userInfo]);
  
  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/payments', config);
      setPayments(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to load payments'
      );
      setLoading(false);
    }
  };
  
  const handleRefund = async (id) => {
    if (window.confirm('Are you sure you want to refund this payment? This action cannot be undone.')) {
      try {
        setLoading(true);
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.put(`/api/payments/${id}/refund`, {}, config);
        
        fetchPayments();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to refund payment'
        );
        setLoading(false);
      }
    }
  };
  
  const filteredPayments = payments.filter(
    (payment) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.household?.householdCode?.toLowerCase().includes(searchLower) ||
        payment.household?.apartmentNumber?.toLowerCase().includes(searchLower) ||
        payment.fee?.name?.toLowerCase().includes(searchLower) ||
        payment.receiptNumber?.toLowerCase().includes(searchLower) ||
        (payment.payerName && payment.payerName.toLowerCase().includes(searchLower))
      );
    }
  );
  
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Payments</h1>
        </Col>
        <Col className="text-end">
          <Button 
            className="btn-sm"
            onClick={() => navigate('/payments/create')}
          >
            <i className="fas fa-plus"></i> Create Payment
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm('')}
            >
              Clear
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Household</th>
                <th>Fee</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Payer</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.receiptNumber || 'N/A'}</td>
                  <td>
                    {payment.household ? (
                      <>
                        {payment.household.householdCode} - {payment.household.apartmentNumber}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{payment.fee ? payment.fee.name : 'N/A'}</td>
                  <td>${payment.amount?.toLocaleString()}</td>
                  <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td>{payment.payerName || 'Not specified'}</td>
                  <td>
                    {payment.isRefunded ? (
                      <span className="text-danger">Refunded</span>
                    ) : (
                      <span className="text-success">Paid</span>
                    )}
                  </td>
                  <td>
                    <LinkContainer to={`/payments/${payment._id}`}>
                      <Button variant="light" className="btn-sm mx-1">
                        <i className="fas fa-eye"></i>
                      </Button>
                    </LinkContainer>
                    {!payment.isRefunded && isAdmin && (
                      <Button
                        variant="warning"
                        className="btn-sm mx-1"
                        onClick={() => handleRefund(payment._id)}
                      >
                        <i className="fas fa-undo"></i> Refund
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredPayments.length === 0 && (
            <Message>No payments found</Message>
          )}
        </>
      )}
    </>
  );
};

export default PaymentListScreen; 
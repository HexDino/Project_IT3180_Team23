import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const PaymentCreateScreen = () => {
  const [households, setHouseholds] = useState([]);
  const [fees, setFees] = useState([]);
  
  // Form fields
  const [householdId, setHouseholdId] = useState('');
  const [feeId, setFeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [payerName, setPayerName] = useState('');
  const [payerId, setPayerId] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [note, setNote] = useState('');
  
  // States
  const [selectedFee, setSelectedFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    fetchHouseholds();
    fetchFees();
  }, []);
  
  useEffect(() => {
    if (feeId) {
      const fee = fees.find(f => f._id === feeId);
      if (fee) {
        setSelectedFee(fee);
        setAmount(fee.amount);
      }
    }
  }, [feeId, fees]);
  
  const fetchHouseholds = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/households', config);
      setHouseholds(data);
    } catch (error) {
      console.error('Error fetching households:', error);
    }
  };
  
  const fetchFees = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/fees', config);
      setFees(data.filter(fee => fee.active));
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!householdId) errors.householdId = 'Household is required';
    if (!feeId) errors.feeId = 'Fee is required';
    if (!amount || amount <= 0) errors.amount = 'Amount must be greater than 0';
    if (!paymentDate) errors.paymentDate = 'Payment date is required';
    
    setValidationErrors(errors);
    
    return Object.keys(errors).length === 0;
  };
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const paymentData = {
        household: householdId,
        fee: feeId,
        amount: parseFloat(amount),
        paymentDate,
        payerName,
        payerId,
        payerPhone,
        receiptNumber,
        note
      };
      
      await axios.post('/api/payments', paymentData, config);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/payments');
      }, 1500);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to create payment'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Generate unique receipt number
  useEffect(() => {
    const generateReceiptNumber = () => {
      const date = new Date();
      const year = date.getFullYear().toString().substr(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      return `PM${year}${month}${day}${random}`;
    };
    
    setReceiptNumber(generateReceiptNumber());
  }, []);
  
  return (
    <>
      <Link to='/payments' className='btn btn-light my-3'>
        <i className="fas fa-arrow-left"></i> Back to Payments
      </Link>
      
      <FormContainer>
        <h1>Create Payment</h1>
        
        {error && <Message variant='danger'>{error}</Message>}
        {success && <Message variant='success'>Payment created successfully</Message>}
        {loading && <Loader />}
        
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='household' className='mb-3'>
            <Form.Label>Household</Form.Label>
            <Form.Select
              value={householdId}
              onChange={(e) => setHouseholdId(e.target.value)}
              isInvalid={!!validationErrors.householdId}
              required
            >
              <option value="">Select Household</option>
              {households.map((household) => (
                <option key={household._id} value={household._id}>
                  {household.householdCode} - {household.apartmentNumber}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type='invalid'>
              {validationErrors.householdId}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='fee' className='mb-3'>
            <Form.Label>Fee</Form.Label>
            <Form.Select
              value={feeId}
              onChange={(e) => setFeeId(e.target.value)}
              isInvalid={!!validationErrors.feeId}
              required
            >
              <option value="">Select Fee</option>
              {fees.map((fee) => (
                <option key={fee._id} value={fee._id}>
                  {fee.name} (${fee.amount})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type='invalid'>
              {validationErrors.feeId}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='amount' className='mb-3'>
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type='number'
              placeholder='Enter amount'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              isInvalid={!!validationErrors.amount}
              required
              min="0"
              step="0.01"
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.amount}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='paymentDate' className='mb-3'>
            <Form.Label>Payment Date</Form.Label>
            <Form.Control
              type='date'
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              isInvalid={!!validationErrors.paymentDate}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.paymentDate}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group controlId='payerName' className='mb-3'>
                <Form.Label>Payer Name</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter payer name'
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId='payerPhone' className='mb-3'>
                <Form.Label>Payer Phone</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter payer phone'
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group controlId='payerId' className='mb-3'>
            <Form.Label>Payer ID</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter payer ID'
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group controlId='receiptNumber' className='mb-3'>
            <Form.Label>Receipt Number</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter receipt number'
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
            />
            <Form.Text className="text-muted">
              Auto-generated, but can be changed
            </Form.Text>
          </Form.Group>
          
          <Form.Group controlId='note' className='mb-3'>
            <Form.Label>Note</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              placeholder='Enter note (optional)'
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Form.Group>
          
          <Button type='submit' variant='primary' className='mt-3'>
            Create Payment
          </Button>
        </Form>
      </FormContainer>
    </>
  );
};

export default PaymentCreateScreen; 
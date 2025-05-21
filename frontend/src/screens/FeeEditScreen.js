import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const FeeEditScreen = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [feeCode, setFeeCode] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [feeType, setFeeType] = useState('mandatory');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [active, setActive] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    if (isEditMode) {
      fetchFeeDetails();
    }
  }, [id]);
  
  const fetchFeeDetails = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get(`/api/fees/${id}`, config);
      
      setFeeCode(data.feeCode);
      setName(data.name);
      setAmount(data.amount || '');
      setFeeType(data.feeType || 'mandatory');
      setDescription(data.description || '');
      
      if (data.startDate) {
        const startDateObj = new Date(data.startDate);
        setStartDate(startDateObj.toISOString().split('T')[0]);
      }
      
      if (data.endDate) {
        const endDateObj = new Date(data.endDate);
        setEndDate(endDateObj.toISOString().split('T')[0]);
      }
      
      setActive(data.active);
      
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to load fee details'
      );
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!feeCode) errors.feeCode = 'Fee code is required';
    if (!name) errors.name = 'Fee name is required';
    if (!amount || amount <= 0) errors.amount = 'Amount must be greater than 0';
    
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
      
      const feeData = {
        feeCode,
        name,
        amount: parseFloat(amount),
        feeType,
        description,
        startDate: startDate || null,
        endDate: endDate || null,
        active
      };
      
      if (isEditMode) {
        await axios.put(`/api/fees/${id}`, feeData, config);
      } else {
        await axios.post('/api/fees', feeData, config);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/fees');
      }, 1500);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : `Failed to ${isEditMode ? 'update' : 'create'} fee`
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Link to='/fees' className='btn btn-light my-3'>
        <i className="fas fa-arrow-left"></i> Back to Fees
      </Link>
      
      <FormContainer>
        <h1>{isEditMode ? 'Edit Fee' : 'Create Fee'}</h1>
        
        {error && <Message variant='danger'>{error}</Message>}
        {success && <Message variant='success'>{isEditMode ? 'Fee updated' : 'Fee created'}</Message>}
        {loading && <Loader />}
        
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='feeCode' className='mb-3'>
            <Form.Label>Fee Code</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter fee code'
              value={feeCode}
              onChange={(e) => setFeeCode(e.target.value)}
              isInvalid={!!validationErrors.feeCode}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.feeCode}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='name' className='mb-3'>
            <Form.Label>Fee Name</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter fee name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              isInvalid={!!validationErrors.name}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.name}
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
          
          <Form.Group controlId='feeType' className='mb-3'>
            <Form.Label>Fee Type</Form.Label>
            <Form.Select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
            >
              <option value='mandatory'>Mandatory</option>
              <option value='voluntary'>Voluntary</option>
              <option value='contribution'>Contribution</option>
              <option value='parking'>Parking</option>
              <option value='utilities'>Utilities</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group controlId='description' className='mb-3'>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              placeholder='Enter description (optional)'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group controlId='startDate' className='mb-3'>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId='endDate' className='mb-3'>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          
          {isEditMode && (
            <Form.Group controlId='active' className='mb-3'>
              <Form.Check
                type='checkbox'
                label='Active'
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
            </Form.Group>
          )}
          
          <Button type='submit' variant='primary' className='mt-3'>
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </Form>
      </FormContainer>
    </>
  );
};

export default FeeEditScreen; 
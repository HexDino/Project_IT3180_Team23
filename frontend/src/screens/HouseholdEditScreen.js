import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const HouseholdEditScreen = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [householdCode, setHouseholdCode] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [active, setActive] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    if (isEditMode) {
      fetchHouseholdDetails();
    }
  }, [id]);
  
  const fetchHouseholdDetails = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get(`/api/households/${id}`, config);
      
      setHouseholdCode(data.householdCode);
      setApartmentNumber(data.apartmentNumber);
      setAddress(data.address);
      setNote(data.note || '');
      setActive(data.active);
      
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to load household details'
      );
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!householdCode.trim()) {
      errors.householdCode = 'Household code is required';
    } else if (householdCode.length < 3) {
      errors.householdCode = 'Household code must be at least 3 characters';
    }
    
    if (!apartmentNumber.trim()) {
      errors.apartmentNumber = 'Apartment number is required';
    }
    
    if (!address.trim()) {
      errors.address = 'Address is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const householdData = {
        householdCode,
        apartmentNumber,
        address,
        note,
        active
      };
      
      if (isEditMode) {
        await axios.put(`/api/households/${id}`, householdData, config);
      } else {
        await axios.post('/api/households', householdData, config);
      }
      
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/households');
      }, 2000);
      
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : `Failed to ${isEditMode ? 'update' : 'create'} household`
      );
      setLoading(false);
    }
  };
  
  return (
    <>
      <Link to='/households' className='btn btn-light my-3'>
        <i className="fas fa-arrow-left"></i> Go Back
      </Link>
      
      <FormContainer>
        <h1>{isEditMode ? 'Edit Household' : 'Create Household'}</h1>
        
        {error && <Message variant='danger'>{error}</Message>}
        {success && (
          <Message variant='success'>
            Household successfully {isEditMode ? 'updated' : 'created'}!
          </Message>
        )}
        {loading && <Loader />}
        
        <Form onSubmit={submitHandler} noValidate>
          <Form.Group controlId='householdCode' className='mb-3'>
            <Form.Label>Household Code</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter household code'
              value={householdCode}
              onChange={(e) => setHouseholdCode(e.target.value)}
              isInvalid={!!validationErrors.householdCode}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.householdCode}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='apartmentNumber' className='mb-3'>
            <Form.Label>Apartment Number</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter apartment number'
              value={apartmentNumber}
              onChange={(e) => setApartmentNumber(e.target.value)}
              isInvalid={!!validationErrors.apartmentNumber}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.apartmentNumber}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='address' className='mb-3'>
            <Form.Label>Address</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter address'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              isInvalid={!!validationErrors.address}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.address}
            </Form.Control.Feedback>
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

export default HouseholdEditScreen; 
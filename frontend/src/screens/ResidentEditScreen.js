import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const ResidentEditScreen = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const householdIdParam = queryParams.get('household');
  
  const isEditMode = !!id;
  
  const [households, setHouseholds] = useState([]);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [idCard, setIdCard] = useState('');
  const [idCardDate, setIdCardDate] = useState('');
  const [idCardPlace, setIdCardPlace] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [nationality, setNationality] = useState('Vietnamese');
  const [ethnicity, setEthnicity] = useState('');
  const [religion, setReligion] = useState('');
  const [occupation, setOccupation] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [phone, setPhone] = useState('');
  const [householdId, setHouseholdId] = useState(householdIdParam || '');
  const [note, setNote] = useState('');
  const [active, setActive] = useState(true);
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    fetchHouseholds();
    
    if (isEditMode) {
      fetchResidentDetails();
    }
  }, [id]);
  
  const fetchHouseholds = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/households', config);
      setHouseholds(data.filter(h => h.active));
    } catch (error) {
      console.error('Error fetching households:', error);
    }
  };
  
  const fetchResidentDetails = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get(`/api/residents/${id}`, config);
      
      setFullName(data.fullName);
      
      if (data.dateOfBirth) {
        const dateObj = new Date(data.dateOfBirth);
        setDateOfBirth(dateObj.toISOString().split('T')[0]);
      }
      
      setGender(data.gender || '');
      setIdCard(data.idCard || '');
      
      if (data.idCardDate) {
        const dateObj = new Date(data.idCardDate);
        setIdCardDate(dateObj.toISOString().split('T')[0]);
      }
      
      setIdCardPlace(data.idCardPlace || '');
      setPlaceOfBirth(data.placeOfBirth || '');
      setNationality(data.nationality || 'Vietnamese');
      setEthnicity(data.ethnicity || '');
      setReligion(data.religion || '');
      setOccupation(data.occupation || '');
      setWorkplace(data.workplace || '');
      setPhone(data.phone || '');
      setHouseholdId(data.household?._id || '');
      setNote(data.note || '');
      setActive(data.active);
      
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to load resident details'
      );
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!fullName) errors.fullName = 'Full name is required';
    
    if (idCard && !/^\d+$/.test(idCard)) {
      errors.idCard = 'ID card must contain only numbers';
    }
    
    if (phone && !/^\d+$/.test(phone)) {
      errors.phone = 'Phone must contain only numbers';
    }
    
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
      
      const residentData = {
        fullName,
        dateOfBirth: dateOfBirth || null,
        gender,
        idCard,
        idCardDate: idCardDate || null,
        idCardPlace,
        placeOfBirth,
        nationality,
        ethnicity,
        religion,
        occupation,
        workplace,
        phone,
        household: householdId || null,
        note,
        active
      };
      
      if (isEditMode) {
        await axios.put(`/api/residents/${id}`, residentData, config);
      } else {
        await axios.post('/api/residents', residentData, config);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/residents');
      }, 1500);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : `Failed to ${isEditMode ? 'update' : 'create'} resident`
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Link to='/residents' className='btn btn-light my-3'>
        <i className="fas fa-arrow-left"></i> Back to Residents
      </Link>
      
      <FormContainer>
        <h1>{isEditMode ? 'Edit Resident' : 'Create Resident'}</h1>
        
        {error && <Message variant='danger'>{error}</Message>}
        {success && <Message variant='success'>{isEditMode ? 'Resident updated' : 'Resident created'}</Message>}
        {loading && <Loader />}
        
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='fullName' className='mb-3'>
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter full name'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              isInvalid={!!validationErrors.fullName}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.fullName}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group controlId='dateOfBirth' className='mb-3'>
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type='date'
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId='gender' className='mb-3'>
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={4}>
              <Form.Group controlId='idCard' className='mb-3'>
                <Form.Label>ID Card</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter ID card'
                  value={idCard}
                  onChange={(e) => setIdCard(e.target.value)}
                  isInvalid={!!validationErrors.idCard}
                />
                <Form.Control.Feedback type='invalid'>
                  {validationErrors.idCard}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group controlId='idCardDate' className='mb-3'>
                <Form.Label>ID Card Date</Form.Label>
                <Form.Control
                  type='date'
                  value={idCardDate}
                  onChange={(e) => setIdCardDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group controlId='idCardPlace' className='mb-3'>
                <Form.Label>ID Card Place</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter ID card place'
                  value={idCardPlace}
                  onChange={(e) => setIdCardPlace(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group controlId='placeOfBirth' className='mb-3'>
                <Form.Label>Place of Birth</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter place of birth'
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId='nationality' className='mb-3'>
                <Form.Label>Nationality</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter nationality'
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group controlId='ethnicity' className='mb-3'>
                <Form.Label>Ethnicity</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter ethnicity'
                  value={ethnicity}
                  onChange={(e) => setEthnicity(e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId='religion' className='mb-3'>
                <Form.Label>Religion</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter religion'
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group controlId='occupation' className='mb-3'>
                <Form.Label>Occupation</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter occupation'
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId='workplace' className='mb-3'>
                <Form.Label>Workplace</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter workplace'
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group controlId='phone' className='mb-3'>
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter phone'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  isInvalid={!!validationErrors.phone}
                />
                <Form.Control.Feedback type='invalid'>
                  {validationErrors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId='household' className='mb-3'>
                <Form.Label>Household</Form.Label>
                <Form.Select
                  value={householdId}
                  onChange={(e) => setHouseholdId(e.target.value)}
                >
                  <option value="">Not assigned</option>
                  {households.map((household) => (
                    <option key={household._id} value={household._id}>
                      {household.householdCode} - {household.apartmentNumber}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
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

export default ResidentEditScreen; 
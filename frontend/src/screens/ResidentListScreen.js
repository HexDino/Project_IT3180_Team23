import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const ResidentListScreen = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    fetchResidents();
  }, [userInfo]);
  
  const fetchResidents = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/residents', config);
      
      setResidents(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to load residents'
      );
      setLoading(false);
    }
  };
  
  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this resident?')) {
      try {
        setLoading(true);
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.delete(`/api/residents/${id}`, config);
        
        fetchResidents();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to delete resident'
        );
        setLoading(false);
      }
    }
  };
  
  const filteredResidents = residents.filter(
    (resident) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        resident.fullName?.toLowerCase().includes(searchLower) ||
        resident.idCard?.toLowerCase().includes(searchLower) ||
        resident.phone?.toLowerCase().includes(searchLower) ||
        resident.household?.householdCode?.toLowerCase().includes(searchLower) ||
        resident.household?.apartmentNumber?.toLowerCase().includes(searchLower)
      );
    }
  );
  
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Residents</h1>
        </Col>
        <Col className="text-end">
          <Button 
            className="btn-sm"
            onClick={() => navigate('/residents/create')}
          >
            <i className="fas fa-plus"></i> Add Resident
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search residents..."
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
                <th>Full Name</th>
                <th>ID Card</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Household</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.map((resident) => (
                <tr key={resident._id}>
                  <td>{resident.fullName}</td>
                  <td>{resident.idCard || 'N/A'}</td>
                  <td>{resident.dateOfBirth ? new Date(resident.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                  <td>{resident.gender || 'N/A'}</td>
                  <td>{resident.phone || 'N/A'}</td>
                  <td>
                    {resident.household ? (
                      <>
                        {resident.household.householdCode} - {resident.household.apartmentNumber}
                      </>
                    ) : (
                      'Not assigned'
                    )}
                  </td>
                  <td>
                    {resident.active ? (
                      <span className="text-success">Active</span>
                    ) : (
                      <span className="text-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    <LinkContainer to={`/residents/${resident._id}`}>
                      <Button variant="light" className="btn-sm mx-1">
                        <i className="fas fa-eye"></i>
                      </Button>
                    </LinkContainer>
                    <LinkContainer to={`/residents/${resident._id}/edit`}>
                      <Button variant="light" className="btn-sm mx-1">
                        <i className="fas fa-edit"></i>
                      </Button>
                    </LinkContainer>
                    {userInfo.role === 'admin' && (
                      <Button
                        variant="danger"
                        className="btn-sm mx-1"
                        onClick={() => deleteHandler(resident._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredResidents.length === 0 && (
            <Message>No residents found</Message>
          )}
        </>
      )}
    </>
  );
};

export default ResidentListScreen; 
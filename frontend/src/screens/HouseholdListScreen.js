import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const HouseholdListScreen = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    fetchHouseholds();
  }, [userInfo]);
  
  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/households', config);
      
      setHouseholds(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to load households'
      );
      setLoading(false);
    }
  };
  
  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this household?')) {
      try {
        setLoading(true);
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.delete(`/api/households/${id}`, config);
        
        fetchHouseholds();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to delete household'
        );
        setLoading(false);
      }
    }
  };
  
  const filteredHouseholds = households.filter(
    (household) =>
      household.householdCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      household.apartmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      household.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Households</h1>
        </Col>
        <Col className="text-end">
          <Button className="my-3" onClick={() => navigate('/households/create')}>
            <i className="fas fa-plus"></i> Add Household
          </Button>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by household code, apartment number, or address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearchTerm('')}
              >
                <i className="fas fa-times"></i>
              </Button>
            )}
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
                <th>Household Code</th>
                <th>Apartment</th>
                <th>Address</th>
                <th>Household Head</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredHouseholds.map((household) => (
                <tr key={household._id}>
                  <td>{household.householdCode}</td>
                  <td>{household.apartmentNumber}</td>
                  <td>{household.address}</td>
                  <td>
                    {household.householdHead
                      ? household.householdHead.fullName
                      : 'Not Assigned'}
                  </td>
                  <td>
                    {household.active ? (
                      <span className="text-success">Active</span>
                    ) : (
                      <span className="text-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    <LinkContainer to={`/households/${household._id}`}>
                      <Button variant="light" className="btn-sm mx-1">
                        <i className="fas fa-eye"></i>
                      </Button>
                    </LinkContainer>
                    <LinkContainer to={`/households/${household._id}/edit`}>
                      <Button variant="light" className="btn-sm mx-1">
                        <i className="fas fa-edit"></i>
                      </Button>
                    </LinkContainer>
                    {userInfo.role === 'admin' && (
                      <Button
                        variant="danger"
                        className="btn-sm mx-1"
                        onClick={() => deleteHandler(household._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredHouseholds.length === 0 && (
            <Message>No households found</Message>
          )}
        </>
      )}
    </>
  );
};

export default HouseholdListScreen; 
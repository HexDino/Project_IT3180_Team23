import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, ListGroup, Table, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const HouseholdDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [household, setHousehold] = useState(null);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    fetchHouseholdData();
  }, [id]);
  
  const fetchHouseholdData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      // Make both requests in parallel
      const [householdResponse, residentsResponse] = await Promise.all([
        axios.get(`/api/households/${id}`, config),
        axios.get(`/api/households/${id}/residents`, config)
      ]);
      
      setHousehold(householdResponse.data);
      setResidents(residentsResponse.data);
      
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to load household data'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddResident = () => {
    navigate(`/residents/create?household=${household._id}`);
  };
  
  return (
    <>
      <Link to='/households' className='btn btn-light my-3'>
        <i className="fas fa-arrow-left"></i> Back to Households
      </Link>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : household ? (
        <>
          <Row>
            <Col md={5}>
              <Card className="mb-4">
                <Card.Header>
                  <h4>Household Information</h4>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col md={5}><strong>Code:</strong></Col>
                        <Col>{household.householdCode}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={5}><strong>Apartment:</strong></Col>
                        <Col>{household.apartmentNumber}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={5}><strong>Address:</strong></Col>
                        <Col>{household.address}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={5}><strong>Status:</strong></Col>
                        <Col>
                          {household.active ? (
                            <span className="text-success">Active</span>
                          ) : (
                            <span className="text-danger">Inactive</span>
                          )}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={5}><strong>Created:</strong></Col>
                        <Col>
                          {new Date(household.creationDate).toLocaleDateString()}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    {household.note && (
                      <ListGroup.Item>
                        <Row>
                          <Col md={5}><strong>Note:</strong></Col>
                          <Col>{household.note}</Col>
                        </Row>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card.Body>
                <Card.Footer>
                  <Row>
                    <Col>
                      <Link
                        to={`/households/${household._id}/edit`}
                        className="btn btn-primary btn-sm"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </Link>
                    </Col>
                  </Row>
                </Card.Footer>
              </Card>
            </Col>
            
            <Col md={7}>
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h4>Residents ({residents.length})</h4>
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={handleAddResident}
                  >
                    <i className="fas fa-plus"></i> Add Resident
                  </Button>
                </Card.Header>
                <Card.Body>
                  {residents.length === 0 ? (
                    <Alert variant="info">
                      No residents in this household. Add a resident to get started.
                    </Alert>
                  ) : (
                    <Table striped hover responsive className="table-sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>ID Card</th>
                          <th>Gender</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {residents.map((resident) => (
                          <tr key={resident._id}>
                            <td>
                              {resident._id === household.householdHead?._id && (
                                <i className="fas fa-user-check text-success me-1" title="Household Head"></i>
                              )}
                              {resident.fullName}
                            </td>
                            <td>{resident.idCard || 'N/A'}</td>
                            <td>{resident.gender}</td>
                            <td>
                              {resident.active ? (
                                <span className="text-success">Active</span>
                              ) : (
                                <span className="text-danger">Inactive</span>
                              )}
                            </td>
                            <td>
                              <Link to={`/residents/${resident._id}`}>
                                <Button variant="light" className="btn-sm">
                                  <i className="fas fa-eye"></i>
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col>
              <Card className="mb-4">
                <Card.Header>
                  <h4>Payment History</h4>
                </Card.Header>
                <Card.Body>
                  <Link to={`/payments?household=${household._id}`} className="btn btn-primary">
                    View Payments
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Message>Household not found</Message>
      )}
    </>
  );
};

export default HouseholdDetailScreen; 
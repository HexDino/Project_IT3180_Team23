import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const FeeListScreen = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    fetchFees();
  }, [userInfo]);
  
  const fetchFees = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/fees', config);
      
      setFees(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to load fees'
      );
      setLoading(false);
    }
  };
  
  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee?')) {
      try {
        setLoading(true);
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.delete(`/api/fees/${id}`, config);
        
        fetchFees();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to delete fee'
        );
        setLoading(false);
      }
    }
  };
  
  const filteredFees = fees.filter(
    (fee) =>
      fee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.feeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.feeType?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Fees</h1>
        </Col>
        <Col className="text-end">
          <Button 
            className="btn-sm"
            onClick={() => navigate('/fees/create')}
          >
            <i className="fas fa-plus"></i> Add Fee
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search fees..."
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
                <th>Code</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((fee) => (
                <tr key={fee._id}>
                  <td>{fee.feeCode}</td>
                  <td>{fee.name}</td>
                  <td>${fee.amount?.toLocaleString()}</td>
                  <td>{fee.feeType}</td>
                  <td>
                    {fee.active ? (
                      <span className="text-success">Active</span>
                    ) : (
                      <span className="text-danger">Inactive</span>
                    )}
                  </td>
                  <td>{fee.startDate ? new Date(fee.startDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{fee.endDate ? new Date(fee.endDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <LinkContainer to={`/fees/${fee._id}`}>
                      <Button variant="light" className="btn-sm mx-1">
                        <i className="fas fa-eye"></i>
                      </Button>
                    </LinkContainer>
                    <LinkContainer to={`/fees/${fee._id}/edit`}>
                      <Button variant="light" className="btn-sm mx-1">
                        <i className="fas fa-edit"></i>
                      </Button>
                    </LinkContainer>
                    {userInfo.role === 'admin' && (
                      <Button
                        variant="danger"
                        className="btn-sm mx-1"
                        onClick={() => deleteHandler(fee._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredFees.length === 0 && (
            <Message>No fees found</Message>
          )}
        </>
      )}
    </>
  );
};

export default FeeListScreen; 
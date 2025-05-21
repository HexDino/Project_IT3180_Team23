import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { register, userInfo, loading } = useContext(AuthContext);
  
  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (userInfo) {
      navigate('/dashboard');
    }
  }, [navigate, userInfo]);
  
  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const result = await register(name, email, password);
    
    if (!result.success) {
      setError(result.message);
    } else {
      setSuccess(true);
      
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };
  
  return (
    <Row className="justify-content-md-center mt-5">
      <Col md={6}>
        <Card className="p-4 shadow">
          <Card.Body>
            <h2 className="text-center mb-4">Register</h2>
            
            {error && <Message variant="danger">{error}</Message>}
            {success && (
              <Message variant="success">
                Registration successful! Redirecting to login...
              </Message>
            )}
            {loading && <Loader />}
            
            <Form onSubmit={submitHandler}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Form.Group controlId="email" className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Form.Group controlId="password" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Button
                type="submit"
                variant="primary"
                className="w-100 mt-3"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
              
              <div className="text-center mt-3">
                Already have an account?{' '}
                <Link to="/login">Sign In</Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RegisterScreen; 
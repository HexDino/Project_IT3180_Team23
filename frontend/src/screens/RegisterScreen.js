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
      setError('Mật khẩu không khớp');
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
            <h2 className="text-center mb-4">Đăng Ký</h2>
            
            {error && <Message variant="danger">{error}</Message>}
            {success && (
              <Message variant="success">
                Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...
              </Message>
            )}
            {loading && <Loader />}
            
            <Form onSubmit={submitHandler}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Họ và tên</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Form.Group controlId="email" className="mb-3">
                <Form.Label>Địa chỉ Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Form.Group controlId="password" className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label>Xác nhận mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Xác nhận mật khẩu"
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
                {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
              </Button>
              
              <div className="text-center mt-3">
                Đã có tài khoản?{' '}
                <Link to="/login">Đăng Nhập</Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RegisterScreen; 
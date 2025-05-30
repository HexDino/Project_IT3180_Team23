import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const PaymentCreateScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy query params từ URL
  const searchParams = new URLSearchParams(location.search);
  const householdParam = searchParams.get('household');
  const feeParam = searchParams.get('fee');
  
  const [households, setHouseholds] = useState([]);
  const [fees, setFees] = useState([]);
  
  // Form fields
  const [householdId, setHouseholdId] = useState(householdParam || '');
  const [feeId, setFeeId] = useState(feeParam || '');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [payerName, setPayerName] = useState('');
  const [payerId, setPayerId] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [note, setNote] = useState('');
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const { userInfo } = useContext(AuthContext);
  
  const fetchHouseholdHead = useCallback(async () => {
    try {
      if (!householdId || !userInfo) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get(`/api/households/${householdId}/residents`, config);
      
      // Tìm chủ hộ hoặc người đầu tiên trong danh sách
      const householdHead = data.find(resident => resident.isHouseholdHead) || data[0];
      
      if (householdHead) {
        setPayerName(householdHead.fullName || '');
        setPayerId(householdHead.idCard || '');
        setPayerPhone(householdHead.phone || '');
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin chủ hộ:', error);
    }
  }, [householdId, userInfo]);
  
  const fetchHouseholds = useCallback(async () => {
    try {
      if (!userInfo) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/households', config);
      setHouseholds(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách hộ gia đình:', error);
    }
  }, [userInfo]);
  
  const fetchFees = useCallback(async () => {
    try {
      if (!userInfo) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/fees', config);
      setFees(data.filter(fee => fee.active));
    } catch (error) {
      console.error('Lỗi khi tải danh sách phí:', error);
    }
  }, [userInfo]);
  
  // Tải danh sách hộ dân và phí khi component mount
  useEffect(() => {
    fetchHouseholds();
    fetchFees();
  }, [userInfo, fetchHouseholds, fetchFees]);
  
  // Khi feeId thay đổi, cập nhật số tiền
  useEffect(() => {
    if (feeId) {
      const fee = fees.find(f => f._id === feeId);
      if (fee) {
        setAmount(fee.amount);
      }
    }
  }, [feeId, fees]);
  
  // Nếu đã chọn hộ dân và có thông tin về chủ hộ, điền thông tin người thanh toán
  useEffect(() => {
    if (householdId) {
      fetchHouseholdHead();
    }
  }, [householdId, fetchHouseholdHead]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!householdId) errors.householdId = 'Hộ gia đình là bắt buộc';
    if (!feeId) errors.feeId = 'Loại phí là bắt buộc';
    if (!amount || amount <= 0) errors.amount = 'Số tiền phải lớn hơn 0';
    if (!paymentDate) errors.paymentDate = 'Ngày thanh toán là bắt buộc';
    
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
          : 'Không thể tạo thanh toán'
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
        <i className="fas fa-arrow-left"></i> Quay lại Thanh Toán
      </Link>
      
      <FormContainer>
        <h1>Tạo Thanh Toán Mới</h1>
        
        {error && <Message variant='danger'>{error}</Message>}
        {success && <Message variant='success'>Thanh toán đã được tạo thành công</Message>}
        {loading && <Loader />}
        
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='household' className='mb-3'>
            <Form.Label>Hộ Gia Đình</Form.Label>
            <Form.Select
              value={householdId}
              onChange={(e) => setHouseholdId(e.target.value)}
              isInvalid={!!validationErrors.householdId}
              required
            >
              <option value="">Chọn Hộ Gia Đình</option>
              {households.map((household) => (
                <option key={household._id} value={household._id}>
                  {household.apartmentNumber}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type='invalid'>
              {validationErrors.householdId}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='fee' className='mb-3'>
            <Form.Label>Loại Phí</Form.Label>
            <Form.Select
              value={feeId}
              onChange={(e) => setFeeId(e.target.value)}
              isInvalid={!!validationErrors.feeId}
              required
            >
              <option value="">Chọn Loại Phí</option>
              {fees.map((fee) => (
                <option key={fee._id} value={fee._id}>
                  {fee.name} ({fee.amount.toLocaleString()} VND)
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type='invalid'>
              {validationErrors.feeId}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='amount' className='mb-3'>
            <Form.Label>Số Tiền</Form.Label>
            <Form.Control
              type='number'
              placeholder='Nhập số tiền'
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
            <Form.Label>Ngày Thanh Toán</Form.Label>
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
                <Form.Label>Tên Người Thanh Toán</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Nhập tên người thanh toán'
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId='payerPhone' className='mb-3'>
                <Form.Label>Số Điện Thoại</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Nhập số điện thoại'
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group controlId='payerId' className='mb-3'>
            <Form.Label>CMND/CCCD</Form.Label>
            <Form.Control
              type='text'
              placeholder='Nhập CMND/CCCD'
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group controlId='receiptNumber' className='mb-3'>
            <Form.Label>Mã Biên Lai</Form.Label>
            <Form.Control
              type='text'
              placeholder='Nhập mã biên lai'
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
            />
            <Form.Text className="text-muted">
              Tự động tạo, nhưng có thể thay đổi
            </Form.Text>
          </Form.Group>
          
          <Form.Group controlId='note' className='mb-3'>
            <Form.Label>Ghi Chú</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              placeholder='Nhập ghi chú (không bắt buộc)'
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Form.Group>
          
          <Button type='submit' variant='primary' className='mt-3'>
            Tạo Thanh Toán
          </Button>
        </Form>
      </FormContainer>
    </>
  );
};

export default PaymentCreateScreen; 
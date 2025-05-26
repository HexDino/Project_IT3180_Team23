import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const PaymentListScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  // Check if user is admin
  const isAdmin = userInfo && userInfo.role === 'admin';
  
  useEffect(() => {
    fetchPayments();
  }, [userInfo]);
  
  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/payments', config);
      setPayments(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải danh sách thanh toán'
      );
      setLoading(false);
    }
  };
  
  const handleRefund = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn hoàn tiền khoản thanh toán này? Hành động này không thể hoàn tác.')) {
      try {
        setLoading(true);
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.put(`/api/payments/${id}/refund`, {}, config);
        
        fetchPayments();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Không thể hoàn tiền khoản thanh toán'
        );
        setLoading(false);
      }
    }
  };
  
  const filteredPayments = payments.filter(
    (payment) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.household?.householdCode?.toLowerCase().includes(searchLower) ||
        payment.household?.apartmentNumber?.toLowerCase().includes(searchLower) ||
        payment.fee?.name?.toLowerCase().includes(searchLower) ||
        payment.receiptNumber?.toLowerCase().includes(searchLower) ||
        (payment.payerName && payment.payerName.toLowerCase().includes(searchLower))
      );
    }
  );
  
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Thanh Toán</h1>
        </Col>
        <Col className="text-end">
          <Button 
            className="btn-sm"
            onClick={() => navigate('/payments/create')}
          >
            <i className="fas fa-plus"></i> Tạo Thanh Toán
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm thanh toán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm('')}
            >
              Xóa
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
                <th>Mã Biên Lai</th>
                <th>Hộ Gia Đình</th>
                <th>Loại Phí</th>
                <th>Số Tiền</th>
                <th>Ngày Thanh Toán</th>
                <th>Người Thanh Toán</th>
                <th>Trạng Thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.receiptNumber || 'N/A'}</td>
                  <td>
                    {payment.household ? (
                      <>
                        {payment.household.householdCode} - {payment.household.apartmentNumber}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{payment.fee ? payment.fee.name : 'N/A'}</td>
                  <td>{payment.amount?.toLocaleString()} VND</td>
                  <td>{new Date(payment.paymentDate).toLocaleDateString('vi-VN')}</td>
                  <td>{payment.payerName || 'Không xác định'}</td>
                  <td>
                    {payment.isRefunded ? (
                      <span className="text-danger">Đã hoàn tiền</span>
                    ) : (
                      <span className="text-success">Đã thanh toán</span>
                    )}
                  </td>
                  <td>
                    <LinkContainer to={`/payments/${payment._id}`}>
                      <Button variant="light" className="btn-sm mx-1">
                        <i className="fas fa-eye"></i>
                      </Button>
                    </LinkContainer>
                    {!payment.isRefunded && isAdmin && (
                      <Button
                        variant="warning"
                        className="btn-sm mx-1"
                        onClick={() => handleRefund(payment._id)}
                      >
                        <i className="fas fa-undo"></i> Hoàn tiền
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredPayments.length === 0 && (
            <Message>Không tìm thấy khoản thanh toán nào</Message>
          )}
        </>
      )}
    </>
  );
};

export default PaymentListScreen; 
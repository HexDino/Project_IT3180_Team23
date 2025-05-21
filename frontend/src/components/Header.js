import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import AuthContext from '../context/AuthContext';

const Header = () => {
  const { userInfo, logout } = useContext(AuthContext);
  
  // Helper function to check if user is admin
  const isAdmin = () => userInfo && userInfo.role === 'admin';
  
  // Helper function to check if user is manager
  const isManager = () => userInfo && userInfo.role === 'manager';
  
  return (
    <header>
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to={userInfo ? '/dashboard' : '/'}>
            <Navbar.Brand>
              <i className="fas fa-building"></i> BlueMoon Apartments
            </Navbar.Brand>
          </LinkContainer>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {userInfo ? (
                <>
                  {/* Navigation items for all authenticated administrative users */}
                  <LinkContainer to="/dashboard">
                    <Nav.Link>
                      <i className="fas fa-chart-line"></i> Dashboard
                    </Nav.Link>
                  </LinkContainer>
                  
                  <LinkContainer to="/households">
                    <Nav.Link>
                      <i className="fas fa-home"></i> Households
                    </Nav.Link>
                  </LinkContainer>
                  
                  <LinkContainer to="/residents">
                    <Nav.Link>
                      <i className="fas fa-users"></i> Residents
                    </Nav.Link>
                  </LinkContainer>
                  
                  <LinkContainer to="/fees">
                    <Nav.Link>
                      <i className="fas fa-file-invoice-dollar"></i> Fees
                    </Nav.Link>
                  </LinkContainer>
                  
                  <LinkContainer to="/payments">
                    <Nav.Link>
                      <i className="fas fa-money-bill-wave"></i> Payments
                    </Nav.Link>
                  </LinkContainer>
                  
                  {/* User dropdown menu */}
                  <NavDropdown 
                    title={
                      <>
                        <i className="fas fa-user"></i> {userInfo.name || userInfo.username} 
                        <span className="ms-1">({userInfo.role})</span>
                      </>
                    } 
                    id="username"
                  >
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>Profile</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logout}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <i className="fas fa-user"></i> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}
              
              {/* Admin menu - only show if user is admin */}
              {isAdmin() && (
                <NavDropdown title="Admin" id="adminmenu">
                  <LinkContainer to="/admin/users">
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/reports">
                    <NavDropdown.Item>Reports</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
              
              {/* Manager menu - only show if user is manager */}
              {isManager() && (
                <NavDropdown title="Manager" id="managermenu">
                  <LinkContainer to="/admin/reports">
                    <NavDropdown.Item>Reports</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header; 
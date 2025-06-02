import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import axios from 'axios';
import { login } from '../../components/Layout/DefaultLayout/Taskbar/authenSlice';
import Url from '../../utils/url';
import './signin.scss';

function SignIn() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await axios.post(Url(`login`), {
                username,
                password,
            });
            localStorage.setItem('userInfo', JSON.stringify(result.data));
            dispatch(login(result.data));
            navigate('/cook');
        } catch (error: any) {
            alert(error.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-glass-card">
                {/* Modern Logo with Animation */}
                <div className="auth-logo">
                    <div className="logo-icon">
                        <div className="house"></div>
                        <div className="cart">
                            <div className="cart-line"></div>
                            <div className="cart-wheel left"></div>
                            <div className="cart-wheel right"></div>
                        </div>
                    </div>
                    <h1 className="logo-text">Mua sắm tiện lợi</h1>
                    <p className="logo-subtext">Quản lý nhà bếp thông minh</p>
                </div>

                {/* Auth Form */}
                <Form onSubmit={handleSignIn} className="auth-form">
                    <h2 className="auth-title">Chào mừng quay trở lại</h2>
                    <p className="auth-subtitle">Đăng nhập để tiếp tục</p>
                    
                    <Form.Group controlId="username" className="mb-4">
                        <Form.Label>Tên đăng nhập</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </Form.Group>
                    
                    <Form.Group controlId="password" className="mb-4">
                        <Form.Label>Mật khẩu</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </Form.Group>
                    
                    <Button 
                        type="submit" 
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            'Đăng nhập'
                        )}
                    </Button>
                    
                    <div className="auth-footer">
                        <span>Bạn chưa có tài khoản?</span>
                        <Link to="/sign-up" className="auth-link">
                            Đăng ký ngay
                        </Link>
                    </div>
                </Form>
            </div>
            
            {/* Background elements */}
            <div className="bg-blobs">
                <div className="blob-1"></div>
                <div className="blob-2"></div>
            </div>
        </div>
    );
}

export default SignIn;
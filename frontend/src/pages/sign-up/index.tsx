import { Form, Button, Toast } from 'react-bootstrap';
import './signup.scss';
import { Link, useNavigate } from 'react-router-dom';
import img from '../../images/logo.png';
import { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Url from '../../utils/url';

function SignUp() {
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [gender, setGender] = useState('Nam');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [avatar, setAvatar] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateForm = () => {
        // Kiểm tra mật khẩu trùng khớp
        if(password != confirmPassword) {
            setPasswordError('Mật khẩu nhập lại không khớp!');
            return false;
        }

        // Kiểm tra email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            alert('Email không hợp lệ');
            return false;
        }

        // Kiểm tra các trường bắt buộc
        if (!name || !username || !password || !email) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return false;
        }

        return true;
    }

    const handleRegister = async () => {
        const dataSubmit = {
            name,
            gender,
            username,
            password,
            address,
            email,
            avatar:
                gender === 'Nam'
                    ? 'https://cdn0.iconfinder.com/data/icons/user-pictures/100/malecostume-512.png'
                    : 'https://cdn4.iconfinder.com/data/icons/people-avatar-filled-outline/64/girl_female_young_people_woman_teenager_avatar-512.png',
        };

        try {
            const result = await axios.post(Url('register'), dataSubmit);
            if (result) {
                setShowToast(true);
                setTimeout(() => {
                    navigate('/');
                }, 3500);
            }
        } catch (error: any) {
            alert(error.response.data.message);
        }
    };

    return (
        <div className="bg rounded-4 position-relative" style={{ height: '100vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-center flex-column align-items-center py-4">
                <div className="mt-3 center">
                    <img src={img} alt="logo" className="w-100" />
                </div>
                <Form className="mb-4" style={{ width: '30%', minWidth: '320px', marginTop: '3vh' }}>
                    <h2 className="text-center mb-3">Đăng ký tài khoản</h2>
                    
                    {/* Thông tin cá nhân */}
                    <h5 className="mt-4 mb-3">Thông tin cá nhân</h5>
                    
                    <Form.Group className="fs-5 mb-3" controlId="ControlInput1">
                        <Form.Label>Họ và Tên <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập họ và tên"
                            size="lg"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    
                    <Form.Group className="fs-5 mb-3" controlId="ControlInput5">
                        <Form.Label>Giới tính</Form.Label>
                        <Form.Select
                            size="lg"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="nam">Nam</option>
                            <option value="nữ">Nữ</option>
                            <option value="khac">Khác</option>
                        </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="fs-5 mb-3" controlId="ControlInputEmail">
                        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="example@email.com"
                            size="lg"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                    
                    
                    <Form.Group className="fs-5 mb-4" controlId="ControlInputAddress">
                        <Form.Label>Địa chỉ</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Nhập địa chỉ"
                            size="lg"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </Form.Group>
                    
                    {/* Thông tin đăng nhập */}
                    <h5 className="mt-4 mb-3">Thông tin đăng nhập</h5>
                    
                    <Form.Group className="fs-5 mb-3" controlId="ControlInput2">
                        <Form.Label>Tên đăng nhập <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tên đăng nhập"
                            size="lg"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>
                    
                    <Form.Group className="fs-5 mb-3" controlId="ControlInput3">
                        <Form.Label>Mật khẩu <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Nhập mật khẩu"
                            size="lg"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setPasswordError('');
                            }}
                            required
                        />
                    </Form.Group>
                    
                    <Form.Group className="fs-5 mb-4" controlId="ControlInput4">
                        <Form.Label>Nhập lại mật khẩu <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="password" 
                            placeholder="Nhập lại mật khẩu" 
                            size="lg"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setPasswordError('');
                            }}
                            required 
                        />
                        {passwordError && <div className="text-danger mt-1">{passwordError}</div>}
                    </Form.Group>
                    
                    <div className="mt-4 mb-2">
                        <p><span className="text-danger">*</span> Thông tin bắt buộc</p>
                    </div>
                    
                    <div className="mt-4 text-center w-100">
                        <Button className="fs-4 signup_button border" onClick={handleRegister}>
                            Đăng ký
                        </Button>
                    </div>
                    
                    <div
                        className="mt-3 d-flex justify-content-center"
                        style={{ fontSize: '1.2rem' }}
                    >
                        <div>
                            <span>Bạn đã có tài khoản?</span>
                            <Link to="/" className="signup_link ms-1">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    </div>
                </Form>
            </div>
            
            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={3000}
                autohide
                bg="success"
                className="position-absolute end-3 top-3"
            >
                <Toast.Header>
                    <strong className="me-auto">Thành công</strong>
                </Toast.Header>
                <Toast.Body className="bg-light">Bạn đã tạo tài khoản thành công</Toast.Body>
            </Toast>
        </div>
    );
}

export default SignUp;

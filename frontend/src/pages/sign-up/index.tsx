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
    const [gender, setGender] = useState('nam');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        const dataSubmit = {
            name,
            gender,
            username,
            password,
            address: '',
            email: '',
            avatar:
                gender === 'nam'
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
        <div className="bg rounded-4 positon-relative" style={{ height: '100vh' }}>
            <div className="d-flex justify-content-center flex-column align-items-center">
                <div className="mt-5 center">
                    <img src={img} alt="logo" className="w-100" />
                </div>
                <Form className="" style={{ width: '30%', marginTop: '6vh' }}>
                    <h2 className="text-center mb-3">Đăng ký tài khoản</h2>
                    <Form.Group className="fs-5 mb-3" controlId="ControlInput1">
                        <Form.Label>Họ và Tên</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter name"
                            size="lg"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="fs-5 mb-4" controlId="ControlInput5">
                        <Form.Label>Giới tính</Form.Label>
                        <Form.Select
                            size="lg"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="nam">Nam</option>
                            <option value="nữ">Nữ</option>
                            <option value="">Khác</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="fs-5 mb-3" controlId="ControlInput2">
                        <Form.Label>Nhập tên người dùng</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter username"
                            size="lg"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="fs-5 mb-3" controlId="ControlInput3">
                        <Form.Label>Nhập mật khẩu</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter password"
                            size="lg"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="fs-5 mb-4" controlId="ControlInput4">
                        <Form.Label>Nhập lại mật khẩu</Form.Label>
                        <Form.Control type="password" placeholder="Enter password" size="lg" />
                    </Form.Group>
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

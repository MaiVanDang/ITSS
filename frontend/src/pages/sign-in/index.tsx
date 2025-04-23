import { Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { login } from '../../components/Layout/DefaultLayout/Taskbar/authenSlice';
import img from '../../images/logo.png';
import './signin.scss';
import { useState } from "react";
import axios from 'axios';
import Url from '../../utils/url';
import { useNavigate } from 'react-router-dom';

function SignIn() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const handleSignIn = async () => {
        try {
            const result = await axios.post(Url(`login`), {
                username,
                password,
            });
            localStorage.setItem('userInfo', JSON.stringify(result.data));
            dispatch(login(result.data));
            navigate('/cook');
        } catch (error: any) {
            alert(error.response.data.message);
        }

        // dispatch(login());
    };
    return (
        <div className="bg rounded-4" style={{ height: '100vh' }}>
            <div className="d-flex justify-content-center flex-column align-items-center">
                <div className="mt-5 center">
                    <img src={img} alt="logo" className="w-100" />
                </div>
                <Form className="" style={{ width: '30%', marginTop: '10vh' }}>
                    <h1 className="text-center mb-3">Đăng nhập</h1>
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

                    <div className="mt-5 text-center w-100" onClick={handleSignIn}>
                        <Button className="fs-4 border signin_button">Đăng nhập</Button>
                    </div>
                    <div
                        className="mt-4 d-flex justify-content-center"
                        style={{ fontSize: '1.2rem' }}
                    >
                        <div>
                            <span>Bạn chưa có tài khoản?</span>
                            <Link to="/sign-up" className="signup_link ms-1">
                                Đăng ký ngay
                            </Link>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default SignIn;
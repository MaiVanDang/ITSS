import { useState } from 'react';
import { Form, Button, Toast, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Url from '../../utils/url';
import './signup.scss';

interface FormData {
    name: string;
    gender: string;
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    address: string;
}

const INITIAL_FORM_DATA: FormData = {
    name: '',
    gender: 'Nam',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    address: ''
};

const GENDER_OPTIONS = [
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' },
    { value: 'Khác', label: 'Khác' }
];

const AVATAR_URLS = {
    Nam: 'https://cdn0.iconfinder.com/data/icons/user-pictures/100/malecostume-512.png',
    Nữ: 'https://cdn4.iconfinder.com/data/icons/people-avatar-filled-outline/64/girl_female_young_people_woman_teenager_avatar-512.png'
};

function SignUp() {
    const [showToast, setShowToast] = useState(false);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
    const [passwordError, setPasswordError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'password' || name === 'confirmPassword') {
            setPasswordError('');
        }
    };

    const validateForm = (): boolean => {
        // Check required fields
        const requiredFields = ['name', 'username', 'password', 'email'];
        const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
        
        if (missingFields.length > 0) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return false;
        }

        // Check password match
        if (formData.password !== formData.confirmPassword) {
            setPasswordError('Mật khẩu nhập lại không khớp!');
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Email không hợp lệ');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        const dataSubmit = {
            ...formData,
            avatar: AVATAR_URLS[formData.gender as keyof typeof AVATAR_URLS] || AVATAR_URLS.Nam
        };

        try {
            await axios.post(Url('register'), dataSubmit);
            setShowToast(true);
            setTimeout(() => navigate('/'), 3500);
        } catch (error: any) {
            alert(error.response?.data?.message || "Đăng ký không thành công. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const FormField = ({ 
        id, 
        label, 
        type = 'text', 
        name, 
        placeholder, 
        required = false,
        as = undefined,
        rows = undefined,
        options = undefined
    }: {
        id: string;
        label: string;
        type?: string;
        name: keyof FormData;
        placeholder: string;
        required?: boolean;
        as?: 'textarea';
        rows?: number;
        options?: Array<{value: string, label: string}>;
    }) => (
        <Form.Group controlId={id} className="mb-3">
            <Form.Label>
                {label}
                {required && <span className="required">*</span>}
            </Form.Label>
            {options ? (
                <Form.Select
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="auth-input"
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Form.Select>
            ) : (
                <Form.Control
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleChange}
                    required={required}
                    className="auth-input"
                    as={as}
                    rows={rows}
                />
            )}
            {name === 'confirmPassword' && passwordError && (
                <div className="error-message">{passwordError}</div>
            )}
        </Form.Group>
    );

    return (
        <div className="auth-container">
            <div className="auth-glass-card">
                {/* Logo Section */}
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

                {/* Registration Form */}
                <Form onSubmit={handleSubmit} className="auth-form">
                    <h2 className="auth-title">Tạo tài khoản</h2>
                    <p className="auth-subtitle">Tham gia cùng chúng tôi để bắt đầu</p>

                    {/* Personal Information Section */}
                    <div className="form-section">
                        <h5 className="section-title">Thông tin cá nhân</h5>
                        
                        <Row>
                            <Col md={8}>
                                <FormField
                                    id="name"
                                    label="Họ và tên"
                                    name="name"
                                    placeholder="Nhập tên đầy đủ"
                                    required
                                />
                            </Col>
                            <Col md={4}>
                                <FormField
                                    id="gender"
                                    label="Giới tính"
                                    name="gender"
                                    placeholder=""
                                    options={GENDER_OPTIONS}
                                />
                            </Col>
                        </Row>

                        <FormField
                            id="email"
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="abc@email.com"
                            required
                        />

                        <FormField
                            id="address"
                            label="Địa chỉ"
                            name="address"
                            placeholder="Nhập địa chỉ của bạn"
                            as="textarea"
                            rows={2}
                        />
                    </div>

                    {/* Login Information Section */}
                    <div className="form-section">
                        <h5 className="section-title">Thông tin đăng nhập</h5>
                        
                        <FormField
                            id="username"
                            label="Tên đăng nhập"
                            name="username"
                            placeholder="Nhập tên đăng nhập"
                            required
                        />

                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="password"
                                    label="Mật khẩu"
                                    type="password"
                                    name="password"
                                    placeholder="Nhập mật khẩu"
                                    required
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    id="confirmPassword"
                                    label="Nhập lại mật khẩu"
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                />
                            </Col>
                        </Row>
                    </div>

                    <div className="required-note">
                        <span className="required">*</span> Bắt buộc
                    </div>

                    <Button 
                        type="submit" 
                        className="auth-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span className="ms-2">Đang xử lý...</span>
                            </>
                        ) : (
                            'Đăng ký'
                        )}
                    </Button>

                    <div className="auth-footer">
                        <span>Bạn đã có tài khoản?</span>
                        <Link to="/" className="auth-link">
                            Đăng nhập ngay
                        </Link>
                    </div>
                </Form>
            </div>

            {/* Background elements */}
            <div className="bg-blobs">
                <div className="blob-1"></div>
                <div className="blob-2"></div>
            </div>

            {/* Success Toast */}
            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={3000}
                autohide
                className="success-toast"
            >
                <Toast.Header>
                    <strong className="me-auto">Success</strong>
                </Toast.Header>
                <Toast.Body>Tạo tài khoản thành công!</Toast.Body>
            </Toast>
        </div>
    );
}

export default SignUp;
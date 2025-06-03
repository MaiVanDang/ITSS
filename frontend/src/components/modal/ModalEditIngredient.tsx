import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, Form, InputGroup, Modal, Toast, Badge, Image } from 'react-bootstrap';
import Url from '../../utils/url';
import { editIngredient } from '../../pages/ingredient/IngredientSlice';
import { useDispatch } from 'react-redux';
import { ingredientProps } from '../../utils/interface/Interface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface ModalAddIngredientProps {
    show: boolean;
    hide: () => void;
    ingredient: ingredientProps;
}

function ModalEditIngredient({ show, hide, ingredient }: ModalAddIngredientProps) {
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(0);
    const [ingredientStatus, setIngredientStatus] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');
    const [isLoading, setIsLoading] = useState(false);

    // Edit Ingredient
    const handleEditIngredient = async () => {
        setIsLoading(true);
        const dataSubmit = {
            name,
            image: link,
            description,
            dueDate,
            ingredientStatus,
        };
        try {
            await axios.put(Url(`ingredient/update/${ingredient.id}`), dataSubmit);
            dispatch(
                editIngredient({
                    id: ingredient.id,
                    data: dataSubmit,
                }),
            );
            setToastVariant('success');
            setToastMessage('Cập nhật nguyên liệu thành công!');
            setShowToast(true);
            setTimeout(() => {
                hide();
            }, 1500);
        } catch (error: any) {
            setToastVariant('danger');
            setToastMessage(error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật!');
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            setName(ingredient.name);
            setLink(ingredient.image);
            setDescription(ingredient.description);
            setDueDate(ingredient.dueDate);
            setIngredientStatus(ingredient.ingredientStatus);
        }
    }, [show, ingredient]);

    // Ngăn cuộn khi modal mở (giống như trong ModalDetailDish)
    useEffect(() => {
        if (show) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            
            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [show]);

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'FRESH_INGREDIENT':
                return <Badge bg="success">Nguyên liệu tươi</Badge>;
            case 'DRY_INGREDIENT':
                return <Badge bg="secondary">Nguyên liệu khô</Badge>;
            case 'SEASONING':
                return <Badge bg="warning" className="text-dark">Gia vị nêm</Badge>;
            default:
                return <Badge bg="primary">Nguyên liệu</Badge>;
        }
    };

    return (
        <div>
            <Modal 
                show={show} 
                onHide={hide}
                size="lg"
                backdrop="static"
                keyboard={false}
                style={{ 
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxHeight: '90vh'
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title className="fs-3">
                        {ingredient ? `Chỉnh sửa: ${ingredient.name}` : 'Chỉnh sửa nguyên liệu'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <div className="row">
                        {/* Cột trái: Hiển thị ảnh và thông tin cơ bản */}
                        <div className="col-md-4 mb-4">
                            <div className="text-center mb-3">
                                <Image
                                    src={link || ingredient.image}
                                    alt={name}
                                    fluid
                                    className="rounded"
                                    style={{ 
                                        maxHeight: '200px', 
                                        objectFit: 'cover', 
                                        width: '100%' 
                                    }}
                                />
                            </div>
                            <div className="text-center">
                                <h4>{name || ingredient.name}</h4>
                                {ingredientStatus && (
                                    <div className="my-2">
                                        {renderStatusBadge(ingredientStatus)}
                                    </div>
                                )}
                                <p className="text-muted small">
                                    {description || ingredient.description}
                                </p>
                            </div>
                        </div>
                        
                        {/* Cột phải: Form chỉnh sửa */}
                        <div className="col-md-8">
                            <Form>
                                <Form.Group className="mb-3" controlId="1">
                                    <Form.Label>Tên nguyên liệu</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nhập tên nguyên liệu"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="2">
                                    <Form.Label>Link ảnh</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        placeholder="Dán link ảnh vào đây"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="3">
                                    <Form.Label>Mô tả nguyên liệu</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Mô tả chi tiết về nguyên liệu"
                                    />
                                </Form.Group>

                                <div className="row">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3" controlId="4">
                                            <Form.Label>Số ngày hết hạn sau khi mua</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    value={dueDate}
                                                    onChange={(e) => setDueDate(parseInt(e.target.value) || 0)}
                                                />
                                                <InputGroup.Text>Ngày</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3" controlId="5">
                                            <Form.Label>Loại nguyên liệu</Form.Label>
                                            <Form.Select
                                                value={ingredientStatus}
                                                onChange={(e) => setIngredientStatus(e.target.value)}
                                            >
                                                <option value="FRESH_INGREDIENT">Nguyên liệu tươi</option>
                                                <option value="DRY_INGREDIENT">Nguyên liệu khô</option>
                                                <option value="INGREDIENT">Nguyên liệu thường</option>
                                                <option value="SEASONING">Gia vị nêm</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={hide} disabled={isLoading}>
                        Hủy bỏ
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleEditIngredient} 
                        disabled={isLoading || !name || !link}
                    >
                        {isLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                Đang lưu...
                            </>
                        ) : (
                            'Lưu thay đổi'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Toast thông báo */}
            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={3000}
                autohide
                bg={toastVariant}
                className="position-fixed end-0 top-0 m-3"
                style={{ zIndex: 3000 }}
            >
                <Toast.Header>
                    <strong className="me-auto">Thông báo</strong>
                </Toast.Header>
                <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
                    {toastMessage}
                </Toast.Body>
            </Toast>
        </div>
    );
}

export default ModalEditIngredient;
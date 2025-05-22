import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, Form, InputGroup, Modal, Toast, ToastContainer } from 'react-bootstrap';
import Url from '../../utils/url';
import { editIngredient } from '../../pages/ingredient/IngredientSlice';
import { useDispatch } from 'react-redux';
import { ingredientProps } from '../../utils/interface/Interface';

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
                window.location.reload(); // Reload trang sau khi cập nhật thành công
            }, 1500);
        } catch (error: any) {
            setToastVariant('danger');
            setToastMessage(error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật!');
            setShowToast(true);
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

    return (
        <>
            <Modal show={show} size="lg" onHide={hide}>
                <Modal.Header closeButton>
                    <Modal.Title>Nguyên liệu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="1">
                        <Form.Label>Tên nguyên liệu</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="2">
                        <Form.Label>Link ảnh</Form.Label>
                        <Form.Control
                            type="text"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="3">
                        <Form.Label>Mô tả nguyên liệu</Form.Label>
                        <Form.Control
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="4">
                        <Form.Label>Số ngày hết hạn sau khi mua</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="number"
                                value={dueDate}
                                onChange={(e) => setDueDate(parseInt(e.target.value))}
                            />
                            <InputGroup.Text>Ngày</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="5">
                        <Form.Label>Trạng thái nguyên liệu</Form.Label>
                        <Form.Select
                            value={ingredientStatus}
                            onChange={(e) => setIngredientStatus(e.target.value)}
                        >
                            <option value="FRESH_INGREDIENT">Nguyên liệu tươi</option>
                            <option value="DRY_INGREDIENT">Nguyên liệu khô</option>
                            <option value="INGREDIENT">Nguyên liệu</option>
                            <option value="SEASONING">Gia vị nêm</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hide} disabled={isLoading}>
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleEditIngredient} disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Lưu thay đổi'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast 
                    onClose={() => setShowToast(false)} 
                    show={showToast} 
                    delay={3000} 
                    autohide 
                    bg={toastVariant}
                >
                    <Toast.Header>
                        <strong className="me-auto">Thông báo</strong>
                    </Toast.Header>
                    <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

export default ModalEditIngredient;
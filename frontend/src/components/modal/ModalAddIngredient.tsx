import axios from 'axios';
import { useState } from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import Url from '../../utils/url';
import { addIngredients } from '../../pages/ingredient/IngredientSlice';
import { useDispatch } from 'react-redux';
import moment from 'moment';

interface ModalAddIngredientProps {
    show: boolean;
    hide: () => void;
}

function ModalAddIngredient({ show, hide }: ModalAddIngredientProps) {
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(1);

    const handleAddIngredient = async () => {
        const dataSubmit = {
            name,
            image: link,
            description,
            dueDate,
            status: 1,
            createAt: moment(new Date()).format('YYYY-MM-DD'),
        };
        try {
            await axios.post(Url(`ingredient`), { name, image: link, description, dueDate });
            dispatch(addIngredients(dataSubmit));
            hide();
        } catch (error: any) {
            alert(error.response.data.message);
        }
    };

    return (
        <Modal show={show} size="lg" onHide={hide}>
            <Modal.Header closeButton>
                <Modal.Title>Thêm nguyên liệu mới</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3" controlId="1">
                    <Form.Label>Tên nguyên liệu</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Cà chua..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="2">
                    <Form.Label>Link ảnh</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Url..."
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="3">
                    <Form.Label>Mô tả nguyên liệu</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Cà chua tươi ngon..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="4">
                    <Form.Label>Số ngày hết hạn sau khi mua</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type="number"
                            placeholder="1, 2, 3..."
                            value={dueDate}
                            onChange={(e) => setDueDate(parseInt(e.target.value))}
                        />
                        <InputGroup.Text>Ngày</InputGroup.Text>
                    </InputGroup>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>
                    Hủy bỏ
                </Button>
                <Button onClick={handleAddIngredient}>Xác nhận</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalAddIngredient;

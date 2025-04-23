import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
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

    // Edit Ingredient
    const handleEditIngredient = async () => {
        const dataSubmit = {
            name,
            image: link,
            description,
            dueDate,
        };
        try {
            await axios.put(Url(`ingredient/update/${ingredient.id}`), dataSubmit);
            dispatch(
                editIngredient({
                    id: ingredient.id,
                    data: dataSubmit,
                }),
            );
            hide();
        } catch (error: any) {
            alert(error.response.data.message);
        }
    };

    useEffect(() => {
        setName(ingredient.name);
        setLink(ingredient.image);
        setDescription(ingredient.description);
        setDueDate(ingredient.dueDate);
    }, [show]);

    return (
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>
                    Hủy bỏ
                </Button>
                <Button onClick={handleEditIngredient}>Lưu thay đổi</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalEditIngredient;

import axios from 'axios';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import Url from '../../utils/url';
import { useDispatch } from 'react-redux';
import { ingredientsProps, marketProps } from '../../utils/interface/Interface';
import { deleteMarket } from '../../pages/market/MarketSlice';
import { useEffect, useState } from 'react';

interface ModalRemoveFridgeGroupProps {
    show: boolean;
    hide: () => void;
    ingredient: ingredientsProps;
}

function ModalRemoveFridgeGroup({ show, hide, ingredient }: ModalRemoveFridgeGroupProps) {
    const [quantity, setQuantity] = useState(1);
    const handleRemoveFidge = async () => {
        try {
            await axios.put(Url(`fridge/use-ingredient`), {
                id: ingredient.id,
                quantityUsed: quantity,
            });
            await axios.delete(Url(`fridge/ingredients/${ingredient.id}`));
            hide();
        } catch (error: any) {
            alert(error.response.data.message);
        }
    };

    useEffect(() => {
        setQuantity(ingredient?.quantity);
    }, [ingredient]);

    return (
        <Modal show={show} onHide={hide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Lấy <b>{ingredient.ingredient?.name}</b> ra khỏi tủ lạnh{' '}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {' '}
                <Form.Label htmlFor="basic-url">Nhập số lượng cần lấy</Form.Label>
                <InputGroup className="mb-3">
                    <Form.Control
                        id="basic-url"
                        type="number"
                        min={0}
                        max={ingredient.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                    />
                    <InputGroup.Text id="basic-addon3">{ingredient.measure}</InputGroup.Text>
                </InputGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>
                    Hủy bỏ
                </Button>
                <Button onClick={handleRemoveFidge}>Xác nhận</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalRemoveFridgeGroup;

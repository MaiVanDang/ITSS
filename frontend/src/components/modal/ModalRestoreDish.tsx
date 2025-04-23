import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';
import Url from '../../utils/url';
import { dishsProps } from '../../utils/interface/Interface';
import { useDispatch } from 'react-redux';
import { deleteDish, restoreDish } from '../../pages/cook/DishsSlice';

interface ModalRestoreDishProps {
    show: boolean;
    hide: () => void;
    dish: dishsProps;
}

function ModalRestoreDish({ show, hide, dish }: ModalRestoreDishProps) {
    const dispatch = useDispatch();
    // khôi phục món ăn
    const handleRestoreDish = async () => {
        try {
            await axios.put(Url(`dish/${dish.id}`));
            dispatch(restoreDish(dish.id));
            hide();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Modal show={show} onHide={hide}>
            <Modal.Header closeButton>
                <Modal.Title>Khôi phục món ăn</Modal.Title>
            </Modal.Header>
            <Modal.Body>Bạn có chắc chắn muốn khôi phục món {dish.name}?</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>
                    Hủy bỏ
                </Button>
                <Button onClick={handleRestoreDish}>Khôi phục</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalRestoreDish;

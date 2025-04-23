import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';
import Url from '../../utils/url';
import { useDispatch } from 'react-redux';
import { marketProps } from '../../utils/interface/Interface';
import { deleteMarket } from '../../pages/market/MarketSlice';

interface ModalDeleteMarketOrderProps {
    show: boolean;
    hide: () => void;
    order: marketProps;
}

function ModalDeleteMarketOrder({ show, hide, order }: ModalDeleteMarketOrderProps) {
    const dispatch = useDispatch();
    // Xóa đơn đi chợ
    const handleDeleteMarketOrder = async () => {
        try {
            await axios.delete(Url(`market/${order.id}`));
            dispatch(deleteMarket(order.id));
            hide();
        } catch (error: any) {
            alert(error.response.data.message);
        }
    };

    return (
        <Modal show={show} onHide={hide}>
            <Modal.Header closeButton>
                <Modal.Title>Xóa đơn đi chợ</Modal.Title>
            </Modal.Header>
            <Modal.Body>Bạn có chắc chắn muốn xóa đơn {order.code}?</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>
                    Hủy bỏ
                </Button>
                <Button variant="danger" onClick={handleDeleteMarketOrder}>
                    Xóa
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalDeleteMarketOrder;

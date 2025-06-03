import axios from 'axios';
import { Button, Form, InputGroup, Modal, Toast } from 'react-bootstrap';
import Url from '../../utils/url';
import { ingredientsProps } from '../../utils/interface/Interface';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { TOAST_TYPES } from '../../utils/constants';

interface ModalRemoveFridgeGroupProps {
    show: boolean;
    hide: () => void;
    ingredient: ingredientsProps;
    onSuccess: () => void; // Thêm prop callback khi xóa thành công
}

function ModalRemoveFridgeGroup({ show, hide, ingredient, onSuccess }: ModalRemoveFridgeGroupProps) {
    const [deleteInput, setDeleteInput] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [toastType, setToastType] = useState('success');
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const showToastMessage = (type: string, message: string) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
    };

    const handleRemoveFridge = async () => {
        if (!ingredient || !deleteInput) return;

        // Tách số lượng và đơn vị từ chuỗi nhập
        const match = deleteInput.match(/^(\d+\.?\d*)\s*(.*)$/);

        if (!match) {
            toast.error('Định dạng không hợp lệ. Ví dụ: 100 gram');
            return;
        }

        const quantity = parseFloat(match[1]);
        const unit = match[2].trim() || ingredient.measure || 'đơn vị';


        // Chuyển đổi đơn vị đo lường nếu cần
        const convertedMeasure = convertMeasure(unit, quantity);
        // Kiểm tra số lượng sau khi đã chuyển đổi
        if (quantity <= 0) {
            toast.error('Số lượng phải lớn hơn 0');
            return;
        }

        if (typeof convertedMeasure === 'number' && convertedMeasure > ingredient.quantity) {
            showToastMessage(TOAST_TYPES.DANGER, `Không thể sử dụng quá số lượng hiện có: ${ingredient.quantityDouble} ${ingredient.measure || 'đơn vị'}`);
            return;
        }

        setLoading(true);
        try {
            // Gọi API để sử dụng nguyên liệu
            await axios.put(Url(`fridge/use-ingredient`), {
                id: ingredient.id,
                quantityUsed: quantity,
                unit: unit
            });

            toast.success(`Đã sử dụng ${quantity} ${unit} ${ingredient.ingredient.name}`);
            hide();
            onSuccess(); // Gọi callback khi thành công
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể sử dụng nguyên liệu';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const convertMeasure = (measure?: string, quantity?: number) => {
        switch (measure?.toLowerCase()) {
            case 'tấn':
                return (quantity ?? 0) * 1000000;
            case 'tạ':
                return (quantity ?? 0) * 100000;
            case 'yến':
                return (quantity ?? 0) * 10000;
            case 'kg':
                return (quantity ?? 0) * 1000;
            case 'g':
                return (quantity ?? 0);
            case 'lít':
                return (quantity ?? 0) * 1000;
            case 'cốc':
                return (quantity ?? 0) * 240; // Giả sử 1 cốc = 240 ml
            case 'thìa':
                return (quantity ?? 0) * 15; // Giả sử 1 thìa = 15 ml
            case 'muỗng':
                return (quantity ?? 0) * 10; // Giả sử 1 muỗng = 10 ml
            case 'chai':
                return (quantity ?? 0) * 1000; // Giả sử 1 chai = 1000 ml
            default:
                return `${quantity ?? 0} ${measure || 'đơn vị'}`;
        }
    };

    return (
        <>
            {/* Giữ nguyên phần toast và modal gốc */}
            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={4000}
                autohide
                bg={toastType}
                className="position-fixed end-0 top-0 m-3"
                style={{ zIndex: 3000 }}
            >
                <Toast.Header>
                    <strong className="me-auto">
                        {toastType === TOAST_TYPES.SUCCESS ? 'Thành công' :
                            toastType === TOAST_TYPES.DANGER ? 'Cảnh báo' :
                                toastType === TOAST_TYPES.INFO ? 'Thông tin' : 'Thông báo'}
                    </strong>
                </Toast.Header>
                <Toast.Body className={
                    toastType === 'success' ? 'bg-light' :
                        toastType === 'danger' ? 'text-white' :
                            toastType === 'info' ? 'bg-light' : 'text-dark'
                }>
                    {toastMessage}
                </Toast.Body>
            </Toast>

            <Modal show={show} onHide={hide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Sử dụng nguyên liệu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {ingredient && ingredient.ingredient && (
                        <>
                            <p>
                                Bạn muốn sử dụng <strong>{ingredient.ingredient.name}</strong> ?
                            </p>
                            <div className="mb-3">
                                <label htmlFor="deleteInput" className="form-label">
                                    Nhập số lượng và đơn vị cần sử dụng (ví dụ: 100 gram, 1 kg, 2 muỗng canh):
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="deleteInput"
                                    value={deleteInput}
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    placeholder={`Tối đa: ${ingredient.quantityDouble} ${ingredient.measure || 'đơn vị'}`}
                                />
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hide} disabled={loading}>
                        Hủy bỏ
                    </Button>
                    <Button 
                        variant="success"
                        onClick={handleRemoveFridge}
                        disabled={!deleteInput || loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận sử dụng'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalRemoveFridgeGroup;
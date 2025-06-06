// components/modal/ModalCookOption.tsx
import { Modal, Button } from 'react-bootstrap';

interface ModalCookOptionProps {
    show: boolean;
    onHide: () => void;
    onSelect: (option: 'individual' | 'group') => void;
}

function ModalCookOption({ show, onHide, onSelect }: ModalCookOptionProps) {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Chọn kiểu nấu ăn</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <p className="mb-4">Bạn muốn nấu ăn cho cá nhân hay cho nhóm?</p>
                <div className="d-flex justify-content-center gap-3">
                    <Button 
                        variant="primary" 
                        onClick={() => onSelect('individual')}
                        size="lg"
                    >
                        Cá nhân
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={() => onSelect('group')}
                        size="lg"
                    >
                        Nhóm
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default ModalCookOption;
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers, faUtensils } from '@fortawesome/free-solid-svg-icons';

interface CookingModeModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: (isGroupCooking: boolean, groupName?: string) => void;
}

function CookingModeModal({ show, onHide, onConfirm }: CookingModeModalProps) {
    const [cookingMode, setCookingMode] = useState<'personal' | 'group' | null>(null);
    const [groupName, setGroupName] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        setError('');
        
        if (!cookingMode) {
            setError('Vui lòng chọn chế độ nấu ăn');
            return;
        }

        if (cookingMode === 'group') {
            if (!groupName.trim()) {
                setError('Vui lòng nhập tên nhóm');
                return;
            }
            onConfirm(true, groupName.trim());
        } else {
            onConfirm(false);
        }
        
        // Reset form
        setCookingMode(null);
        setGroupName('');
        setError('');
    };

    const handleClose = () => {
        setCookingMode(null);
        setGroupName('');
        setError('');
        onHide();
    };

    return (
        <Modal 
            show={show} 
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered
            size="lg"
        >
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faUtensils} className="me-2 text-primary" />
                    Chọn chế độ nấu ăn
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                <div className="mb-4">
                    <p className="text-muted mb-3">
                        Bạn muốn tìm món ăn để nấu cho ai?
                    </p>

                    {error && (
                        <Alert variant="danger" className="mb-3">
                            {error}
                        </Alert>
                    )}

                    <div className="d-grid gap-2">
                        <div 
                            className={`border rounded p-3 cursor-pointer ${
                                cookingMode === 'personal' ? 'border-primary bg-light' : 'border-secondary'
                            }`}
                            onClick={() => setCookingMode('personal')}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <div className="d-flex align-items-center">
                                <Form.Check
                                    type="radio"
                                    name="cookingMode"
                                    checked={cookingMode === 'personal'}
                                    onChange={() => setCookingMode('personal')}
                                    className="me-3"
                                />
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-2">
                                        <FontAwesomeIcon icon={faUser} className="me-2 text-info" />
                                        <strong>Nấu ăn cá nhân</strong>
                                    </div>
                                    <small className="text-muted">
                                        Tìm món ăn có đủ nguyên liệu trong kho cá nhân của bạn
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div 
                            className={`border rounded p-3 cursor-pointer ${
                                cookingMode === 'group' ? 'border-primary bg-light' : 'border-secondary'
                            }`}
                            onClick={() => setCookingMode('group')}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <div className="d-flex align-items-center">
                                <Form.Check
                                    type="radio"
                                    name="cookingMode"
                                    checked={cookingMode === 'group'}
                                    onChange={() => setCookingMode('group')}
                                    className="me-3"
                                />
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-2">
                                        <FontAwesomeIcon icon={faUsers} className="me-2 text-success" />
                                        <strong>Nấu ăn cho nhóm</strong>
                                    </div>
                                    <small className="text-muted">
                                        Tìm món ăn có đủ nguyên liệu trong kho nhóm
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {cookingMode === 'group' && (
                        <div className="mt-3">
                            <Form.Group>
                                <Form.Label>
                                    <strong>Tên nhóm muốn nấu ăn</strong>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nhập tên nhóm..."
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="mt-2"
                                />
                                <Form.Text className="text-muted">
                                    Hệ thống sẽ tìm món ăn có đủ nguyên liệu trong kho của nhóm này
                                </Form.Text>
                            </Form.Group>
                        </div>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Hủy
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    Xác nhận
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CookingModeModal;
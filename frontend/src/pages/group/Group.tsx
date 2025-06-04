import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faImage } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Url from '../../utils/url';
import { userInfo } from '../../utils/userInfo';
import { groupsProps } from '../../utils/interface/Interface';
import CardGroup from '../../components/card-group/CardGroup';
import { Button, Form, Modal, Card, Alert, Row, Col } from 'react-bootstrap';
import './Group.css'; // Tạo file CSS mới cho Group

function Group() {
    const [listGroup, setListGroup] = useState<groupsProps[]>([]);
    const [showModalAddGroup, setShowModalAddGroup] = useState(false);
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApi = async () => {
            try {
                const results = await axios.get(Url(`user/groups/${userInfo?.id}`));
                setListGroup(results.data);
                setError('');
            } catch (error: any) {
                setError(error.response?.data?.message || "Đã xảy ra lỗi khi tải danh sách nhóm");
                console.error(error);
            }
        };
        fetchApi();
    }, [showModalAddGroup]);

    const handleAddGroup = async () => {
        if (!name.trim()) {
            setError('Vui lòng nhập tên nhóm');
            return;
        }

        try {
            await axios.post(Url(`group`), {
                name,
                leader: userInfo,
                image: image || 'https://i.pinimg.com/736x/3f/1c/b4/3f1cb4bc81fa8004a67103eb19181739.jpg', // Ảnh mặc định nếu không có
            });
            setShowModalAddGroup(false);
            setName('');
            setImage('');
            setError('');
        } catch (error: any) {
            setError(error.response?.data?.message || "Đã xảy ra lỗi khi tạo nhóm");
            console.error(error);
        }
    };

    return (
        <div className="group-container">
            {/* Header */}
            <div className="group-header d-flex justify-content-between align-items-center">
                <h2>
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Nhóm của tôi
                </h2>
                <Button 
                    variant="primary" 
                    onClick={() => setShowModalAddGroup(true)}
                    className="action-btn"
                >
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    Thêm nhóm
                </Button>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="danger" className="group-alert">
                    {error}
                </Alert>
            )}

            {/* Empty State */}
            {listGroup.length === 0 && !error && (
                <div className="empty-state">
                    <FontAwesomeIcon icon={faUsers} className="empty-icon" />
                    <h5>Bạn chưa có nhóm nào</h5>
                    <p>Hãy tạo nhóm mới để bắt đầu quản lý cùng bạn bè!</p>
                    <Button 
                        variant="primary" 
                        onClick={() => setShowModalAddGroup(true)}
                        className="action-btn"
                    >
                        <FontAwesomeIcon icon={faPlus} className="me-1" />
                        Tạo nhóm mới
                    </Button>
                </div>
            )}

            {/* Groups Grid */}
            {listGroup.length > 0 && (
                <Row className="groups-grid">
                    {listGroup.map((group, index) => (
                        <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                            <CardGroup group={group} />
                        </Col>
                    ))}
                </Row>
            )}

            {/* Add Group Modal */}
            <Modal show={showModalAddGroup} onHide={() => setShowModalAddGroup(false)} centered>
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Tạo nhóm mới
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="groupName">
                            <Form.Label>
                                <FontAwesomeIcon icon={faUsers} className="me-2" />
                                Tên nhóm
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên nhóm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="groupImage">
                            <Form.Label>
                                <FontAwesomeIcon icon={faImage} className="me-2" />
                                Link ảnh nhóm (tùy chọn)
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Dán link ảnh nhóm"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalAddGroup(false)}>
                        Hủy bỏ
                    </Button>
                    <Button variant="primary" onClick={handleAddGroup}>
                        Tạo nhóm
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Group;
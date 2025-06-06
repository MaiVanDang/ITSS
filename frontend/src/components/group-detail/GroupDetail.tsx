import {
    faArrowLeft,
    faPlus,
    faRightFromBracket,
    faXmark,
    faUsers,
    faShoppingCart,
    faSnowflake,
    faGear
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Url from '../../utils/url';
import {
    fridgeProps,
    groupsProps,
    ingredientsProps,
    marketProps,
    userInfoProps,
} from '../../utils/interface/Interface';
import { Badge, Button, Form, Modal, Tab, Table, Tabs, Toast, Card, Alert, Row, Col } from 'react-bootstrap';
import { userInfo } from '../../utils/userInfo';
import ModalDetailMarketOrder from '../modal/ModalDetailMarketOrder';
import ModalAddMemberToGroup from '../modal/ModalAddMemberToGroup';
import ModalRemoveFridgeGroup from '../modal/ModalRemoveFridgeGroup';
import { formatDate } from '../../utils/dateHelpers';
import { ExpiryStatusBadge } from '../shared/ExpiryStatusBadge';
import { getExpiryStatus } from '../../utils/ingredientHelpers';
import { toast } from 'react-toastify';
import './GroupDetail.css'; // Tạo file CSS mới

function GroupDetail() {
    const param = useParams();
    const navigate = useNavigate();

    const [showModalDetailMarketOrder, setShowModalDetailMarketOrder] = useState(false);
    const [currentIdMarketOrder, setCurrentIdMarketOrder] = useState(0);
    const [showModalDeleteMember, setShowModalDeleteMember] = useState(false);
    const [showModalAddMember, setShowModalAddMember] = useState(false);
    const [currentMember, setCurrentMember] = useState<userInfoProps>({} as userInfoProps);
    const [showToast, setShowToast] = useState(false);
    const [fridge, setFridge] = useState<fridgeProps>({} as fridgeProps);
    const [currentIngredient, setCurrentIngredient] = useState<ingredientsProps>(
        {} as ingredientsProps,
    );
    const [showModalRemoveFridgeGroup, setShowModalRemoveFridgeGroup] = useState(false);

    const [group, setGroup] = useState<groupsProps>({} as groupsProps);
    const [marketOrder, setMarketOrder] = useState<marketProps[]>([]);

    const [editNameGroup, setEditNameGroup] = useState('');
    const [editImageGroup, setEditImageGroup] = useState('');
    const [showModalDeleteGroup, setShowModalDeleteGroup] = useState(false);

    const [reload, setReload] = useState(2);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApiGroupDetail = async () => {
            try {
                const results = await axios.get(Url(`group/${param.id}`));
                setGroup(results.data);
            } catch (error: any) {
                alert(error.response.data.message);
                console.log(error);
            }
        };

        const fetchApiGroupMkOrder = async () => {
            try {
                const results = await axios.get(Url(`market/group/${param.id}`));
                setMarketOrder(results.data);
            } catch (error: any) {
                alert(error.response.data.message);
                console.log(error);
            }
        };

        const fetchApiGroupFridge = async () => {
            try {
                const results = await axios.get(Url(`fridge/group/${param.id}`));
                console.log(results.data);
                setFridge(results.data);
            } catch (error: any) {
                alert(error.response.data.message);
                console.log(error);
            }
        };

        fetchApiGroupDetail();
        fetchApiGroupMkOrder();
        fetchApiGroupFridge();
    }, [
        reload,
        param,
        showToast,
        showModalDetailMarketOrder,
        showModalAddMember,
    ]);

    const handleDeleteMember = async (memberId: number) => {
        try {
            const groupId = parseInt(param.id!);
            const result = await axios.delete(Url(`group/member`), {
                data: { groupId, memberId },
            });
            setShowModalDeleteMember(false);
            if (result.data === 'success') {
                setShowToast(true);
            }
        } catch (error: any) {
            alert(error.response.data.message);
        }
    };

    const handleDeleteGroup = async () => {
        try {
            await axios.delete(Url(`group/${group.id}`));
            navigate('/group');
        } catch (error: any) {
            alert(error.response.data.message);
            console.log(error);
        }
    };

    const handleEditNameGroup = async () => {
        try {
            await axios.put(Url(`group`), {
                id: group.id,
                name: editNameGroup,
                image: '',
            });
            setReload(Math.random());
        } catch (error: any) {
            alert(error.response.data.message);
            console.log(error);
        }
    };

    const handleEditImage = async () => {
        try {
            await axios.put(Url(`group`), {
                id: group.id,
                name: '',
                image: editImageGroup,
            });
            setReload(Math.random());
        } catch (error: any) {
            alert(error.response.data.message);
            console.log(error);
        }
    };

    const handleSuccess = () => {
        const fetchApiGroupFridge = async () => {
            try {
                const results = await axios.get(Url(`fridge/group/${param.id}`));
                setFridge(results.data);
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi tải dữ liệu.");
            }
        };
        fetchApiGroupFridge();
    };

    return (
        <div className="group-detail-container">
            {/* Header */}
            <div className="group-detail-header">
                <Link to="/group" className="back-button">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Quay lại
                </Link>
                <div className="d-flex justify-content-between align-items-center">
                    <h2>
                        <FontAwesomeIcon icon={faUsers} className="me-2" />
                        {group.name}
                    </h2>
                    <div className="group-image-container">
                        <img
                            src={group.image || 'https://via.placeholder.com/150'}
                            alt={group.name}
                            className="group-image"
                        />
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="danger" className="group-alert">
                    {error}
                </Alert>
            )}

            {/* Tabs */}
            <Tabs defaultActiveKey="market" id="group-detail-tabs" className="custom-tabs">
                {/* Tab Đơn đi chợ */}
                <Tab
                    eventKey="market"
                    title={
                        <>
                            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                            Đơn đi chợ
                        </>
                    }
                >
                    <Card className="main-content-card">
                        <Card.Body>
                            {marketOrder.length === 0 ? (
                                <div className="empty-state">
                                    <FontAwesomeIcon icon={faShoppingCart} className="empty-icon" />
                                    <h5>Nhóm chưa có đơn đi chợ nào</h5>
                                    <p>Hãy tạo đơn đi chợ mới để bắt đầu mua sắm!</p>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Mã đơn</th>
                                                <th>Người tạo</th>
                                                <th>Trạng thái</th>
                                                <th>Ngày tạo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {marketOrder.map((order, index) => (
                                                <tr
                                                    key={index}
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        setCurrentIdMarketOrder(order.id);
                                                        setShowModalDetailMarketOrder(true);
                                                    }}
                                                >
                                                    <td>{index + 1}</td>
                                                    <td>{order.code}</td>
                                                    <td>{order.user.name}</td>
                                                    <td>
                                                        {order.status === 1 ? (
                                                            <Badge bg="success">Hoàn thành</Badge>
                                                        ) : (
                                                            <Badge bg="warning">Chưa xong</Badge>
                                                        )}
                                                    </td>
                                                    <td>{formatDate(order.createAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    <ModalDetailMarketOrder
                        show={showModalDetailMarketOrder}
                        hide={() => setShowModalDetailMarketOrder(false)}
                        indexOrder={currentIdMarketOrder}
                        leaderId={group.leader?.id}
                        listMember={group.groupMembers}
                        fridgeId={fridge.id}
                    />
                </Tab>

                {/* Tab Thành viên */}
                <Tab
                    eventKey="member"
                    title={
                        <>
                            <FontAwesomeIcon icon={faUsers} className="me-2" />
                            Thành viên
                        </>
                    }
                >
                    <Card className="main-content-card">
                        <Card.Body>
                            <div className="members-list">
                                {group.groupMembers?.map((member, index) => (
                                    <div key={index} className="member-item">
                                        <div className="member-avatar">
                                            <img src={member.avatar} alt={member.name} />
                                        </div>
                                        <div className="member-info">
                                            <div className="member-name">
                                                {member.name}
                                                {member.id === userInfo?.id && (
                                                    <span className="badge-you">Bạn</span>
                                                )}
                                            </div>
                                            <div className="member-role">
                                                {member.id === group.leader?.id ? 'Quản trị viên' : 'Thành viên'}
                                            </div>
                                        </div>
                                        {group.leader?.id === userInfo?.id && member.id !== userInfo?.id && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="action-btn"
                                                onClick={() => {
                                                    setCurrentMember(member);
                                                    setShowModalDeleteMember(true);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faXmark} />
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                {userInfo?.id === group.leader?.id && (
                                    <Button
                                        variant="primary"
                                        className="add-member-btn"
                                        onClick={() => setShowModalAddMember(true)}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        Thêm thành viên
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Modal xóa thành viên */}
                    <Modal show={showModalDeleteMember} onHide={() => setShowModalDeleteMember(false)} centered>
                        <Modal.Header closeButton className="modal-header-danger">
                            <Modal.Title>Xóa thành viên</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Bạn có chắc chắn muốn xóa <strong>{currentMember.name}</strong> khỏi nhóm không?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModalDeleteMember(false)}>
                                Hủy bỏ
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    handleDeleteMember(currentMember.id);
                                    setShowModalDeleteMember(false);
                                }}
                            >
                                Xác nhận xóa
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Modal thêm thành viên */}
                    <ModalAddMemberToGroup
                        show={showModalAddMember}
                        hide={() => setShowModalAddMember(false)}
                        groupId={parseInt(param.id!)}
                    />

                    {/* Toast thông báo */}
                    <Toast
                        onClose={() => setShowToast(false)}
                        show={showToast}
                        delay={3000}
                        autohide
                        className="toast-success"
                    >
                        <Toast.Header>
                            <strong className="me-auto">Thành công</strong>
                        </Toast.Header>
                        <Toast.Body>Đã xóa thành viên khỏi nhóm</Toast.Body>
                    </Toast>
                </Tab>

                {/* Tab Tủ lạnh */}
                <Tab
                    eventKey="fridge"
                    title={
                        <>
                            <FontAwesomeIcon icon={faSnowflake} className="me-2" />
                            Tủ lạnh
                        </>
                    }
                >
                    <Card className="main-content-card">
                        <Card.Body>
                            {fridge.ingredients?.length === 0 ? (
                                <div className="empty-state">
                                    <FontAwesomeIcon icon={faSnowflake} className="empty-icon" />
                                    <h5>Tủ lạnh nhóm trống</h5>
                                    <p>Hãy thêm nguyên liệu từ đơn đi chợ hoặc kho lưu trữ!</p>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Ảnh</th>
                                                <th>Tên thực phẩm</th>
                                                <th>Số lượng</th>
                                                <th>Đơn vị</th>
                                                <th>Loại</th>
                                                <th>Người mua</th>
                                                <th>Ngày thêm</th>
                                                <th>Ngày hết hạn</th>
                                                <th>Trạng thái</th>
                                                <th>Sử dụng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fridge.ingredients?.map((item, index) => {
                                                const { status, style, tooltipText } = getExpiryStatus(item.exprided);
                                                const getIngredientType = (status: string) => {
                                                    switch (status) {
                                                        case 'INGREDIENT':
                                                            return <Badge pill bg="primary">Nguyên liệu</Badge>;
                                                        case 'FRESH_INGREDIENT':
                                                            return <Badge pill bg="success">Nguyên liệu tươi</Badge>;
                                                        case 'DRY_INGREDIENT':
                                                            return <Badge pill bg="secondary">Nguyên liệu khô</Badge>;
                                                        case 'SEASONING':
                                                            return <Badge pill bg="warning">Gia vị nêm</Badge>;
                                                        default:
                                                            return <Badge pill bg="light">Không xác định</Badge>;
                                                    }
                                                };
                                                return (
                                                    <tr key={index} style={style} title={tooltipText}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <img
                                                                src={item.ingredient.image}
                                                                alt={item.ingredient.name}
                                                                className="ingredient-image"
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="fw-bold text-dark">{item.ingredient.name}</div>
                                                            {status === 'Đã hết hạn' && (
                                                                <small className="text-danger fw-medium">
                                                                    Đã hết hạn - Không nên sử dụng
                                                                </small>
                                                            )}
                                                        </td>
                                                        <td>{item.quantityDouble}</td>
                                                        <td>{item.measure}</td>
                                                        <td className="text-center">{getIngredientType(item.ingredient.ingredientStatus)}</td>
                                                        <td className="text-center"><Badge bg="info">{item.userBuyName}</Badge></td>
                                                        <td>{formatDate(item.createAt)}</td>
                                                        <td>{formatDate(item.exprided)}</td>
                                                        <td>
                                                            <ExpiryStatusBadge status={status} />
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                className="action-btn"
                                                                title="Sử dụng / loại bỏ khỏi tủ"
                                                                onClick={() => {
                                                                    if (status === 'Đã hết hạn') {
                                                                        toast.warn("Nguyên liệu đã hết hạn. Không nên sử dụng!");
                                                                        return;
                                                                    }
                                                                    setCurrentIngredient(item);
                                                                    setShowModalRemoveFridgeGroup(true);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faRightFromBracket} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {currentIngredient && (
                        <ModalRemoveFridgeGroup
                            show={showModalRemoveFridgeGroup}
                            hide={() => setShowModalRemoveFridgeGroup(false)}
                            ingredient={currentIngredient}
                            onSuccess={handleSuccess}
                        />
                    )}
                </Tab>

                {/* Tab Cài đặt */}
                {userInfo?.id === group.leader?.id && (
                    <Tab
                        eventKey="settings"
                        title={
                            <>
                                <FontAwesomeIcon icon={faGear} className="me-2" />
                                Cài đặt
                            </>
                        }
                    >
                        <Card className="main-content-card">
                            <Card.Body>
                                <h5 className="mb-4">Thông tin nhóm</h5>
                                <Form>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Tên nhóm</Form.Label>
                                        <div className="d-flex">
                                            <Form.Control
                                                type="text"
                                                value={editNameGroup}
                                                onChange={(e) => setEditNameGroup(e.target.value)}
                                                placeholder="Nhập tên nhóm mới"
                                            />
                                            <Button
                                                variant="primary"
                                                className="ms-2"
                                                onClick={handleEditNameGroup}
                                            >
                                                Lưu
                                            </Button>
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Ảnh nhóm</Form.Label>
                                        <div className="d-flex">
                                            <Form.Control
                                                type="text"
                                                value={editImageGroup}
                                                onChange={(e) => setEditImageGroup(e.target.value)}
                                                placeholder="Nhập URL ảnh mới"
                                            />
                                            <Button
                                                variant="primary"
                                                className="ms-2"
                                                onClick={handleEditImage}
                                            >
                                                Lưu
                                            </Button>
                                        </div>
                                    </Form.Group>

                                    <div className="danger-zone mt-5">
                                        <h5 className="text-danger">Khu vực nguy hiểm</h5>
                                        <p className="text-muted">Các thao tác này không thể hoàn tác</p>
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => setShowModalDeleteGroup(true)}
                                        >
                                            Xóa nhóm
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Modal xóa nhóm */}
                        <Modal show={showModalDeleteGroup} onHide={() => setShowModalDeleteGroup(false)} centered>
                            <Modal.Header closeButton className="modal-header-danger">
                                <Modal.Title>Xóa nhóm</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Bạn có chắc chắn muốn xóa nhóm <strong>{group.name}</strong>? Hành động này không thể hoàn tác.
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowModalDeleteGroup(false)}>
                                    Hủy bỏ
                                </Button>
                                <Button variant="danger" onClick={handleDeleteGroup}>
                                    Xác nhận xóa
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Tab>
                )}
            </Tabs>
        </div>
    );
}

export default GroupDetail;
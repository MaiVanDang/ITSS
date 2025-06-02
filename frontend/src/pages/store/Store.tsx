import { faShoppingCart, faCheckCircle, faRightFromBracket, faChartPie, faExclamationTriangle, faClock, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Table, Badge, Button, Toast, Modal, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import Url from '../../utils/url';
import { userInfo } from '../../utils/userInfo';
import { StoreProps } from '../../utils/interface/Interface';
import './Store.css';

// Shared imports
import { TOAST_TYPES } from '../../utils/constants';
import { getExpiryStatus } from '../../utils/ingredientHelpers';
import { validateForFridgeAddition } from '../../utils/validationHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { ExpiryStatusBadge } from '../../components/shared/ExpiryStatusBadge';
import { toast } from 'react-toastify';

function Store() {
    const [purchasedItems, setPurchasedItems] = useState<StoreProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    // Modal & quantity state
    const [selectedItem, setSelectedItem] = useState<StoreProps | null>(null);
    const [deleteQuantity, setDeleteQuantity] = useState<number>(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchPurchasedItems();
    }, []);

    // Hàm tính toán thống kê
    const calculateStatistics = () => {
        const stats = {
            expiryStatus: {
                expired: 0,
                aboutToExpire: 0,
                fresh: 0
            },
            ingredientType: {
                dry: 0,
                seasoning: 0,
                fresh: 0,
                other: 0
            }
        };

        purchasedItems.forEach(item => {
            // Thống kê theo trạng thái hạn sử dụng
            const { status } = getExpiryStatus(item.expridedAt);
            if (status === 'Đã hết hạn') {
                stats.expiryStatus.expired++;
            } else if (status === 'Sắp hết hạn') {
                stats.expiryStatus.aboutToExpire++;
            } else {
                stats.expiryStatus.fresh++;
            }

            // Thống kê theo loại nguyên liệu
            switch (item.ingredientStatus) {
                case 'DRY_INGREDIENT':
                    stats.ingredientType.dry++;
                    break;
                case 'SEASONING':
                    stats.ingredientType.seasoning++;
                    break;
                case 'FRESH_INGREDIENT':
                    stats.ingredientType.fresh++;
                    break;
                case 'INGREDIENT':
                    stats.ingredientType.other++;
                    break;
                default:
                    stats.ingredientType.other++;
            }
        });

        return stats;
    };

    const stats = calculateStatistics();

    const fetchPurchasedItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get(Url(`market/purchased-items/${userInfo?.id}`));
            if (Array.isArray(response.data)) {
                setPurchasedItems(response.data);
            } else {
                setPurchasedItems([]);
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                setPurchasedItems([]);
                showToastMessage('info', 'Chưa có nguyên liệu nào được lưu trữ');
            } else {
                showToastMessage('danger', 'Không thể tải danh sách thực phẩm đã mua');
            }
        } finally {
            setLoading(false);
        }
    };

    const isExpired = (expirationDate?: string) => {
        if (!expirationDate) return false;
        const today = new Date();
        const expDate = new Date(expirationDate);
        today.setHours(0, 0, 0, 0);
        expDate.setHours(0, 0, 0, 0);
        return expDate < today;
    };

    const showToastMessage = (type: string, message: string) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
    };

    const handleShowDeleteModal = (item: StoreProps) => {
        setSelectedItem(item);
        setDeleteQuantity(item.quantity);
        setShowDeleteModal(true);
    };

    const removeIngredientFromStore = async () => {
        if (!selectedItem) return;

        try {
            await axios.delete(Url(`market/purchased-items/${selectedItem.storeId}/${deleteQuantity}`));
            showToastMessage(TOAST_TYPES.SUCCESS, 'Đã loại bỏ thực phẩm khỏi kho lưu trữ');
            setShowDeleteModal(false);
            fetchPurchasedItems();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể loại bỏ thực phẩm khỏi kho lưu trữ';
            showToastMessage(TOAST_TYPES.DANGER, errorMessage);
        }
    };

    const handleAddFromStoreToFridge = async (item: StoreProps) => {
        const validation = validateForFridgeAddition(item, userInfo?.fridgeId?.toString());

        if (!validation.isValid) {
            const toastType = validation.message?.includes('hết hạn')
                ? TOAST_TYPES.DANGER
                : TOAST_TYPES.WARNING;
            showToastMessage(toastType, validation.message!);
            return;
        }

        try {
            const requestData = {
                fridgeId: userInfo?.fridgeId ?? '',
                ingredientsId: item.ingredientsId,
                quantity: item.quantity,
                measure: item.measure,
                exprided: item.expridedAt,
                buyAt: item.buyAt,
                ingredientName: item.ingredientName,
                ingredientImage: item.ingredientImage,
                ingredientStatus: item.ingredientStatus,
            };

            await axios.post(Url(`fridge/store/ingredients`), requestData);

            showToastMessage(TOAST_TYPES.SUCCESS, `Đã thêm ${item.ingredientName} vào tủ lạnh!`);
            fetchPurchasedItems();
        } catch (error: any) {
            const errorMessage = (() => {
                switch (error.response?.status) {
                    case 400: return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
                    case 404: return 'Không tìm thấy tủ lạnh hoặc nguyên liệu.';
                    default: return error.response?.data?.message || 'Không thể thêm vào tủ lạnh';
                }
            })();

            showToastMessage(TOAST_TYPES.DANGER, errorMessage);
        }
    };

    const renderIngredientType = (ingredientStatus?: string) => {
        switch (ingredientStatus) {
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

    if (loading) {
        return (
            <div className="text-center p-4">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-2">Đang tải danh sách thực phẩm đã lưu trữ...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>
                    <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                    Kho thực phẩm đã lưu trữ
                </h2>
                <Button variant="outline-primary" onClick={fetchPurchasedItems}>
                    Làm mới
                </Button>
            </div>

            {/* Khu vực thống kê */}
            {purchasedItems.length > 0 && (
                <div className="mb-4">
                    <h4 className="mb-3">
                        <FontAwesomeIcon icon={faChartPie} className="me-2" />
                        Thống kê kho thực phẩm
                    </h4>

                    <Row className="mb-4">
                        <Col md={6}>
                            <h5 className="mb-3">Theo trạng thái hạn sử dụng</h5>
                            <Row>
                                <Col sm={4}>
                                    <Card className="text-center h-100">
                                        <Card.Body>
                                            <Card.Title>
                                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger me-2" />
                                                Hết hạn
                                            </Card.Title>
                                            <Card.Text className="display-6">
                                                {stats.expiryStatus.expired}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm={4}>
                                    <Card className="text-center h-100">
                                        <Card.Body>
                                            <Card.Title>
                                                <FontAwesomeIcon icon={faClock} className="text-warning me-2" />
                                                Sắp hết hạn
                                            </Card.Title>
                                            <Card.Text className="display-6">
                                                {stats.expiryStatus.aboutToExpire}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm={4}>
                                    <Card className="text-center h-100">
                                        <Card.Body>
                                            <Card.Title>
                                                <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                                                Còn hạn
                                            </Card.Title>
                                            <Card.Text className="display-6">
                                                {stats.expiryStatus.fresh}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>

                        <Col md={6}>
                            <h5 className="mb-3">Theo loại nguyên liệu</h5>
                            <Row>
                                <Col sm={3}>
                                    <Card className="text-center h-100">
                                        <Card.Body>
                                            <Card.Title>
                                                <Badge bg="secondary">Khô</Badge>
                                            </Card.Title>
                                            <Card.Text className="display-6">
                                                {stats.ingredientType.dry}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm={3}>
                                    <Card className="text-center h-100">
                                        <Card.Body>
                                            <Card.Title>
                                                <Badge bg="warning">Gia vị</Badge>
                                            </Card.Title>
                                            <Card.Text className="display-6">
                                                {stats.ingredientType.seasoning}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm={3}>
                                    <Card className="text-center h-100">
                                        <Card.Body>
                                            <Card.Title>
                                                <Badge bg="success">Tươi</Badge>
                                            </Card.Title>
                                            <Card.Text className="display-6">
                                                {stats.ingredientType.fresh}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm={3}>
                                    <Card className="text-center h-100">
                                        <Card.Body>
                                            <Card.Title>
                                                <Badge bg="primary">Khác</Badge>
                                            </Card.Title>
                                            <Card.Text className="display-6">
                                                {stats.ingredientType.other}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            )}

            {!userInfo?.fridgeId && (
                <div className="alert alert-warning">
                    <strong>Cảnh báo:</strong> Không tìm thấy thông tin tủ lạnh.
                    Vui lòng đăng nhập lại để sử dụng chức năng thêm vào tủ lạnh.
                </div>
            )}

            {purchasedItems.length === 0 ? (
                <div className="text-center p-4">
                    <FontAwesomeIcon icon={faShoppingCart} size="3x" className="text-muted mb-3" />
                    <h5 className="text-muted">Chưa có thực phẩm nào được lưu trữ</h5>
                    <p className="text-muted">
                        Hãy đi mua sắm và đánh dấu "lưu trữ" để thấy thực phẩm ở đây!
                    </p>
                </div>
            ) : (
                <Table hover bordered responsive>
                    <thead className="text-center sticky-top table-dark">
                        <tr>
                            <th>STT</th>
                            <th>Ảnh</th>
                            <th>Tên thực phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn vị tính</th>
                            <th>Loại</th>
                            <th>Người mua</th>
                            <th>Ngày mua</th>
                            <th>Ngày hết hạn</th>
                            <th>Trạng thái</th>
                            <th>Thêm vào tủ lạnh</th>
                            <th>Sử dụng</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {purchasedItems.map((item, index) => {
                            const { status, style, tooltipText } = getExpiryStatus(item.expridedAt);

                            return (
                                <tr key={`${item.id}-${index}`} style={style} title={tooltipText}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <img
                                            src={item.ingredientImage}
                                            alt="ảnh"
                                            style={{ height: '3rem', width: '3rem' }}
                                        />
                                    </td>
                                    <td><strong>{item.ingredientName}</strong></td>
                                    <td>{item.quantity}</td>
                                    <td>{item.measure || 'Không rõ'}</td>
                                    <td>{renderIngredientType(item.ingredientStatus)}</td>
                                    <td><Badge bg="info">{item.userName}</Badge></td>
                                    <td>{formatDate(item.buyAt)}</td>
                                    <td>{formatDate(item.expridedAt)}</td>
                                    <td><ExpiryStatusBadge status={status} /></td>
                                    <td>
                                        <Button
                                            variant={
                                                isExpired(item.expridedAt) ? "outline-danger" :
                                                    !userInfo?.fridgeId ? "outline-secondary" :
                                                        "outline-success"
                                            }
                                            size="sm"
                                            onClick={() => handleAddFromStoreToFridge(item)}
                                            disabled={isExpired(item.expridedAt) || !userInfo?.fridgeId}
                                            title={
                                                isExpired(item.expridedAt)
                                                    ? "Không thể thêm thực phẩm hết hạn vào tủ lạnh"
                                                    : !userInfo?.fridgeId
                                                        ? "Không tìm thấy thông tin tủ lạnh"
                                                        : "Thêm vào tủ lạnh"
                                            }
                                        >
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                        </Button>
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            title="Sử dụng / loại bỏ khỏi tủ"
                                            onClick={() => {
                                                const { status } = getExpiryStatus(item.expridedAt);
                                                if (status === 'Đã hết hạn') {
                                                    toast.warn("Nguyên liệu đã hết hạn. Vui lòng không sử dụng để đảm bảo sức khỏe.");
                                                    return;
                                                }
                                                handleShowDeleteModal(item);
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
            )}

            {/* Toast thông báo */}
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

            {/* Modal xóa số lượng */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Sử dụng nguyên liệu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedItem && (
                        <>
                            <p>
                                Bạn muốn sử dụng <strong>{selectedItem.ingredientName}</strong> ?
                            </p>
                            <div className="mb-3">
                                <label htmlFor="deleteQuantity" className="form-label">
                                    Nhập số lượng cần sử dụng (tối đa: {selectedItem.quantity}):
                                </label>
                                <input
                                    type="number"
                                    id="deleteQuantity"
                                    className="form-control"
                                    value={deleteQuantity}
                                    min={1}
                                    max={selectedItem.quantity}
                                    onChange={(e) => setDeleteQuantity(Number(e.target.value))}
                                />
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="danger"
                        onClick={removeIngredientFromStore}
                        disabled={deleteQuantity <= 0 || deleteQuantity > (selectedItem?.quantity ?? 0)}
                    >
                        Xác nhận sử dụng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Store;

import { faShoppingCart, faCheckCircle, faRightFromBracket, faChartPie, faClock, faExclamationTriangle, faCheck, faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Table, Badge, Button, Toast, Modal, Card, Row, Col, Alert } from 'react-bootstrap';
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

type FilterType = {
    expiryStatus?: 'expired' | 'aboutToExpire' | 'fresh';
    ingredientType?: 'dry' | 'seasoning' | 'fresh' | 'other';
};

function Store() {
    // Giữ nguyên toàn bộ state gốc
    const [purchasedItems, setPurchasedItems] = useState<StoreProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [selectedItem, setSelectedItem] = useState<StoreProps | null>(null);
    const [deleteQuantity, setDeleteQuantity] = useState<number>(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Thêm state mới cho filter
    const [activeFilter, setActiveFilter] = useState<FilterType>({});
    const [filteredItems, setFilteredItems] = useState<StoreProps[]>([]);

    useEffect(() => {
        fetchPurchasedItems();
    }, []);

    // Thêm useEffect để áp dụng filter
    useEffect(() => {
        applyFilters();
    }, [purchasedItems, activeFilter]);

    // Giữ nguyên hàm fetchPurchasedItems gốc
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

    // Thêm hàm applyFilters mới
    const applyFilters = () => {
        let result = [...purchasedItems];

        if (activeFilter.expiryStatus) {
            result = result.filter(item => {
                const { status } = getExpiryStatus(item.expridedAt);
                switch (activeFilter.expiryStatus) {
                    case 'expired': return status === 'Đã hết hạn';
                    case 'aboutToExpire': return status === 'Sắp hết hạn';
                    case 'fresh': return status === 'Còn hạn';
                    default: return true;
                }
            });
        }

        if (activeFilter.ingredientType) {
            result = result.filter(item => {
                switch (activeFilter.ingredientType) {
                    case 'dry': return item.ingredientStatus === 'DRY_INGREDIENT';
                    case 'seasoning': return item.ingredientStatus === 'SEASONING';
                    case 'fresh': return item.ingredientStatus === 'FRESH_INGREDIENT';
                    case 'other': return item.ingredientStatus === 'INGREDIENT';
                    default: return true;
                }
            });
        }

        setFilteredItems(result);
    };

    // Thêm hàm xử lý filter
    const handleFilterClick = (filter: FilterType) => {
        if (
            (filter.expiryStatus && activeFilter.expiryStatus === filter.expiryStatus) ||
            (filter.ingredientType && activeFilter.ingredientType === filter.ingredientType)
        ) {
            setActiveFilter({});
        } else {
            setActiveFilter(filter);
        }
    };

    const clearAllFilters = () => {
        setActiveFilter({});
    };

    // Giữ nguyên các hàm gốc
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

    // Thêm hàm tính toán thống kê
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
            const { status } = getExpiryStatus(item.expridedAt);
            if (status === 'Đã hết hạn') {
                stats.expiryStatus.expired++;
            } else if (status === 'Sắp hết hạn') {
                stats.expiryStatus.aboutToExpire++;
            } else {
                stats.expiryStatus.fresh++;
            }

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

    // Sử dụng filteredItems thay vì purchasedItems trong render
    const displayItems = filteredItems.length > 0 || Object.keys(activeFilter).length > 0 ? filteredItems : purchasedItems;

    return (
        <div className="store-container">
            {/* Phần Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                    Kho thực phẩm đã lưu trữ
                </h2>
                <div>
                    {Object.keys(activeFilter).length > 0 && (
                        <Button
                            variant="outline-secondary"
                            className="me-2"
                            onClick={clearAllFilters}
                            size="sm"
                        >
                            Xóa bộ lọc
                        </Button>
                    )}
                    <Button variant="outline-primary" onClick={fetchPurchasedItems}>
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Khu vực Thống kê - được tách biệt bằng Card */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <h4 className="mb-4">
                        <FontAwesomeIcon icon={faChartPie} className="me-2 text-primary" />
                        Thống kê kho thực phẩm
                    </h4>

                    {/* Phân chia rõ 2 cột thống kê */}
                    <Row>
                        {/* Cột thống kê trạng thái hạn sử dụng */}
                        <Col md={6} className="mb-3 mb-md-0">
                            <div className="border-end pe-md-3">
                                <h5 className="mb-3 text-center">Theo trạng thái hạn sử dụng</h5>
                                <Row>
                                    {[
                                        { type: 'expired', icon: faExclamationTriangle, color: 'danger', label: 'Hết hạn' },
                                        { type: 'aboutToExpire', icon: faClock, color: 'warning', label: 'Sắp hết hạn' },
                                        { type: 'fresh', icon: faCheck, color: 'success', label: 'Còn hạn' }
                                    ].map((item) => (
                                        <Col sm={4} key={item.type}>
                                            <Card
                                                className={`text-center h-100 cursor-pointer ${activeFilter.expiryStatus === item.type ? 'border-primary' : ''}`}
                                                onClick={() => handleFilterClick({ expiryStatus: item.type as any })}
                                            >
                                                <Card.Body>
                                                    <Card.Title>
                                                        <FontAwesomeIcon
                                                            icon={activeFilter.expiryStatus === item.type ? faFilter : item.icon}
                                                            className={`me-2 ${activeFilter.expiryStatus === item.type ? 'text-primary' : `text-${item.color}`}`}
                                                        />
                                                        {item.label}
                                                    </Card.Title>
                                                    <Card.Text className="display-6">
                                                        {stats.expiryStatus[item.type as keyof typeof stats.expiryStatus]}
                                                    </Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </Col>

                        {/* Cột thống kê loại nguyên liệu */}
                        <Col md={6}>
                            <h5 className="mb-3 text-center">Theo loại nguyên liệu</h5>
                            <Row>
                                {[
                                    { type: 'dry', color: 'secondary', label: 'Khô' },
                                    { type: 'seasoning', color: 'warning', label: 'Gia vị' },
                                    { type: 'fresh', color: 'success', label: 'Tươi' },
                                    { type: 'other', color: 'primary', label: 'Khác' }
                                ].map((item) => (
                                    <Col sm={3} key={item.type}>
                                        <Card
                                            className={`text-center h-100 cursor-pointer ${activeFilter.ingredientType === item.type ? 'border-primary' : ''}`}
                                            onClick={() => handleFilterClick({ ingredientType: item.type as any })}
                                        >
                                            <Card.Body>
                                                <Card.Title>
                                                    <Badge bg={activeFilter.ingredientType === item.type ? 'primary' : item.color}>
                                                        {activeFilter.ingredientType === item.type && (
                                                            <FontAwesomeIcon icon={faFilter} className="me-1" />
                                                        )}
                                                        {item.label}
                                                    </Badge>
                                                </Card.Title>
                                                <Card.Text className="display-6">
                                                    {stats.ingredientType[item.type as keyof typeof stats.ingredientType]}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Khu vực Bảng dữ liệu - tách biệt bằng Card riêng */}
            <Card className="shadow-sm">
                <Card.Body>
                    {/* Thông báo active filter */}
                    {Object.keys(activeFilter).length > 0 && (
                        <Alert variant="info" className="mb-3">
                            <strong>Đang lọc:</strong>
                            {activeFilter.expiryStatus === 'expired' && ' Thực phẩm đã hết hạn'}
                            {activeFilter.expiryStatus === 'aboutToExpire' && ' Thực phẩm sắp hết hạn'}
                            {activeFilter.expiryStatus === 'fresh' && ' Thực phẩm còn hạn'}
                            {activeFilter.ingredientType === 'dry' && ' Nguyên liệu khô'}
                            {activeFilter.ingredientType === 'seasoning' && ' Gia vị'}
                            {activeFilter.ingredientType === 'fresh' && ' Nguyên liệu tươi'}
                            {activeFilter.ingredientType === 'other' && ' Nguyên liệu khác'}
                            <Button variant="link" className="p-0 ms-2" onClick={clearAllFilters}>
                                (Bỏ lọc)
                            </Button>
                        </Alert>
                    )}

                    {/* Nội dung bảng dữ liệu */}
                    {displayItems.length === 0 ? (
                        <div className="text-center p-4">
                            <FontAwesomeIcon icon={faShoppingCart} size="3x" className="text-muted mb-3" />
                            <h5 className="text-muted">
                                {purchasedItems.length === 0
                                    ? 'Chưa có thực phẩm nào được lưu trữ'
                                    : 'Không tìm thấy thực phẩm phù hợp với bộ lọc'}
                            </h5>
                            {purchasedItems.length > 0 && (
                                <Button variant="outline-primary" onClick={clearAllFilters} className="mt-2">
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="table-responsive">
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
                                    {displayItems.map((item, index) => {
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
                        </div>
                    )}
                </Card.Body>
            </Card>


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
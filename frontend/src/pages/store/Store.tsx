import { faShoppingCart, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Table, Badge, Button, Toast } from 'react-bootstrap';
import axios from 'axios';
import Url from '../../utils/url';
import { userInfo } from '../../utils/userInfo';
import { StoreProps } from '../../utils/interface/Interface';
import './Store.css';

//Shared imports
import { TOAST_TYPES } from '../../utils/constants';
import { getExpiryStatus } from '../../utils/ingredientHelpers';
import { validateForFridgeAddition } from '../../utils/validationHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { ExpiryStatusBadge } from '../../components/shared/ExpiryStatusBadge';

function Store() {
    const [purchasedItems, setPurchasedItems] = useState<StoreProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    useEffect(() => {
        fetchPurchasedItems();
    }, []);

    const fetchPurchasedItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get(Url(`market/purchased-items/${userInfo?.id}`));
            if (Array.isArray(response.data)) {
                setPurchasedItems(response.data);
            } else {
                console.warn('API không trả về array:', response.data);
                setPurchasedItems([]);
            }
        } catch (error: any) {
            console.error('Lỗi khi lấy danh sách thực phẩm đã mua:', error);
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
            // console.error('Lỗi khi thêm vào tủ lạnh:', error);
            // console.error('Error response:', error.response?.data);
            
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

    
    useEffect(() => {
        console.log('Current userInfo:', userInfo);
        console.log('fridgeId:', userInfo?.fridgeId);
    }, []);

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

            {/*THÊM DEBUG INFO CHO USER */}
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
                            <th className="sticky-top border-bottom">STT</th>
                            <th className="sticky-top border-bottom">Ảnh</th>
                            <th className="sticky-top border-bottom">Tên thực phẩm</th>
                            <th className="sticky-top border-bottom">Số lượng</th>
                            <th className="sticky-top border-bottom">Đơn vị tính</th>
                            <th className="sticky-top border-bottom">Loại</th>
                            <th className="sticky-top border-bottom">Người mua</th>
                            <th className="sticky-top border-bottom">Ngày mua</th>
                            <th className="sticky-top border-bottom">Ngày hết hạn</th>
                            <th className="sticky-top border-bottom">Trạng thái</th>
                            <th className="sticky-top border-bottom">Thêm vào tủ lạnh</th>
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
                                            alt="anh"
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
                                    <td className="text-center">
                                        <Button
                                            variant={
                                                isExpired(item?.expridedAt) ? "outline-danger" : 
                                                !userInfo?.fridgeId ? "outline-secondary" :
                                                "outline-success"
                                            }
                                            size="sm"
                                            onClick={() => handleAddFromStoreToFridge(item)}
                                            disabled={isExpired(item?.expridedAt) || !userInfo?.fridgeId}
                                            title={
                                                isExpired(item?.expridedAt) 
                                                    ? "Không thể thêm thực phẩm hết hạn vào tủ lạnh"
                                                    : !userInfo?.fridgeId
                                                    ? "Không tìm thấy thông tin tủ lạnh"
                                                    : "Thêm vào tủ lạnh"
                                            }
                                        >
                                            <FontAwesomeIcon 
                                                icon={faCheckCircle} 
                                                className={
                                                    isExpired(item?.expridedAt) ? "text-danger" : 
                                                    !userInfo?.fridgeId ? "text-secondary" :
                                                    "text-success"
                                                }
                                            />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            )}

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
        </div>
    );
}

export default Store;
import { faShoppingCart, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Table, Badge, Button, Toast } from 'react-bootstrap';
import axios from 'axios';
import Url from '../../utils/url';
import { userInfo } from '../../utils/userInfo';
import './Store.css';

interface ShoppingAttributeDto {
    id: number;
    measure: string;
    buyAt: string;
    exprided: string;
    ingredientStatus: string;
    ingredientId: number;
}

interface PurchasedItem {
    id: number;
    image: string;
    name: string;
    quantitystore: number;
    statusstore: boolean;
    user: {
        id: number;
        name: string;
    };
    orderId: number;
    orderCode: string;
    attributes: ShoppingAttributeDto[];
}

function Store() {
    const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
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

    const calculateExpiryStatus = (buyAt?: string, exprided?: string) => {
        try {
            if (!exprided) return { status: "Không xác định", style: {}, daysLeft: null, tooltipText: "Không xác định ngày hết hạn" };
            const expiredDate = new Date(exprided);
            const currentDate = new Date();

            const daysLeft = Math.floor((expiredDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24) + 1);

            let tooltipText = "";

            if (daysLeft > 3) {
                tooltipText = `Thực phẩm còn ${daysLeft} ngày nữa là hết hạn`;
                return { status: "Còn hạn", style: { backgroundColor: "transparent" }, daysLeft, tooltipText };
            } else if (daysLeft > 0) {
                tooltipText = `Thực phẩm còn ${daysLeft} ngày nữa là hết hạn`;
                return { status: "Sắp hết hạn", style: { backgroundColor: "#FFF3CD" }, daysLeft, tooltipText };
            } else if (daysLeft === 0) {
                tooltipText = "Thực phẩm hết hạn ngày hôm nay";
                return { status: "Hết hạn hôm nay", style: { backgroundColor: "#F8D7DA" }, daysLeft, tooltipText };
            } else {
                tooltipText = `Thực phẩm đã hết hạn từ ${Math.abs(daysLeft)} ngày trước`;
                return { status: "Đã hết hạn", style: { backgroundColor: "#F5C6CB" }, daysLeft, tooltipText };
            }
        } catch {
            return { status: "Không xác định", style: {}, daysLeft: null, tooltipText: "Không xác định ngày hết hạn" };
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

    const handleAddToFridge = async (item: PurchasedItem) => {
        const attr = item.attributes?.[0];
        if (!attr) {
            showToastMessage('danger', 'Không có thông tin nguyên liệu để thêm vào tủ lạnh.');
            return;
        }

        // ✅ KIỂM TRA FRIDGEID TRƯỚC KHI GỬI REQUEST
        if (!userInfo?.fridgeId) {
            showToastMessage('danger', 'Không tìm thấy thông tin tủ lạnh. Vui lòng đăng nhập lại.');
            console.error('fridgeId is null or undefined:', userInfo);
            return;
        }

        if (isExpired(attr.exprided)) {
            showToastMessage('danger', `${item.name} đã hết hạn (${attr.exprided}).`);
            return;
        }

        if (attr.ingredientStatus === 'SEASONING') {
            showToastMessage('warning', 'Gia vị nêm không cần thêm vào tủ lạnh.');
            return;
        }

        if (item.name.trim() === "Gạo") {
            showToastMessage('warning', 'Gạo không cần thêm vào tủ lạnh.');
            return;
        }

        try {
            const requestData = {
                fridgeId: userInfo.fridgeId,
                ingredientId: attr.ingredientId,
                quantity: item.quantitystore,
                measure: attr.measure,
                exprided: attr.exprided,
                shoppingAttributeId: attr.id,
            };

            console.log('Sending request to add ingredient:', requestData);
            console.log('Item data:', item);
            console.log('Attribute data:', attr);

            await axios.post(Url(`fridge/ingredients`), requestData);

            showToastMessage('success', `Đã thêm ${item.name} vào tủ lạnh!`);
            fetchPurchasedItems();
        } catch (error: any) {
            console.error('Lỗi khi thêm vào tủ lạnh:', error);
            console.error('Error response:', error.response?.data);
            
            // ✅ CHI TIẾT HÓA ERROR HANDLING
            if (error.response?.status === 400) {
                showToastMessage('danger', 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
            } else if (error.response?.status === 404) {
                showToastMessage('danger', 'Không tìm thấy tủ lạnh hoặc nguyên liệu.');
            } else {
                showToastMessage('danger', error.response?.data?.message || 'Không thể thêm vào tủ lạnh');
            }
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

    // ✅ THÊM DEBUG INFO CHO USERINFO
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

            {/* ✅ THÊM DEBUG INFO CHO USER */}
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
                    <thead className="table-dark">
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
                        </tr>
                    </thead>
                    <tbody>
                        {purchasedItems.map((item, index) => {
                            const attr = item.attributes?.[0];
                            const { status, style, tooltipText } = calculateExpiryStatus(attr?.buyAt, attr?.exprided);

                            return (
                                <tr key={`${item.id}-${index}`} style={style} title={tooltipText}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            style={{ height: '3rem', width: '3rem', objectFit: 'cover' }}
                                            className="rounded"
                                        />
                                    </td>
                                    <td><strong>{item.name}</strong></td>
                                    <td>{item.quantitystore}</td>
                                    <td>{attr?.measure || 'Không rõ'}</td>
                                    <td>{renderIngredientType(attr?.ingredientStatus)}</td>
                                    <td><Badge bg="info">{item.user.name}</Badge></td>
                                    <td>{attr?.buyAt || 'Chưa cập nhật'}</td>
                                    <td>{attr?.exprided || 'Chưa có'}</td>
                                    <td>
                                        <Badge 
                                            bg={
                                                status === "Còn hạn" ? "success" :
                                                status === "Sắp hết hạn" ? "warning" :
                                                status === "Hết hạn hôm nay" ? "danger" :
                                                status === "Đã hết hạn" ? "danger" : "secondary"
                                            }
                                        >
                                            {status}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button
                                            variant={
                                                isExpired(attr?.exprided) ? "outline-danger" : 
                                                !userInfo?.fridgeId ? "outline-secondary" :
                                                "outline-success"
                                            }
                                            size="sm"
                                            onClick={() => handleAddToFridge(item)}
                                            disabled={isExpired(attr?.exprided) || !userInfo?.fridgeId}
                                            title={
                                                isExpired(attr?.exprided) 
                                                    ? "Không thể thêm thực phẩm hết hạn vào tủ lạnh"
                                                    : !userInfo?.fridgeId
                                                    ? "Không tìm thấy thông tin tủ lạnh"
                                                    : "Thêm vào tủ lạnh"
                                            }
                                        >
                                            <FontAwesomeIcon 
                                                icon={faCheckCircle} 
                                                className={
                                                    isExpired(attr?.exprided) ? "text-danger" : 
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
                        {toastType === 'success' ? 'Thành công' : 
                        toastType === 'danger' ? 'Cảnh báo' : 
                        toastType === 'info' ? 'Thông tin' : 'Thông báo'}
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
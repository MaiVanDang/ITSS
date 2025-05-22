import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Url from '../../utils/url';
import { Badge, Button, Table, Toast } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faShareFromSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { marketProps } from '../../utils/interface/Interface';
import { useDispatch, useSelector } from 'react-redux';
import { isLoginSelector, marketOrderSelector } from '../../redux/selectors';
import SearchMarketOrders from '../../components/search/SearchMarketOrders';
import { updateMarkets } from './MarketSlice';
import ModalDeleteMarketOrder from '../../components/modal/ModalDeleteMarketOrder';
import ModalDetailMarketOrder from '../../components/modal/ModalDetailMarketOrder';
import { userInfo } from '../../utils/userInfo';
import ModalShareMarketOrder from '../../components/modal/ModalShareMarketOrder';

function Market() {
    const dispatch = useDispatch();
    const marketOrders = useSelector(marketOrderSelector);
    const isLogin = useSelector(isLoginSelector);

    const [showModalDeleteMarketOrder, setShowModalDeleteMarketOrder] = useState(false);
    const [showModalDetailMarketOrder, setShowModalDetailMarketOrder] = useState(false);
    const [showModalShareMarketOrder, setShowModalShareMarketOrder] = useState(false);
    const [currentIdMarketOrder, setCurrentIdMarketOrder] = useState(0);
    const [currentMarketOrder, setCurrentMarketOrder] = useState<marketProps>({} as marketProps);
    
    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('warning');

    // Market order
    const callApi = async () => {
        try {
            const response = await axios.get(Url(`market/user/${userInfo?.id}`));
            return response.data || []; // nếu không có đơn thì trả mảng rỗng
        } catch (error) {
            console.error('Không lấy được đơn đi chợ!!!', error);
            return []; // trả về mảng rỗng để tránh lỗi
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const results = await callApi();
            dispatch(updateMarkets(results));
        };

        fetchData();
    }, [showModalDetailMarketOrder, showModalDeleteMarketOrder, showModalShareMarketOrder]);

    // Hàm hiển thị toast
    const showToastMessage = (type: string, message: string) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
    };

    // Hàm lấy chi tiết đơn hàng để kiểm tra số lượng nguyên liệu chưa mua
    const getOrderDetails = async (orderId: number) => {
        try {
            const response = await axios.get(Url(`market/show/detail/${orderId}`));
            return response.data;
        } catch (error) {
            console.error('Không lấy được chi tiết đơn hàng:', error);
            return null;
        }
    };

    // Hàm xử lý khi ấn nút chia sẻ
    // Hàm xử lý khi ấn nút chia sẻ - phiên bản cải tiến
const handleShareOrder = async (order: marketProps) => {
    // Kiểm tra trạng thái đơn
    if (order.status === 1) {
        showToastMessage(
            'success', 
            'Đơn hàng đã hoàn thành! Tất cả nguyên liệu đã được mua xong.'
        );
        return;
    }
    
    // Lấy chi tiết đơn hàng để phân tích chi tiết
    const orderDetails = await getOrderDetails(order.id);
    
        if (orderDetails && orderDetails.attributes) {
            const attributes = orderDetails.attributes;
            const totalCount = attributes.length;
            
            // Phân loại nguyên liệu theo trạng thái
            const unpurchasedItems = attributes.filter((attr: any) => attr.status === 0);
            const purchasedItems = attributes.filter((attr: any) => attr.status === 1);
            
            const unpurchasedCount = unpurchasedItems.length;
            const purchasedCount = purchasedItems.length;
            
            // Phân loại theo loại nguyên liệu chưa mua
            const unpurchasedByType = {
                fresh: unpurchasedItems.filter((attr: any) => attr.ingredientStatus === 'FRESH_INGREDIENT'),
                dry: unpurchasedItems.filter((attr: any) => attr.ingredientStatus === 'DRY_INGREDIENT'),
                seasoning: unpurchasedItems.filter((attr: any) => attr.ingredientStatus === 'SEASONING'),
                regular: unpurchasedItems.filter((attr: any) => attr.ingredientStatus === 'INGREDIENT')
            };
            
            // Tạo thông báo chi tiết
            if (unpurchasedCount === 0) {
                showToastMessage(
                    'success', 
                    `Tuyệt vời! Tất cả ${totalCount} nguyên liệu đã được mua xong. Đơn hàng sẵn sàng hoàn thành!`
                );
            } else if (unpurchasedCount === totalCount) {
                // Tất cả nguyên liệu chưa mua
                let typeBreakdown = [];
                if (unpurchasedByType.fresh.length > 0) typeBreakdown.push(`${unpurchasedByType.fresh.length} nguyên liệu tươi`);
                if (unpurchasedByType.dry.length > 0) typeBreakdown.push(`${unpurchasedByType.dry.length} nguyên liệu khô`);
                if (unpurchasedByType.seasoning.length > 0) typeBreakdown.push(`${unpurchasedByType.seasoning.length} gia vị`);
                if (unpurchasedByType.regular.length > 0) typeBreakdown.push(`${unpurchasedByType.regular.length} nguyên liệu khác`);
                
                const typeText = typeBreakdown.length > 0 ? ` (gồm: ${typeBreakdown.join(', ')})` : '';
                
                showToastMessage(
                    'info', 
                    `Đơn hàng cần mua ${unpurchasedCount} nguyên liệu${typeText}. Chia sẻ để nhờ thành viên khác hỗ trợ mua sắm!`
                );
            } else {
                // Một phần đã mua, một phần chưa mua
                const progressPercent = Math.round((purchasedCount / totalCount) * 100);
                
                // Tạo danh sách nguyên liệu chưa mua (tối đa 3 item đầu tiên)
                const unpurchasedNames = unpurchasedItems
                    .slice(0, 3)
                    .map((attr: any) => attr.ingredients.name);
                
                let itemsList = unpurchasedNames.join(', ');
                if (unpurchasedCount > 3) {
                    itemsList += ` và ${unpurchasedCount - 3} nguyên liệu khác`;
                }
                
                // Phân loại mức độ ưu tiên
                const hasFreshItems = unpurchasedByType.fresh.length > 0;
                const priority = hasFreshItems ? 'cao' : 'thường';
                const urgencyText = hasFreshItems ? ' (có nguyên liệu tươi cần mua sớm)' : '';
                
                showToastMessage(
                    hasFreshItems ? 'warning' : 'info',
                    `Tiến độ: ${purchasedCount}/${totalCount} nguyên liệu đã mua (${progressPercent}%). Còn cần mua: ${itemsList}${urgencyText}. Chia sẻ để được hỗ trợ!`
                );
            }
            
            // Kiểm tra nguyên liệu sắp hết hạn trong danh sách chưa mua
            const expiringSoonItems = unpurchasedItems.filter((attr: any) => {
                if (!attr.exprided) return false;
                const today = new Date();
                const expDate = new Date(attr.exprided);
                const threeDaysFromNow = new Date();
                threeDaysFromNow.setDate(today.getDate() + 3);
                
                today.setHours(0, 0, 0, 0);
                expDate.setHours(0, 0, 0, 0);
                threeDaysFromNow.setHours(0, 0, 0, 0);
                
                return expDate >= today && expDate <= threeDaysFromNow;
            });
            
            // Thông báo thêm về nguyên liệu sắp hết hạn
            if (expiringSoonItems.length > 0) {
                setTimeout(() => {
                    const expiringNames = expiringSoonItems
                        .slice(0, 2)
                        .map((attr: any) => attr.ingredients.name);
                    const expiringText = expiringNames.join(', ') + 
                        (expiringSoonItems.length > 2 ? ` và ${expiringSoonItems.length - 2} nguyên liệu khác` : '');
                    
                    showToastMessage(
                        'warning',
                        `⚠️ Lưu ý: ${expiringText} sắp hết hạn, cần ưu tiên mua sớm!`
                    );
                }, 2000); // Hiển thị sau 2 giây
            }
        } else {
            // Không lấy được dữ liệu chi tiết
            showToastMessage(
                'warning', 
                'Không thể tải thông tin chi tiết đơn hàng. Vui lòng thử lại!'
            );
            return;
        }
        
        // Mở modal chia sẻ
        setShowModalShareMarketOrder(true);
        setCurrentMarketOrder(order);
    };

    return isLogin ? (
        <div className="position-relative">
            <div className="mb-3 position-relative ">
                <SearchMarketOrders />
            </div>
            <div className="overflow-y-scroll" style={{ height: '92vh' }}>
                <Table hover bordered>
                    <thead className="fs-5 ">
                        <tr>
                            <th>STT</th>
                            <th>Mã đơn</th>
                            <th>Người tạo đơn</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Xóa đơn</th>
                            <th>Chia sẻ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            marketOrders.length > 0 ? (
                                marketOrders.map((order, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    <div>{order.code}</div>
                                </td>
                                <td
                                    onClick={() => {
                                        setCurrentIdMarketOrder(order.id);
                                        setShowModalDetailMarketOrder(true);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {order.user.name}
                                </td>
                                <td>
                                    {order.status === 1 ? (
                                        <Badge pill bg="success">
                                            Hoàn thành
                                        </Badge>
                                    ) : (
                                        <Badge pill bg="warning">
                                            Chưa xong
                                        </Badge>
                                    )}
                                </td>
                                <td>{order.createAt}</td>
                                <td>
                                    <div
                                        onClick={() => {
                                            setShowModalDeleteMarketOrder(true);
                                            setCurrentMarketOrder(order);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <FontAwesomeIcon size="lg" icon={faTrashCan} />
                                    </div>
                                </td>
                                <td>
                                    <div
                                        onClick={() => handleShareOrder(order)}
                                        style={{ 
                                            cursor: 'pointer',
                                            opacity: order.status === 1 ? 0.5 : 1
                                        }}
                                        title={order.status === 1 ? 'Đơn đã hoàn thành' : 'Chia sẻ đơn'}
                                    >
                                        <FontAwesomeIcon size="lg" icon={faShareFromSquare} />
                                    </div>
                                </td>
                            </tr>
                        ))
                                ) : (
                                <tr>
                                    <td colSpan={7} className="text-center">
                                        Không có đơn đi chợ nào
                                    </td>
                                </tr>
                            )
                        }
                        
                    </tbody>
                </Table>
                <ModalDeleteMarketOrder
                    show={showModalDeleteMarketOrder}
                    hide={() => setShowModalDeleteMarketOrder(false)}
                    order={currentMarketOrder}
                />
                <ModalDetailMarketOrder
                    show={showModalDetailMarketOrder}
                    hide={() => setShowModalDetailMarketOrder(false)}
                    indexOrder={currentIdMarketOrder}
                />
                <ModalShareMarketOrder
                    show={showModalShareMarketOrder}
                    hide={() => setShowModalShareMarketOrder(false)}
                    order={currentMarketOrder}
                />
            </div>
            <Link to="/market/add" className="position-absolute end-3 bottom-3">
                <Button
                    title="Tạo đơn đi chợ"
                    className="rounded-circle fs-2"
                    style={{ width: '5rem', height: '5rem' }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
            </Link>

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
                        {toastType === 'warning' ? 'Cảnh báo' : 
                         toastType === 'info' ? 'Thông tin' : 
                         toastType === 'success' ? 'Thành công' : 'Thông báo'}
                    </strong>
                </Toast.Header>
                <Toast.Body className={
                    toastType === 'warning' ? 'text-dark' : 
                    toastType === 'info' ? 'text-white' : 
                    toastType === 'success' ? 'text-white' : 'text-dark'
                }>
                    {toastMessage}
                </Toast.Body>
            </Toast>
        </div>
    ) : (
        <div></div>
    );
}

export default Market;
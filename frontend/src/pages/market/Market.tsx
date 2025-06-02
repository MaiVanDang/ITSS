import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Url from '../../utils/url';
import { Badge, Button, Table, Toast } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRefresh, faShareFromSquare, faStore, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { marketProps } from '../../utils/interface/Interface';
import { useDispatch, useSelector } from 'react-redux';
import { isLoginSelector, marketOrderSelector } from '../../redux/selectors';
import SearchMarketOrders from '../../components/search/SearchMarketOrders';
import { updateMarkets } from './MarketSlice';
import ModalDeleteMarketOrder from '../../components/modal/ModalDeleteMarketOrder';
import ModalDetailMarketOrder from '../../components/modal/ModalDetailMarketOrder';
import { userInfo } from '../../utils/userInfo';
import ModalShareMarketOrder from '../../components/modal/ModalShareMarketOrder';
import { formatDate } from '../../utils/dateHelpers';
import './Market.css';

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
    }, [showModalDetailMarketOrder, showModalDeleteMarketOrder, showModalShareMarketOrder, dispatch]);

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
        <div className="store-container">
            {/* Header giống Store */}
            <div className="store-header d-flex justify-content-between align-items-center">
                <h2>
                    <FontAwesomeIcon icon={faStore} className="me-2" />
                    Quản lý đơn đi chợ
                </h2>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-light"
                        onClick={() => callApi().then(results => dispatch(updateMarkets(results)))}
                        className="action-btn"
                    >
                        <FontAwesomeIcon icon={faRefresh} className="me-1" />
                        Làm mới
                    </Button>
                    <Link to="/market/add">
                        <Button variant="outline-light" className="action-btn">
                            <FontAwesomeIcon icon={faPlus} className="me-1" />
                            Thêm Đơn Hàng
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="mb-3 bg-white p-3 rounded shadow-sm">
                <SearchMarketOrders />
            </div>

            {/* Bảng dữ liệu giống Ingredients */}
            <div className="bg-white rounded shadow-sm overflow-hidden">
                {marketOrders.length === 0 ? (
                    <div className="text-center py-5">
                        <FontAwesomeIcon icon={faStore} size="3x" className="text-secondary mb-3" />
                        <h4>Chưa có đơn đi chợ nào</h4>
                        <p className="text-muted">Bạn có thể tạo đơn mới bằng cách nhấn nút "Thêm Đơn Hàng"</p>
                    </div>
                ) : (
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)', fontSize: 'medium' }}>
                        <Table hover className="mb-0">
                            <thead className="table-dark sticky-top">
                                <tr>
                                    <th className="text-center">STT</th>
                                    <th>Mã đơn</th>
                                    <th>Người tạo đơn</th>
                                    <th className="text-center">Trạng thái</th>
                                    <th className="text-center">Ngày tạo</th>
                                    <th className="text-center">Xóa đơn</th>
                                    <th className="text-center">Chia sẻ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marketOrders.map((order, index) => (
                                    <tr key={index}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{order.code}</td>
                                        <td className="text-center"
                                            onClick={() => {
                                                setCurrentIdMarketOrder(order.id);
                                                setShowModalDetailMarketOrder(true);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Badge bg="info">{order.user.name}</Badge>
                                        </td>
                                        <td className="text-center">
                                            {order.status === 1 ? (
                                                <Badge pill bg="success">
                                                    Hoàn thành
                                                </Badge>
                                            ) : (
                                                <Badge pill bg="warning" className="text-dark">
                                                    Chưa xong
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="text-center">{formatDate(order.createAt)}</td>
                                        <td className="text-center">
                                            <Button
                                                variant="link"
                                                onClick={() => {
                                                    setShowModalDeleteMarketOrder(true);
                                                    setCurrentMarketOrder(order);
                                                }}
                                                className="text-danger p-0"
                                            >
                                                <FontAwesomeIcon icon={faTrashCan} />
                                            </Button>
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                variant="link"
                                                onClick={() => handleShareOrder(order)}
                                                className={order.status === 1 ? "text-secondary p-0" : "text-primary p-0"}
                                                disabled={order.status === 1}
                                                title={order.status === 1 ? 'Đơn đã hoàn thành' : 'Chia sẻ đơn'}
                                            >
                                                <FontAwesomeIcon icon={faShareFromSquare} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Các modal và toast giữ nguyên */}
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
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Url from '../../utils/url';
import { Badge, Button, Table } from 'react-bootstrap';
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
                                    >
                                        <FontAwesomeIcon size="lg" icon={faTrashCan} />
                                    </div>
                                </td>
                                <td>
                                    <div
                                        onClick={() => {
                                            setShowModalShareMarketOrder(true);
                                            setCurrentMarketOrder(order);
                                        }}
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
        </div>
    ) : (
        <div></div>
    );
}

export default Market;

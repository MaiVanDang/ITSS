import axios from "axios";
import { useEffect, useState } from "react";
import Url from "../../utils/url";
import { Badge, Button, Table, Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRotateLeft, faTrashCan, faHeart, faUtensils } from "@fortawesome/free-solid-svg-icons";
import ModalDeleteDish from '../../components/modal/ModalDeleteDish';
import ModalDetailDish from '../../components/modal/ModalDetailDish';
import { dishsProps } from '../../utils/interface/Interface';
import Search from '../../components/search/SearchCook';
import { useDispatch, useSelector } from 'react-redux';
import { dishsSelector } from '../../redux/selectors';
import { favoriteDish, unFavoriteDish, updateDishs } from './DishsSlice';
import ModalRestoreDish from '../../components/modal/ModalRestoreDish';
import { Link } from 'react-router-dom';
import { faHeart as noHeart } from '@fortawesome/free-regular-svg-icons';
import { userInfo } from '../../utils/userInfo';
import { formatDate } from '../../utils/dateHelpers';

function Cook() {
    const dispatch = useDispatch();
    const lishDishs = useSelector(dishsSelector);

    const [showModalDeleteDish, setShowModalModalDeleteDish] = useState(false);
    const [showModalRestoreDish, setShowModalRestoreDish] = useState(false);
    const [showModalDetailDish, setShowModalDetailDish] = useState(false);
    const [indexCurrentDish, setIndexCurrentDish] = useState<number | null>(null);
    const [currentDish, setCurrentDish] = useState<dishsProps>({} as dishsProps);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const callApi = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(Url(`dishs/user/${userInfo?.id}`));
            setIsLoading(false);
            return response.data;
        } catch (error) {
            setIsLoading(false);
            setError('Lỗi Server! Không thể tải danh sách món ăn.');
            return [];
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await callApi();
                dispatch(updateDishs(results || []));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    const handleFavorite = async (dishId: number, isFavorited: 1 | 0) => {
        try {
            if (isFavorited === 1) {
                await axios.delete(Url(`favorite`), {
                    data: { userId: userInfo!.id!, dishId },
                });
                dispatch(unFavoriteDish(dishId));
            }

            if (isFavorited === 0) {
                await axios.post(Url(`favorite`), { userId: userInfo!.id!, dishId });
                dispatch(favoriteDish(dishId));
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái yêu thích:", error);
        }
    };

    const renderLoading = () => (
        <div className="text-center py-5">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải danh sách món ăn...</p>
        </div>
    );

    const renderEmptyList = () => (
        <div className="text-center py-5">
            <FontAwesomeIcon icon={faPlus} size="3x" className="text-secondary mb-3" />
            <h4>Chưa có món ăn nào</h4>
            <p className="text-muted">Bạn có thể thêm món ăn mới bằng cách nhấn nút Thêm ở góc phải dưới</p>
        </div>
    );

    const renderError = () => (
        <div className="text-center py-5 text-danger">
            <h4>Đã xảy ra lỗi</h4>
            <p>{error}</p>
            <Button
                variant="outline-primary"
                onClick={() => callApi().then(results => dispatch(updateDishs(results || [])))}
            >
                <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
                Thử lại
            </Button>
        </div>
    );

    return (
        <Container fluid className="px-4 py-3">
            <Row className="align-items-center mb-4">
                <Col>
                    <h2 className="mb-0">
                        <FontAwesomeIcon icon={faUtensils} className="me-2" />
                        Kho thực phẩm đã lưu trữ
                    </h2>
                </Col>
                <Col xs="auto">
                    <Link to="/cook/create">
                        <Button variant="primary" className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Thêm món ăn
                        </Button>
                    </Link>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <div className="bg-white p-3 rounded shadow-sm">
                        <Search />
                    </div>
                </Col>
            </Row>

            <Row>
                <Col>
                    <div className="bg-white rounded shadow-sm overflow-hidden">
                        {isLoading ? (
                            renderLoading()
                        ) : error ? (
                            renderError()
                        ) : lishDishs.length === 0 ? (
                            renderEmptyList()
                        ) : (
                            <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                                <Table hover className="mb-0">
                                    <thead className="table-dark sticky-top">
                                        <tr>
                                            <th className="text-center">STT</th>
                                            <th className="text-center">Ảnh</th>
                                            <th>Tên món ăn</th>
                                            <th className="text-center">Trạng thái</th>
                                            <th className="text-center">Kiểu món ăn</th>
                                            <th className="text-center">Ngày tạo</th>
                                            <th className="text-center">Xóa / Khôi phục</th>
                                            <th className="text-center">Yêu thích</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lishDishs.map((dish, index) => (
                                            <tr key={index} style={{ verticalAlign: 'middle' }}>
                                                <td className="text-center">{index + 1}</td>
                                                <td className="text-center">
                                                    <img
                                                        src={dish.image}
                                                        alt="anh"
                                                        style={{
                                                            width: '3rem',
                                                            height: '3rem',
                                                            objectFit: 'cover',
                                                            borderRadius: '0.5rem',
                                                        }}
                                                    />
                                                </td>
                                                <td
                                                    onClick={() => {
                                                        setIndexCurrentDish(dish.id);
                                                        setShowModalDetailDish(true);
                                                    }}
                                                    style={{ cursor: 'pointer', fontWeight: '500' }}
                                                >
                                                    {dish.name}
                                                </td>
                                                <td className="text-center">
                                                    {dish.status === 1 ? (
                                                        <Badge pill bg="success">
                                                            Sẵn sàng đặt món
                                                        </Badge>
                                                    ) : (
                                                        <Badge pill bg="danger">
                                                            Đã xóa
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="text-center">{dish.type}</td>
                                                <td className="text-center">{formatDate(dish.createAt)}</td>
                                                <td className="text-center">
                                                    {dish.status === 1 ? (
                                                        <div
                                                            onClick={() => {
                                                                setCurrentDish(dish);
                                                                setShowModalModalDeleteDish(true);
                                                            }}
                                                            style={{ cursor: 'pointer', color: '#dc3545' }}
                                                        >
                                                            <FontAwesomeIcon size="lg" icon={faTrashCan} />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            onClick={() => {
                                                                setCurrentDish(dish);
                                                                setShowModalRestoreDish(true);
                                                            }}
                                                            style={{ cursor: 'pointer', color: '#0d6efd' }}
                                                        >
                                                            <FontAwesomeIcon icon={faRotateLeft} />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <div
                                                        onClick={() => handleFavorite(dish.id, dish.favorite)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <FontAwesomeIcon
                                                            size="lg"
                                                            className="p-1"
                                                            icon={dish.favorite === 1 ? faHeart : noHeart}
                                                            style={{ color: dish.favorite === 1 ? '#d91717' : '#6c757d' }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Modals */}
            <ModalDeleteDish
                show={showModalDeleteDish}
                hide={() => setShowModalModalDeleteDish(false)}
                dish={currentDish}
            />

            <ModalRestoreDish
                show={showModalRestoreDish}
                hide={() => setShowModalRestoreDish(false)}
                dish={currentDish}
            />

            {indexCurrentDish && (
                <ModalDetailDish
                    show={showModalDetailDish}
                    hide={() => {
                        setShowModalDetailDish(false);
                        setIndexCurrentDish(null);
                    }}
                    indexOrder={indexCurrentDish}
                />
            )}
        </Container>
    );
}

export default Cook;
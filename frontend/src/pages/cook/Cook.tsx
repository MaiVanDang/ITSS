import axios from "axios";
import { useEffect, useState } from "react";
import Url from "../../utils/url";
import { Badge, Button, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRotateLeft, faTrashCan, faHeart } from "@fortawesome/free-solid-svg-icons";
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

function Cook(){
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
            try{
                const results = await callApi();
                dispatch(updateDishs(results || []));
            } catch (error){
                console.error(error);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]); // Thêm dispatch vào dependency array

    const handleFavorite = async (dishId: number, isFavorited: 1 | 0) => {
        try {
            if (isFavorited === 1){
                await axios.delete(Url(`favorite`), {
                    data: { userId: userInfo!.id!, dishId },
                });
                dispatch(unFavoriteDish(dishId));
            }

            if(isFavorited === 0){
                await axios.post(Url(`favorite`), { userId: userInfo!.id!, dishId});
                dispatch(favoriteDish(dishId));
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái yêu thích:", error);
        }
    };

    // Hiển thị nội dung loading
    const renderLoading = () => (
        <div className="text-center py-5">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải danh sách món ăn...</p>
        </div>
    );

    // Hiển thị nội dung khi không có món ăn
    const renderEmptyList = () => (
        <div className="text-center py-5">
            <FontAwesomeIcon icon={faPlus} size="3x" className="text-secondary mb-3" />
            <h4>Chưa có món ăn nào</h4>
            <p className="text-muted">Bạn có thể thêm món ăn mới bằng cách nhấn nút Thêm ở góc phải dưới</p>
        </div>
    );

    // Hiển thị nội dung khi có lỗi
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
        <div className="position-relative">
            <Search />
            <div className="overflow-y-scroll" style={{ height: '92vh' }}>
                {isLoading ? (
                    renderLoading()
                ) : error ? (
                    renderError()
                ) : lishDishs.length === 0 ? (
                    renderEmptyList()
                ) : (
                    <Table hover bordered>
                        <thead className="fs-5 ">
                            <tr>
                                <th>STT</th>
                                <th>Ảnh</th>
                                <th>Tên món ăn</th>
                                <th>Trạng thái</th>
                                <th>Kiểu món ăn</th>
                                <th>Ngày tạo</th>
                                <th>Xóa</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lishDishs.map((dish : dishsProps, index : number) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <img
                                            src={dish.image}
                                            alt="anh"
                                            style={{ width: '3rem', height: '3rem' }}
                                        />
                                    </td>
                                    <td
                                        onClick={() => {
                                            setIndexCurrentDish(dish.id);
                                            setShowModalDetailDish(true);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {dish.name}
                                    </td>
                                    <td>
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
                                    <td>{dish.type}</td>
                                    <td>{dish.createAt}</td>
                                    <td>
                                        {dish.status === 1 ? (
                                            <div
                                                onClick={() => {
                                                    setCurrentDish(dish);
                                                    setShowModalModalDeleteDish(true);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <FontAwesomeIcon size="lg" icon={faTrashCan} />
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => {
                                                    setCurrentDish(dish);
                                                    setShowModalRestoreDish(true);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <FontAwesomeIcon icon={faRotateLeft} />
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {dish.favorite === 1 ? (
                                            <div
                                                onClick={() => {
                                                    handleFavorite(dish.id, dish.favorite);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <FontAwesomeIcon
                                                    size="lg"
                                                    className="p-1"
                                                    icon={faHeart}
                                                    style={{ color: '#d91717' }}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => {
                                                    handleFavorite(dish.id, dish.favorite);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <FontAwesomeIcon
                                                    size="lg"
                                                    className="p-1"
                                                    icon={noHeart}
                                                />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>

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
                        setIndexCurrentDish(null); // Reset index khi đóng modal
                    }}
                    indexOrder={indexCurrentDish}
                />
            )}
            <Link to="/cook/create" className="position-absolute end-3 bottom-3">
                <Button
                    title="Thêm món ăn"
                    className="rounded-circle fs-2"
                    style={{ width: '5rem', height: '5rem' }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
            </Link>
        </div>
    )
}

export default Cook;
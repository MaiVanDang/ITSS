import axios from "axios";
import { useEffect, useState } from "react";
import Url from "../../utils/url";
import { Badge, Button, Table, Toast } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRotateLeft, faTrashCan, faHeart, faUtensils, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { dishsProps } from '../../utils/interface/Interface';
import Search from '../../components/search/SearchCook';
import ModalDeleteDish from '../../components/modal/ModalDeleteDish';
import ModalDetailDish from '../../components/modal/ModalDetailDish';
import ModalRestoreDish from '../../components/modal/ModalRestoreDish';
import { useDispatch, useSelector } from 'react-redux';
import { dishsSelector } from '../../redux/selectors';
import { favoriteDish, unFavoriteDish, updateDishs } from './DishsSlice';
import { Link } from 'react-router-dom';
import { faHeart as noHeart } from '@fortawesome/free-regular-svg-icons';
import { userInfo } from '../../utils/userInfo';
import './Cook.css';
import { convertToBaseUnit } from "../../utils/convertUnit";

function Cook() {
    const dispatch = useDispatch();
    const listDishs = useSelector(dishsSelector);

    const [showModalDeleteDish, setShowModalDeleteDish] = useState(false);
    const [showModalRestoreDish, setShowModalRestoreDish] = useState(false);
    const [showModalDetailDish, setShowModalDetailDish] = useState(false);
    const [ingredientsList, setIngredientsList] = useState<Record<number, any>>({});
    const [indexCurrentDish, setIndexCurrentDish] = useState<number | null>(null);
    const [currentDish, setCurrentDish] = useState<dishsProps>({} as dishsProps);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedDishId, setSelectedDishId] = useState<number>(0);

    const [isReadyToCook, setIsReadyToCook] = useState(false);
    const [isGroupCooking, setIsGroupCooking] = useState(false);
    const [selectedGroupName, setSelectedGroupName] = useState('');

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('warning');

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
    }, [dispatch]);

    const handleFavorite = async (dishId: number, isFavorited: 1 | 0) => {
        try {
            if (isFavorited === 1) {
                await axios.delete(Url(`favorite`), {
                    data: { userId: userInfo!.id!, dishId },
                });
                dispatch(unFavoriteDish(dishId));
                showToastMessage('success', 'Đã bỏ yêu thích món ăn');
            }

            if (isFavorited === 0) {
                await axios.post(Url(`favorite`), { userId: userInfo!.id!, dishId });
                dispatch(favoriteDish(dishId));
                showToastMessage('success', 'Đã thêm vào món ăn yêu thích');
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái yêu thích:", error);
            showToastMessage('warning', 'Có lỗi khi cập nhật trạng thái yêu thích');
        }
    };

    const showToastMessage = (type: string, message: string) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
    };

    const checkAllDishesIngredients = async () => {
        try {
            const results = await Promise.all(
                listDishs.map(dish =>
                    axios.get(Url(`dishs/show/detail/${dish.id}/${userInfo?.id}`))
                )
            );

            const ingredientsData = results.reduce((acc, response, index) => {
                if (response.data) {
                    acc[listDishs[index].id] = response.data;
                }
                return acc;
            }, {} as Record<number, any>);

            setIngredientsList(ingredientsData);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết nguyên liệu:', error);
        }
    };

    useEffect(() => {
        if (listDishs.length > 0) {
            checkAllDishesIngredients();
        }
    }, [listDishs]);

    const checkIngredientsStatus = (dishId: number) => {
        const dishData = ingredientsList[dishId];
        if (!dishData || !dishData.ingredients || dishData.ingredients.length === 0) {
            return 'no-ingredients';
        }

        const checkQuantities = getCheckQuantities(dishId);
        const allReady = checkQuantities.every((quantity: number) => quantity > 0);
        return allReady ? 'ready' : 'not-ready';
    };

    const getCheckQuantities = (dishId: number) => {
    const dishData = ingredientsList[dishId];
    if (!dishData || !dishData.ingredients || dishData.ingredients.length === 0) {
        return [];
    }

    return dishData.ingredients.map((item: any) => {
        const required = convertToBaseUnit(item.measure, item.quantity);

        if (!item.supportDishDto || item.supportDishDto.length === 0) return 0;

        let total = 0;

        item.supportDishDto.forEach((support: any) => {
            const positionName = support.positionName;

            const isTargetGroup =
                isGroupCooking && selectedGroupName &&
                (positionName === selectedGroupName ||
                    positionName === `Nhóm ${selectedGroupName}` ||
                    positionName.toLowerCase().includes(selectedGroupName.toLowerCase()));

            const isPersonal = positionName === "Kho cá nhân" || positionName === "Tủ lạnh cá nhân";

            if ((isGroupCooking && (isTargetGroup || isPersonal)) || (!isGroupCooking && isPersonal)) {
                total += convertToBaseUnit(support.measure, support.quantityDoublePresent);
            }
        });

        return total >= required ? 1 : 0;
    });
};
    const checkRecipeStatus = (dishId: number) => {
        const dishData = ingredientsList[dishId];
        if (!dishData) return 'missing-both';

        const hasIngredients = dishData.ingredients && dishData.ingredients.length > 0;
        const hasRecipe = dishData.recipeDes && dishData.recipeDes.trim() !== '';

        if (hasIngredients && hasRecipe) return 'complete';
        if (!hasIngredients && !hasRecipe) return 'missing-both';
        if (!hasIngredients) return 'missing-ingredients';
        return 'missing-recipe';
    };

    const handleFilterContextChange = (readyToCook: boolean, groupCooking: boolean, groupName: string) => {
        setIsReadyToCook(readyToCook);
        setIsGroupCooking(groupCooking);
        setSelectedGroupName(groupName);
    };

    const handleShowModal = (dishId: number) => {
        setSelectedDishId(dishId);
        setShowModal(true);
    };

    const handleHideModal = () => {
        setShowModal(false);
        setSelectedDishId(0);
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
            <FontAwesomeIcon icon={faUtensils} size="3x" className="text-secondary mb-3" />
            <h4>Chưa có món ăn nào</h4>
            <p className="text-muted">Bạn có thể thêm món ăn mới bằng cách nhấn nút "Thêm món ăn"</p>
        </div>
    );

    const renderError = () => (
        <div className="text-center py-5 text-danger">
            <h4>Đã xảy ra lỗi</h4>
            <p>{error}</p>
            <Button
                variant="outline-primary"
                onClick={() => callApi().then(results => dispatch(updateDishs(results || [])))}
                className="action-btn"
            >
                <FontAwesomeIcon icon={faRefresh} className="me-2" />
                Thử lại
            </Button>
        </div>
    );

    return (
        <div className="store-container">
            <div className="store-header d-flex justify-content-between align-items-center">
                <h2>
                    <FontAwesomeIcon icon={faUtensils} className="me-2" />
                    Kho thực phẩm đã lưu trữ
                </h2>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-light"
                        onClick={() => callApi().then(results => dispatch(updateDishs(results || [])))}
                        className="action-btn"
                    >
                        <FontAwesomeIcon icon={faRefresh} className="me-1" />
                        Làm mới
                    </Button>
                    <Link to="/cook/create">
                        <Button variant="outline-light" className="action-btn">
                            <FontAwesomeIcon icon={faPlus} className="me-1" />
                            Thêm món ăn
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mb-3 bg-white p-3 rounded shadow-sm">
                <Search onFilterContextChange={handleFilterContextChange} />
            </div>

            <div className="bg-white rounded shadow-sm overflow-hidden">
                {isLoading ? (
                    renderLoading()
                ) : error ? (
                    renderError()
                ) : listDishs.length === 0 ? (
                    renderEmptyList()
                ) : (
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)', fontSize: 'medium' }}>
                        <Table hover className="mb-0">
                            <thead className="table-dark sticky-top">
                                <tr>
                                    <th className="text-center">STT</th>
                                    <th className="text-center">Ảnh</th>
                                    <th>Tên món ăn</th>
                                    <th className="text-center">Trạng thái</th>
                                    <th className="text-center">Kiểu món ăn</th>
                                    <th className="text-center">Công thức nấu ăn</th>
                                    <th className="text-center">Xóa/Khôi phục</th>
                                    <th className="text-center">Yêu thích</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listDishs.map((dish, index) => (
                                    <tr key={index}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">
                                            <img
                                                src={dish.image}
                                                alt="anh"
                                                style={{
                                                    width: '4rem',
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
                                            {(() => {
                                                const status = checkIngredientsStatus(dish.id);
                                                if (status === 'no-ingredients') return null;
                                                if (status === 'ready') {
                                                    return <Badge pill bg="success">Sẵn sàng nấu</Badge>;
                                                }
                                                return <Badge pill bg="warning">Chưa sẵn sàng nấu</Badge>;
                                            })()}
                                        </td>
                                        <td className="text-center">{dish.type}</td>
                                        <td>
                                            {(() => {
                                                const status = checkRecipeStatus(dish.id);
                                                switch (status) {
                                                    case 'complete': return 'Đã có';
                                                    case 'missing-ingredients': return 'Thiếu danh sách nguyên liệu';
                                                    case 'missing-recipe': return 'Thiếu công thức nấu';
                                                    case 'missing-both': return 'Thiếu cả công thức và nguyên liệu';
                                                    default: return 'Chưa xác định';
                                                }
                                            })()}
                                        </td>
                                        <td className="text-center">
                                            {dish.status === 1 ? (
                                                <Button
                                                    variant="link"
                                                    onClick={() => {
                                                        setIndexCurrentDish(dish.id);
                                                        setShowModalDetailDish(true);
                                                    }}
                                                    className="text-danger p-0"
                                                >
                                                    <FontAwesomeIcon icon={faTrashCan} />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="link"
                                                    onClick={() => {
                                                        setCurrentDish(dish);
                                                        setShowModalRestoreDish(true);
                                                    }}
                                                    className="text-primary p-0"
                                                >
                                                    <FontAwesomeIcon icon={faRotateLeft} />
                                                </Button>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                variant="link"
                                                onClick={() => handleFavorite(dish.id, dish.favorite)}
                                                className="p-0"
                                            >
                                                <FontAwesomeIcon
                                                    icon={dish.favorite === 1 ? faHeart : noHeart}
                                                    style={{ color: dish.favorite === 1 ? '#d91717' : '#6c757d' }}
                                                />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </div>

            <ModalDeleteDish
                show={showModalDeleteDish}
                hide={() => setShowModalDeleteDish(false)}
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
                    hide={() => setShowModalDetailDish(false)}
                    dishId={indexCurrentDish || 0}
                    isReadyToCook={isReadyToCook}
                    isGroupCooking={isGroupCooking}
                    selectedGroupName={selectedGroupName}
                />
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
    );
}

export default Cook;
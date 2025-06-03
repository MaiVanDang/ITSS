import axios from 'axios';
import { useEffect, useState } from 'react';
import Url from '../../utils/url';
import { Badge, Button, Table, Toast } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKitchenSet, faPlus, faRefresh, faTrashCan, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { ingredientProps } from '../../utils/interface/Interface';
import { useDispatch, useSelector } from 'react-redux';
import { deleteIngredients, restoreIngredients, updateIngredients } from './IngredientSlice';
import { ingredientsSelector } from '../../redux/selectors';
import SearchIngredients from '../../components/search/SearchIngredients';
import ModalAddIngredient from '../../components/modal/ModalAddIngredient';
import ModalEditIngredient from '../../components/modal/ModalEditIngredient';
import { formatDate } from '../../utils/dateHelpers';
import './Ingredients.css';

function Ingredients() {
    const dispatch = useDispatch();
    const listIngredients = useSelector(ingredientsSelector);
    const [showModalAddIngredient, setShowModalAddIngredient] = useState(false);
    const [showModalEditIngredient, setShowModalEditIngredient] = useState(false);
    const [currentIngredient, setCurrentIngredient] = useState<ingredientProps>({} as ingredientProps);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('warning');

    const callApi = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(Url(`ingredients`));
            setIsLoading(false);
            return response.data;
        } catch (error) {
            setIsLoading(false);
            setError('Lỗi Server! Không thể tải danh sách nguyên liệu.');
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await callApi();
                dispatch(updateIngredients(results));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [dispatch]);

    const handleDeleteIngredient = async (id: number) => {
        try {
            await axios.delete(Url(`ingredient/${id}`));
            dispatch(deleteIngredients(id));
            showToastMessage('success', 'Xóa nguyên liệu thành công!');
        } catch (error) {
            console.log(error);
            showToastMessage('warning', 'Xóa nguyên liệu thất bại!');
        }
    };

    const handleRestoreIngredient = async (id: number) => {
        try {
            await axios.put(Url(`ingredient/${id}`));
            dispatch(restoreIngredients(id));
            showToastMessage('success', 'Khôi phục nguyên liệu thành công!');
        } catch (error) {
            console.log(error);
            showToastMessage('warning', 'Khôi phục nguyên liệu thất bại!');
        }
    };

    // Hàm hiển thị toast
    const showToastMessage = (type: string, message: string) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
    };

    const renderLoading = () => (
        <div className="text-center py-5">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải danh sách nguyên liệu...</p>
        </div>
    );

    const renderEmptyList = () => (
        <div className="text-center py-5">
            <FontAwesomeIcon icon={faKitchenSet} size="3x" className="text-secondary mb-3" />
            <h4>Chưa có nguyên liệu nào</h4>
            <p className="text-muted">Bạn có thể thêm nguyên liệu mới bằng cách nhấn nút "Thêm nguyên liệu"</p>
        </div>
    );

    const renderError = () => (
        <div className="text-center py-5 text-danger">
            <h4>Đã xảy ra lỗi</h4>
            <p>{error}</p>
            <Button
                variant="outline-primary"
                onClick={() => callApi().then(results => dispatch(updateIngredients(results)))}
                className="action-btn"
            >
                <FontAwesomeIcon icon={faRefresh} className="me-2" />
                Thử lại
            </Button>
        </div>
    );

    return (
        <div className="store-container">
            {/* Header giống Market */}
            <div className="store-header d-flex justify-content-between align-items-center">
                <h2>
                    <FontAwesomeIcon icon={faKitchenSet} className="me-2" />
                    Kho nguyên liệu
                </h2>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-light"
                        onClick={() => callApi().then(results => dispatch(updateIngredients(results)))}
                        className="action-btn"
                    >
                        <FontAwesomeIcon icon={faRefresh} className="me-1" />
                        Làm mới
                    </Button>
                    <Button
                        onClick={() => setShowModalAddIngredient(true)}
                        variant="outline-light"
                        className="action-btn"
                    >
                        <FontAwesomeIcon icon={faPlus} className="me-1" />
                        Thêm nguyên liệu
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-3 bg-white p-3 rounded shadow-sm">
                <SearchIngredients />
            </div>

            {/* Bảng dữ liệu giống Market */}
            <div className="bg-white rounded shadow-sm overflow-hidden">
                {isLoading ? (
                    renderLoading()
                ) : error ? (
                    renderError()
                ) : listIngredients.length === 0 ? (
                    renderEmptyList()
                ) : (
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)', fontSize: 'medium'  }}>
                        <Table hover className="mb-0">
                            <thead className="table-dark sticky-top">
                                <tr>
                                    <th className="text-center">STT</th>
                                    <th className="text-center">Ảnh</th>
                                    <th>Tên nguyên liệu</th>
                                    <th className="text-center">Trạng thái</th>
                                    <th className="text-center">Ngày tạo</th>
                                    <th className="text-center">Hết hạn (ngày)</th>
                                    <th className="text-center">Xóa/Khôi phục</th>
                                    <th className="text-center">Loại</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listIngredients.map((ingredient, index) => (
                                    <tr key={index}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">
                                            <img
                                                src={ingredient.image}
                                                alt="anh"
                                                style={{ height: '3rem', width: '4rem', objectFit: 'cover' }}
                                                className="rounded"
                                            />
                                        </td>
                                        <td
                                            onClick={() => {
                                                setShowModalEditIngredient(true);
                                                setCurrentIngredient(ingredient);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {ingredient.name}
                                        </td>
                                        <td className="text-center">
                                            {ingredient.status === 1 ? (
                                                <Badge pill bg="success">
                                                    Sẵn sàng mua
                                                </Badge>
                                            ) : (
                                                <Badge pill bg="danger">
                                                    Đã xóa
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="text-center">{formatDate(ingredient.createAt)}</td>
                                        <td className="text-center">{ingredient.dueDate}</td>
                                        <td className="text-center">
                                            {ingredient.status === 1 ? (
                                                <Button
                                                    variant="link"
                                                    onClick={() => handleDeleteIngredient(ingredient.id)}
                                                    className="text-danger p-0"
                                                >
                                                    <FontAwesomeIcon icon={faTrashCan} />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="link"
                                                    onClick={() => handleRestoreIngredient(ingredient.id)}
                                                    className="text-primary p-0"
                                                >
                                                    <FontAwesomeIcon icon={faRotateLeft} />
                                                </Button>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {ingredient.ingredientStatus === 'INGREDIENT' ? (
                                                <Badge pill bg="primary">
                                                    Nguyên liệu
                                                </Badge>
                                            ) : ingredient.ingredientStatus === 'FRESH_INGREDIENT' ? (
                                                <Badge pill bg="success">
                                                    Nguyên liệu tươi
                                                </Badge>
                                            ) : ingredient.ingredientStatus === 'DRY_INGREDIENT' ? (
                                                <Badge pill bg="secondary">
                                                    Nguyên liệu khô
                                                </Badge>
                                            ) : ingredient.ingredientStatus === 'SEASONING' ? (
                                                <Badge pill bg="warning" className="text-dark">
                                                    Gia vị nêm
                                                </Badge>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Modal và Toast */}
            <ModalAddIngredient
                show={showModalAddIngredient}
                hide={() => setShowModalAddIngredient(false)}
            />

            <ModalEditIngredient
                show={showModalEditIngredient}
                hide={() => setShowModalEditIngredient(false)}
                ingredient={currentIngredient}
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
    );
}

export default Ingredients;
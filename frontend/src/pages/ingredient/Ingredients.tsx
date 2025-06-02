import axios from 'axios';
import { useEffect, useState } from 'react';
import Url from '../../utils/url';
import { Badge, Button, Table, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKitchenSet, faPlus, faRotateLeft, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { ingredientProps } from '../../utils/interface/Interface';
import { useDispatch, useSelector } from 'react-redux';
import { deleteIngredients, restoreIngredients, updateIngredients } from './IngredientSlice';
import { ingredientsSelector } from '../../redux/selectors';
import SearchIngredients from '../../components/search/SearchIngredients';
import ModalAddIngredient from '../../components/modal/ModalAddIngredient';
import ModalEditIngredient from '../../components/modal/ModalEditIngredient';
import { formatDate } from '../../utils/dateHelpers';

function Ingredients() {
    const dispatch = useDispatch();
    const lishIngredients = useSelector(ingredientsSelector);

    const [showModalAddIngredient, setShowModalAddIngredient] = useState(false);
    const [showModalEditIngredient, setShowModalEditIngredient] = useState(false);
    const [currentIngredient, setCurrentIngredient] = useState<ingredientProps>({} as ingredientProps);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        } catch (error) {
            console.log(error);
        }
    };

    const handleRestoreIngredient = async (id: number) => {
        try {
            await axios.put(Url(`ingredient/${id}`));
            dispatch(restoreIngredients(id));
        } catch (error) {
            console.log(error);
        }
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
                        <FontAwesomeIcon icon={faKitchenSet} className="me-2" />
                        Kho thực phẩm đã lưu trữ
                    </h2>
                </Col>
                <Col xs="auto">
                    <Button
                        onClick={() => setShowModalAddIngredient(true)}
                        variant="primary"
                        className="d-flex align-items-center"
                    >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Thêm nguyên liệu
                    </Button>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <div className="bg-white p-3 rounded shadow-sm">
                        <SearchIngredients />
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
                        ) : lishIngredients.length === 0 ? (
                            renderEmptyList()
                        ) : (
                            <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)' }}>
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
                                        {lishIngredients.map((ingredient, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{index + 1}</td>
                                                <td className="text-center">
                                                    <img
                                                        src={ingredient.image}
                                                        alt="anh"
                                                        style={{ height: '3rem', width: '3rem', objectFit: 'cover' }}
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
                </Col>
            </Row>

            <ModalAddIngredient
                show={showModalAddIngredient}
                hide={() => setShowModalAddIngredient(false)}
            />

            <ModalEditIngredient
                show={showModalEditIngredient}
                hide={() => setShowModalEditIngredient(false)}
                ingredient={currentIngredient}
            />
        </Container>
    );
}

export default Ingredients;
import axios from 'axios';
import { useEffect, useState } from 'react';
import Url from '../../utils/url';
import { Badge, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateLeft, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { ingredientProps } from '../../utils/interface/Interface';
import { useDispatch, useSelector } from 'react-redux';
import { deleteIngredients, restoreIngredients, updateIngredients } from './IngredientSlice';
import { ingredientsSelector } from '../../redux/selectors';
import SearchIngredients from '../../components/search/SearchIngredients';
import ModalAddIngredient from '../../components/modal/ModalAddIngredient';
import ModalEditIngredient from '../../components/modal/ModalEditIngredient';

function Ingredients() {
    const dispatch = useDispatch();
    const lishIngredients = useSelector(ingredientsSelector);

    const [showModalAddIngredient, setShowModalAddIngredient] = useState(false);
    const [showModalEditIngredient, setShowModalEditIngredient] = useState(false);

    const [showModalDetailIngredient, setShowModalDetailIngredient] = useState(false);
    const [indexCurrentIngredient, setIndexCurrentIngredient] = useState(1);
    const [currentIngredient, setCurrentIngredient] = useState<ingredientProps>(
        {} as ingredientProps,
    );

    const callApi = async () => {
        try {
            const response = await axios.get(Url(`ingredients`));
            return response.data;
        } catch (error) {
            alert('Lỗi Server!!!');
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
    }, []);

    // Xóa nguyên liệu
    const handleDeleteIngredient = async (id: number) => {
        try {
            await axios.delete(Url(`ingredient/${id}`));
            dispatch(deleteIngredients(id));
        } catch (error) {
            console.log(error);
        }
    };

    // khôi phục nguyên liệu
    const handleRestoreIngredient = async (id: number) => {
        try {
            await axios.put(Url(`ingredient/${id}`));
            dispatch(restoreIngredients(id));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <div className="mb-3    position-relative ">
                <SearchIngredients />
                <Button
                    onClick={() => setShowModalAddIngredient(true)}
                    className="h-100 fs-5 position-absolute top-0 end-1"
                    style={{ width: '20%' }}
                >
                    Thêm nguyên liệu
                </Button>
            </div>
            <div className="overflow-y-scroll" style={{ height: '92vh' }}>
                <Table hover bordered>
                    <thead className="fs-5 ">
                        <tr>
                            <th>STT</th>
                            <th>Ảnh</th>
                            <th>Tên nguyên liệu</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hết hạn (ngày)</th>
                            <th>Xóa</th>
                            <th>Loại</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lishIngredients.map((ingredient, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    <img
                                        src={ingredient.image}
                                        alt="anh"
                                        style={{ height: '3rem', width: '3rem' }}
                                    />
                                </td>
                                <td
                                    onClick={() => {
                                        setShowModalEditIngredient(true);
                                        setCurrentIngredient(ingredient);
                                    }}
                                >
                                    {ingredient.name}
                                </td>
                                <td>
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
                                <td>{ingredient.createAt}</td>
                                <td>{ingredient.dueDate}</td>
                                <td>
                                    {ingredient.status === 1 ? (
                                        <div
                                            onClick={() => {
                                                handleDeleteIngredient(ingredient.id);
                                            }}
                                        >
                                            <FontAwesomeIcon size="lg" icon={faTrashCan} />
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => {
                                                handleRestoreIngredient(ingredient.id);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faRotateLeft} />
                                        </div>
                                    )}
                                </td>
                                <td>
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
                                        <Badge pill bg="warning">
                                            Gia vị nêm
                                        </Badge>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <ModalAddIngredient
                show={showModalAddIngredient}
                hide={() => setShowModalAddIngredient(false)}
            />

            <ModalEditIngredient
                show={showModalEditIngredient}
                hide={() => setShowModalEditIngredient(false)}
                ingredient={currentIngredient}
            />

            {/* <ModalDetailIngredient
                show={showModalDetailIngredient}
                hide={() => setShowModalDetailIngredient(false)}
                indexIngredient={indexCurrentIngredient}
            /> */}
        </div>
    );
}

export default Ingredients;

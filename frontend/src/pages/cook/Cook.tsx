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

    const callApi = async () => {
        try {
            const response = await axios.get(Url(`dishs/user/${userInfo?.id}`));
            return response.data;
        } catch (error) {
            alert('Lỗi Server!!!');
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try{
                const results = await callApi();
                dispatch(updateDishs(results));
            } catch (error){
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const handleFavorite = async (dishId: number, isFavorited: 1 | 0) => {
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
    };

    
    return (
        <div className="position-relative">
            <Search />
            <div className="overflow-y-scroll" style={{ height: '92vh' }}>
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
                                        >
                                            <FontAwesomeIcon size="lg" icon={faTrashCan} />
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => {
                                                setCurrentDish(dish);
                                                setShowModalRestoreDish(true);
                                            }}
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
                    hide={() => setShowModalDetailDish(false)}
                    indexDish={indexCurrentDish}
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
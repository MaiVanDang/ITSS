import axios from 'axios';
import { Badge, Form, InputGroup, Button } from 'react-bootstrap';
import Url from '../../utils/url';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateDishs } from '../../pages/cook/DishsSlice';
import { dishsSelector } from '../../redux/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark, faLightbulb, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { userInfo } from '../../utils/userInfo';

function Search() {
    const dispatch = useDispatch();
    const allDishs = useSelector(dishsSelector); // Lấy tất cả món ăn từ Redux

    const [name, setName] = useState('');
    const [status, setStatus] = useState<number>(3);
    const [type, setType] = useState('');
    const [isReadyToCook, setIsReadyToCook] = useState(false);
    const [ingredientsList, setIngredientsList] = useState<Record<number, any>>({});

    const [listType, setListType] = useState([]);
    const [originalDishs, setOriginalDishs] = useState([]); // Lưu danh sách gốc

    // API call thông thường
    const callApi2 = async (name: string, status: number, type: string) => {
        try {
            const response = await axios.get(Url(`dishs/filter`), {
                params: { name: name, status: status, type: type, userId: userInfo?.id },
            });
            return response.data;
        } catch (error) {
            alert('Không lấy được dish detail!!!');
            return null;
        }
    };

    // Lấy chi tiết nguyên liệu cho tất cả món ăn
    const fetchAllDishesIngredients = async (dishs: any[]) => {
        try {
            const results = await Promise.all(
                dishs.map(dish =>
                    axios.get(Url(`dishs/show/detail/${dish.id}/${userInfo?.id}`))
                )
            );

            const ingredientsData = results.reduce((acc, response, index) => {
                if (response.data) {
                    acc[dishs[index].id] = response.data;
                }
                return acc;
            }, {} as Record<number, any>);

            setIngredientsList(ingredientsData);
            return ingredientsData;
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết nguyên liệu:', error);
            return {};
        }
    };

    // Kiểm tra trạng thái nguyên liệu (copy từ trang Cook)
    const checkIngredientsStatus = (dishId: number, ingredientsData: Record<number, any>) => {
        const dishData = ingredientsData[dishId];
        if (!dishData || !dishData.ingredients || dishData.ingredients.length === 0) {
            return 'no-ingredients';
        }

        const checkQuantities = getCheckQuantities(dishId);
        const allReady = checkQuantities.every((quantity: number) => quantity > 0);
        return allReady ? 'ready' : 'not-ready'; // Sẵn sàng hoặc chưa sẵn sàng
    };

    const getCheckQuantities = (dishId: number) => {
        const dishData = ingredientsList[dishId];
        if (!dishData || !dishData.ingredients || dishData.ingredients.length === 0) {
            return [];
        }
        
        return dishData.ingredients.map((item: any) => item.checkQuantity);
    };

    // Filter món ăn sẵn sàng nấu
    const filterReadyToCookDishs = (dishs: any[], ingredientsData: Record<number, any>) => {
        return dishs.filter(dish => {
            const status = checkIngredientsStatus(dish.id, ingredientsData);
            return status === 'ready';
        });
    };

    // Effect chính để fetch và filter data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Luôn fetch data từ API trước
                const results = await callApi2(name, status, type);
                setOriginalDishs(results || []);

                if (isReadyToCook && results && results.length > 0) {
                    // Nếu đang ở chế độ gợi ý, fetch thêm thông tin nguyên liệu
                    const ingredientsData = await fetchAllDishesIngredients(results);
                    const readyDishs = filterReadyToCookDishs(results, ingredientsData);
                    dispatch(updateDishs(readyDishs));
                } else {
                    // Chế độ bình thường
                    dispatch(updateDishs(results || []));
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [name, status, type, isReadyToCook]);

    // Fetch danh sách loại món ăn
    useEffect(() => {
        axios
            .get(Url(`dish_type`))
            .then((response) => response.data)
            .then((results) => setListType(results))
            .catch((error) => console.log(error));
    }, []);

    // Toggle gợi ý món ăn
    const handleSuggestToggle = async () => {
        const newReadyState = !isReadyToCook;
        setIsReadyToCook(newReadyState);

        if (newReadyState) {
            // Bật gợi ý: lọc từ danh sách hiện tại
            setStatus(1); // Chỉ món ăn hoạt động

            if (originalDishs.length > 0) {
                const ingredientsData = await fetchAllDishesIngredients(originalDishs);
                const readyDishs = filterReadyToCookDishs(originalDishs, ingredientsData);
                dispatch(updateDishs(readyDishs));
            }
        } else {
            // Tắt gợi ý: hiển thị lại danh sách gốc
            setStatus(3);
        }
    };

    // Reset tất cả filter
    const resetFilters = () => {
        setName('');
        setStatus(3);
        setType('');
        setIsReadyToCook(false);
    };

    return (
        <div className="mb-3 me-3">
            <Form>
                {/* Thông báo trạng thái gợi ý */}
                {isReadyToCook && (
                    <div className="d-flex align-items-center bg-light-success p-2 rounded mb-2">
                        <FontAwesomeIcon 
                            icon={faLightbulb} 
                            className="text-success me-2 fs-5" 
                        />
                        <div>
                            <strong className="text-success">Đang hiển thị món ăn sẵn sàng nấu</strong>
                            <div className="text-muted small">
                                Những món ăn có đủ nguyên liệu trong kho để bạn có thể nấu ngay
                            </div>
                        </div>
                    </div>
                )}

                <div className="d-flex align-items-center gap-3">
                    {/* Tên món ăn - chiếm 35% */}
                    <div style={{ width: '35%' }}>
                        <InputGroup size="lg">
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên món ăn"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </InputGroup>
                    </div>

                    {/* Kiểu món ăn - chiếm 30% */}
                    <div style={{ width: '30%' }}>
                        <InputGroup size="lg">
                            <InputGroup.Text>Kiểu món ăn</InputGroup.Text>
                            <Form.Select 
                                value={type}
                                onChange={(e) => setType(e.currentTarget.value)}
                            >
                                <option value="">ALL</option>
                                {listType.map((type, index) => (
                                    <option value={type} key={index}>
                                        {type}
                                    </option>
                                ))}
                            </Form.Select>
                        </InputGroup>
                    </div>

                    {/* Nút gợi ý và thông báo - chiếm 20% */}
                    <div style={{ width: '20%' }} className="position-relative">
                        <Button
                            variant={isReadyToCook ? "success" : "outline-success"}
                            size="lg"
                            onClick={handleSuggestToggle}
                            className="w-100 py-2"
                        >
                            <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                            {isReadyToCook ? 'Đang gợi ý' : 'Gợi ý món ăn'}
                        </Button>
                        
                        {isReadyToCook && (
                            <div className="text-center mt-1 position-absolute w-100">
                                <Badge bg="success" pill className="px-2">
                                    <FontAwesomeIcon icon={faUtensils} className="me-1" />
                                    {allDishs.length} món có sẵn
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            </Form>
        </div>
    );
}

export default Search;
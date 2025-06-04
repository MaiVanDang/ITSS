import {
    faArrowLeft,
    faHeart,
    faMagnifyingGlass,
    faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Form, Image, InputGroup, Row, Tab, Table, Tabs } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { userInfo } from '../../utils/userInfo';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dishsSelector, ingredientsSelector } from '../../redux/selectors';
import axios from 'axios';
import Url from '../../utils/url';
import { updateIngredients } from '../ingredient/IngredientSlice';
import { dishsProps, ingredientProps } from '../../utils/interface/Interface';
import { updateDishs } from '../cook/DishsSlice';
import moment from 'moment';

// Interface để track nguyên liệu từ món ăn
interface DishIngredientItem {
    ingredientId: number;
    baseQuantity: number;
    measure: string;
}

function AddMarketOrder() {
    const today = new Date().toISOString().split('T')[0];
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const listIngredients = useSelector(ingredientsSelector);
    const listDishes = useSelector(dishsSelector);

    const [code, setCode] = useState('');

    // Tab ingredients
    const [name, setName] = useState('');
    const [showResultIngredient, setShowResultIngredient] = useState(false);
    const [ingredientsSelected, setIngredientsSelected] = useState<ingredientProps[]>([]);
    const [measureIngredient, setMeasureIngredient] = useState<string[]>([]);
    const [quantityIngredient, setQuantityIngredient] = useState<string[]>([]);

    // Tab dishes
    const [nameDish, setNameDish] = useState('');
    const [showResultDish, setShowResultDish] = useState(false);
    const [dishSelected, setDishSelected] = useState<dishsProps[]>([]);
    const [cookDate, setCookDate] = useState<string[]>([]);
    const [expireDate, setExpireDate] = useState<string[]>([]);
    const [quantityDish, setQuantityDish] = useState<string[]>([]);

    // Thêm state để track nguyên liệu từ món ăn nào
    const [dishIngredientMapping, setDishIngredientMapping] = useState<{[dishId: number]: DishIngredientItem[]}>({});
    const [ingredientSources, setIngredientSources] = useState<{[ingredientId: number]: {
        manual: number; // Số lượng thêm thủ công
        fromDishes: {[dishId: number]: number}; // Số lượng từ từng món ăn
    }}>({});

    const callApi2 = async (name: string) => {
        try {
            const response = await axios.get(Url(`ingredient/search`), {
                params: { name: name, status: 1 },
            });
            return response.data;
        } catch (error) {
            alert('Không tìm được nguyên liệu!!!');
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await callApi2(name);
                dispatch(updateIngredients(results));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [name]);

    const callApiDish = async (name: string) => {
        try {
            const response = await axios.get(Url(`dishs/filter`), {
                params: { name: name, status: 1, type: '', userId: userInfo?.id },
            });
            console.log(response.data);
            return response.data;
        } catch (error) {
            alert('Không chọn được món ăn!!!');
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await callApiDish(nameDish);
                dispatch(updateDishs(results));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [nameDish]);

    // Hàm tính tổng số lượng nguyên liệu từ tất cả nguồn
    const calculateTotalQuantity = (ingredientId: number): number => {
        const sources = ingredientSources[ingredientId];
        if (!sources) return 0;

        let total = sources.manual || 0;
        Object.values(sources.fromDishes || {}).forEach(quantity => {
            total += quantity;
        });
        return total;
    };

    // Hàm cập nhật số lượng nguyên liệu trong bảng
    const updateIngredientQuantityInTable = (ingredientId: number) => {
        const ingredientIndex = ingredientsSelected.findIndex(ing => ing.id === ingredientId);
        if (ingredientIndex !== -1) {
            const newQuantity = [...quantityIngredient];
            newQuantity[ingredientIndex] = calculateTotalQuantity(ingredientId).toString();
            setQuantityIngredient(newQuantity);
        }
    };

    const handleClickItemIngredient = (item: ingredientProps) => {
        if (!ingredientsSelected.some(ingredient => ingredient.id === item.id)) {
            setIngredientsSelected((prev) => [...prev, item]);
            setMeasureIngredient((prev) => [...prev, '']);
            setQuantityIngredient((prev) => [...prev, '0']);
            
            // Khởi tạo tracking cho nguyên liệu mới
            setIngredientSources(prev => ({
                ...prev,
                [item.id]: {
                    manual: 0,
                    fromDishes: {}
                }
            }));
        }
    };

    const handleDeleteIngredient = (id: number) => {
        const indexToDelete = ingredientsSelected.findIndex(item => item.id === id);
        if (indexToDelete !== -1) {
            // Xóa ingredient
            const newIngredientsSelected = ingredientsSelected.filter((item) => item.id !== id);
            setIngredientsSelected(newIngredientsSelected);
            
            // Xóa measure và quantity tương ứng
            const newMeasure = [...measureIngredient];
            const newQuantity = [...quantityIngredient];
            newMeasure.splice(indexToDelete, 1);
            newQuantity.splice(indexToDelete, 1);
            setMeasureIngredient(newMeasure);
            setQuantityIngredient(newQuantity);

            // Xóa tracking
            const newIngredientSources = { ...ingredientSources };
            delete newIngredientSources[id];
            setIngredientSources(newIngredientSources);
        }
    };

    // Hàm thêm nguyên liệu từ món ăn
    const addIngredientsFromDish = async (dishId: number, dishQuantity: number) => {
        try {
            const response = await axios.get(Url(`dishs/show/detail/${dishId}/${userInfo?.id}`));
            if (!response.data || !response.data.ingredients) return;

            const dishIngredients = response.data.ingredients;
            const dishIngredientItems: DishIngredientItem[] = [];

            // Cập nhật mapping cho món ăn này
            dishIngredients.forEach((item: any) => {
                const ingredient = item.ingredient;
                const baseQuantity = parseFloat(item.quantity?.toString() || '0');
                const measure = item.measure || '';

                dishIngredientItems.push({
                    ingredientId: ingredient.id,
                    baseQuantity,
                    measure
                });

                // Kiểm tra xem nguyên liệu đã có trong danh sách chưa
                const existingIndex = ingredientsSelected.findIndex(selected => selected.id === ingredient.id);
                
                if (existingIndex === -1) {
                    // Thêm nguyên liệu mới
                    setIngredientsSelected(prev => [...prev, ingredient]);
                    setMeasureIngredient(prev => [...prev, measure]);
                    setQuantityIngredient(prev => [...prev, (baseQuantity * dishQuantity).toString()]);
                    
                    // Khởi tạo tracking
                    setIngredientSources(prev => ({
                        ...prev,
                        [ingredient.id]: {
                            manual: 0,
                            fromDishes: { [dishId]: baseQuantity * dishQuantity }
                        }
                    }));
                } else {
                    // Cập nhật nguyên liệu đã có
                    setIngredientSources(prev => ({
                        ...prev,
                        [ingredient.id]: {
                            ...prev[ingredient.id],
                            fromDishes: {
                                ...prev[ingredient.id]?.fromDishes,
                                [dishId]: baseQuantity * dishQuantity
                            }
                        }
                    }));
                    
                    // Cập nhật số lượng trong bảng
                    setTimeout(() => updateIngredientQuantityInTable(ingredient.id), 0);
                }
            });

            // Lưu mapping cho món ăn
            setDishIngredientMapping(prev => ({
                ...prev,
                [dishId]: dishIngredientItems
            }));

        } catch (error) {
            console.error('Lỗi khi lấy chi tiết món ăn:', error);
        }
    };

    const handleClickItemDish = async (item: dishsProps) => {
        if (!dishSelected.some(dish => dish.id === item.id)) {
            setDishSelected((prev) => [...prev, item]);
            setCookDate((prev) => [...prev, '']);
            setExpireDate((prev) => [...prev, '']);
            setQuantityDish((prev) => [...prev, '1']);
            
            // Thêm nguyên liệu từ món ăn
            await addIngredientsFromDish(item.id, 1);
        }
    };

    const handleDeleteDish = (id: number) => {
        const indexToDelete = dishSelected.findIndex(item => item.id === id);
        if (indexToDelete !== -1) {
            // Xóa dish
            const newDishSelected = dishSelected.filter((item) => item.id !== id);
            setDishSelected(newDishSelected);
            
            // Xóa các thông tin tương ứng
            const newCookDate = [...cookDate];
            const newExpireDate = [...expireDate];
            const newQuantityDish = [...quantityDish];
            newCookDate.splice(indexToDelete, 1);
            newExpireDate.splice(indexToDelete, 1);
            newQuantityDish.splice(indexToDelete, 1);
            setCookDate(newCookDate);
            setExpireDate(newExpireDate);
            setQuantityDish(newQuantityDish);

            // Xóa nguyên liệu từ món ăn này
            const dishIngredientItems = dishIngredientMapping[id] || [];
            const updatedIngredientSources = { ...ingredientSources };
            const ingredientsToRemove: number[] = [];

            dishIngredientItems.forEach(item => {
                if (updatedIngredientSources[item.ingredientId]) {
                    // Xóa contribution từ món ăn này
                    delete updatedIngredientSources[item.ingredientId].fromDishes[id];
                    
                    // Kiểm tra xem nguyên liệu này còn được sử dụng không
                    const hasManual = updatedIngredientSources[item.ingredientId].manual > 0;
                    const hasOtherDishes = Object.keys(updatedIngredientSources[item.ingredientId].fromDishes).length > 0;
                    
                    if (!hasManual && !hasOtherDishes) {
                        ingredientsToRemove.push(item.ingredientId);
                    }
                }
            });

            // Xóa nguyên liệu không còn sử dụng
            let newIngredientsSelected = [...ingredientsSelected];
            let newMeasureIngredient = [...measureIngredient];
            let newQuantityIngredient = [...quantityIngredient];

            ingredientsToRemove.forEach(ingredientId => {
                const index = newIngredientsSelected.findIndex(ing => ing.id === ingredientId);
                if (index !== -1) {
                    newIngredientsSelected.splice(index, 1);
                    newMeasureIngredient.splice(index, 1);
                    newQuantityIngredient.splice(index, 1);
                    delete updatedIngredientSources[ingredientId];
                }
            });

            setIngredientsSelected(newIngredientsSelected);
            setMeasureIngredient(newMeasureIngredient);
            setQuantityIngredient(newQuantityIngredient);
            setIngredientSources(updatedIngredientSources);

            // Cập nhật số lượng cho nguyên liệu còn lại
            dishIngredientItems.forEach(item => {
                if (!ingredientsToRemove.includes(item.ingredientId)) {
                    updateIngredientQuantityInTable(item.ingredientId);
                }
            });

            // Xóa mapping
            const newDishIngredientMapping = { ...dishIngredientMapping };
            delete newDishIngredientMapping[id];
            setDishIngredientMapping(newDishIngredientMapping);
        }
    };

    // Hàm xử lý thay đổi số lượng món ăn
    const handleDishQuantityChange = (dishId: number, newQuantity: number, dishIndex: number) => {
        // Cập nhật số lượng món ăn
        const updatedQuantityDish = [...quantityDish];
        updatedQuantityDish[dishIndex] = newQuantity.toString();
        setQuantityDish(updatedQuantityDish);

        // Cập nhật số lượng nguyên liệu từ món ăn này
        const dishIngredientItems = dishIngredientMapping[dishId] || [];
        const updatedIngredientSources = { ...ingredientSources };

        dishIngredientItems.forEach(item => {
            if (!updatedIngredientSources[item.ingredientId]) {
                updatedIngredientSources[item.ingredientId] = {
                    manual: 0,
                    fromDishes: {}
                };
            }
            updatedIngredientSources[item.ingredientId].fromDishes[dishId] = item.baseQuantity * newQuantity;
        });

        // Cập nhật state ingredientSources
        setIngredientSources(updatedIngredientSources);

        // Cập nhật số lượng trong bảng nguyên liệu
        const updatedQuantityIngredient = [...quantityIngredient];
        ingredientsSelected.forEach((ingredient, index) => {
            const total = calculateTotalQuantity(ingredient.id);
            updatedQuantityIngredient[index] = total.toString();
        });
        setQuantityIngredient(updatedQuantityIngredient);
    };

    // Hàm xử lý thay đổi số lượng nguyên liệu thủ công
    const handleManualIngredientQuantityChange = (ingredientId: number, value: string, index: number) => {
        const newValue = parseFloat(value) || 0;
        const currentTotal = calculateTotalQuantity(ingredientId);
        const currentManual = ingredientSources[ingredientId]?.manual || 0;
        const fromDishesTotal = currentTotal - currentManual;
        
        const newManual = Math.max(0, newValue - fromDishesTotal);

        setIngredientSources(prev => ({
            ...prev,
            [ingredientId]: {
                ...prev[ingredientId],
                manual: newManual
            }
        }));

        // Cập nhật ngay giá trị hiển thị
        const updatedQuantityIngredient = [...quantityIngredient];
        updatedQuantityIngredient[index] = value;
        setQuantityIngredient(updatedQuantityIngredient);
    };

    const [listMeasure, setListMeasure] = useState<any[]>([]);

    useEffect(() => {
        const fetchMeasure = async () => {
            try {
                const result = await axios.get(Url('market/attribute/measures'));
                setListMeasure(result.data);
            } catch (error) {
                alert(error);
            }
        };
        fetchMeasure();
    }, []);

    const handleSubmit = async () => {
        // Format dataSubmit trước khi post Api
        const dataSubmit: any = {};
        dataSubmit.code = code;
        dataSubmit.user = userInfo;

        dataSubmit.attributes = [];
        ingredientsSelected.forEach((ingredient, index) => {
            dataSubmit.attributes.push({
                user: userInfo,
                ingredients: ingredient,
                measure: measureIngredient[index],
                quantity: quantityIngredient[index],
            });
        });

        dataSubmit.dishes = [];
        dishSelected.forEach((dish, index) => {
            dataSubmit.dishes.push({
                dish,
                expride: expireDate[index],
                cook_status: 0,
                cookDate: cookDate[index],
                quantity: quantityDish[index],
            });
        });

        // Gọi api tạo đơn đi chợ
        try {
            await axios.post(Url('market'), dataSubmit);
            alert('Tạo đơn đi chợ thành công!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn');
        }

        setTimeout(() => {
            navigate('/market');
        }, 200);
    };

    return (
        <div>
            <div className="mb-3 d-flex justify-content-between">
                <div className="d-flex">
                    <Link to="/market" className="me-3 text-dark">
                        <FontAwesomeIcon icon={faArrowLeft} size="2xl" className="p-2" />
                    </Link>
                    <h2>Tạo đơn đi chợ</h2>
                </div>
                <Button className="fs-5 me-3" style={{ width: '10%' }} onClick={handleSubmit}>
                    Tạo đơn
                </Button>
            </div>
            <Form className="me-3">
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="codeMarketOrder">
                            <Form.Label>Mã đơn</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="SH..."
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="codeMarketOrder">
                            <Form.Label>Người tạo đơn</Form.Label>
                            <Form.Control disabled type="text" value={userInfo?.name} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="codeMarketOrder">
                            <Form.Label>Ngày tạo đơn</Form.Label>
                            <Form.Control
                                disabled
                                type="date"
                                value={moment(new Date()).format('YYYY-MM-DD')}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>

            <hr />

            <Tabs defaultActiveKey="home" id="justify-tab-example" className="mb-3">

                {/* Tab nguyên liệu */}
                <Tab eventKey="home" title="Nguyên liệu">
                    <InputGroup className="position-relative" size="lg" style={{ width: '40%' }}>
                        <InputGroup.Text id="basic-addon1">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tên nguyên liệu"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={() => setShowResultIngredient(true)}
                            onBlur={() =>
                                setTimeout(() => {
                                    setShowResultIngredient(false);
                                }, 200)
                            }
                        />
                        {showResultIngredient && (
                            <div
                                className="position-absolute bg-light top-110 start-0 end-0 border border-dark-subtle overflow-y-scroll"
                                style={{ maxHeight: '15rem' }}
                            >
                                {listIngredients.map((item, index) => (
                                    <div
                                        className="hover p-1 d-flex align-items-center border"
                                        key={index}
                                        onClick={() => handleClickItemIngredient(item)}
                                    >
                                        <Image
                                            src={item.image}
                                            alt="item"
                                            style={{ width: '3rem', height: '3rem' }}
                                        />
                                        <div className="ms-3">{item.name}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </InputGroup>

                    <Table bordered className="mt-3">
                        <thead className="fs-5 ">
                            <tr>
                                <th>STT</th>
                                <th>Ảnh</th>
                                <th>Tên nguyên liệu</th>
                                <th>Đơn vị tính</th>
                                <th>Số lượng</th>
                                <th className="text-center">Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredientsSelected.map((ingredient, index) => (
                                <tr key={ingredient.id}>
                                    <td style={{ width: '5%' }}>{index + 1}</td>
                                    <td>
                                        <img
                                            src={ingredient.image}
                                            alt="anh"
                                            style={{ height: '3rem', width: '3rem' }}
                                        />
                                    </td>
                                    <td>{ingredient.name}</td>
                                    <td style={{ width: '15%' }}>
                                        <Form.Group controlId={`measure-${ingredient.id}`}>
                                            <Form.Control
                                                type="text"
                                                list="listMeasure"
                                                value={measureIngredient[index] || ''}
                                                onChange={(e) => {
                                                    const updatedMeasureIngredient = [...measureIngredient];
                                                    updatedMeasureIngredient[index] = e.target.value;
                                                    setMeasureIngredient(updatedMeasureIngredient);
                                                }}
                                            />
                                        </Form.Group>
                                        <datalist id="listMeasure">
                                            {listMeasure.map((measure: any, index: any) => (
                                                <option value={measure} key={index}>
                                                    {measure}
                                                </option>
                                            ))}
                                        </datalist>
                                    </td>
                                    <td style={{ width: '15%' }}>
                                        <Form.Group controlId={`quantity-${ingredient.id}`}>
                                            <Form.Control
                                                type="number"
                                                value={quantityIngredient[index] || ''}
                                                onChange={(e) => {
                                                    handleManualIngredientQuantityChange(ingredient.id, e.target.value, index);
                                                }}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td className="text-center">
                                        <div
                                            onClick={() => {
                                                handleDeleteIngredient(ingredient.id);
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                className="mt-2 p-1"
                                                size="xl"
                                                icon={faTrashCan}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Tab>

                {/* Tab món ăn */}
                <Tab eventKey="profile" title="Món ăn">
                    <InputGroup className="position-relative" size="lg" style={{ width: '40%' }}>
                        <InputGroup.Text id="basic-addon2">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tên món ăn"
                            value={nameDish}
                            onChange={(e) => setNameDish(e.target.value)}
                            onFocus={() => setShowResultDish(true)}
                            onBlur={() =>
                                setTimeout(() => {
                                    setShowResultDish(false);
                                }, 200)
                            }
                        />
                        {showResultDish && (
                            <div
                                className="position-absolute bg-light top-110 start-0 end-0 border border-dark-subtle overflow-y-scroll"
                                style={{ maxHeight: '15rem' }}
                            >
                                {listDishes.map((item, index) => (
                                    <div
                                        className="hover p-1 d-flex align-items-center justify-content-between border"
                                        key={index}
                                        onClick={() => handleClickItemDish(item)}
                                    >
                                        <div className="d-flex align-items-center p-1 ">
                                            <Image
                                                src={item.image}
                                                alt="item"
                                                style={{ width: '3rem', height: '3rem' }}
                                            />
                                            <div className="ms-3">{item.name}</div>
                                        </div>

                                        <div>
                                            {item.favorite === 1 ? (
                                                <FontAwesomeIcon
                                                    size="lg"
                                                    className="p-1 me-2"
                                                    icon={faHeart}
                                                    style={{ color: '#d91717' }}
                                                />
                                            ) : (
                                                <div></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </InputGroup>

                    <Table bordered className="mt-3">
                        <thead className="fs-5 ">
                            <tr>
                                <th>STT</th>
                                <th>Ảnh</th>
                                <th>Tên món ăn</th>
                                <th>Ngày nấu</th>
                                <th>Ngày hết hạn</th>
                                <th>Số lượng</th>
                                <th className="text-center">Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dishSelected.map((dish, index) => (
                                <tr key={dish.id}>
                                    <td style={{ width: '5%' }}>{index + 1}</td>
                                    <td>
                                        <img
                                            src={dish.image}
                                            alt="anh"
                                            style={{ height: '3rem', width: '3rem' }}
                                        />
                                    </td>
                                    <td>{dish.name}</td>
                                    <td style={{ width: '15%' }}>
                                        <Form.Group controlId={`cook-${dish.id}`}>
                                            <Form.Control
                                                type="date"
                                                min={today}
                                                value={cookDate[index] || ''}
                                                onChange={(e) => {
                                                    const updatedCookDate = [...cookDate];
                                                    updatedCookDate[index] = e.target.value;
                                                    setCookDate(updatedCookDate);
                                                }}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td style={{ width: '15%' }}>
                                        <Form.Group controlId={`expire-${dish.id}`}>
                                            <Form.Control
                                                type="date"
                                                min={today}
                                                value={expireDate[index] || ''}
                                                onChange={(e) => {
                                                    const updatedExpireDate = [...expireDate];
                                                    updatedExpireDate[index] = e.target.value;
                                                    setExpireDate(updatedExpireDate);
                                                }}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td style={{ width: '15%' }}>
                                        <Form.Group controlId={`quantityDish-${dish.id}`}>
                                            <Form.Control
                                                type="number"
                                                min={1}
                                                value={quantityDish[index] || ''}
                                                onChange={(e) => {
                                                    const newQuantity = parseInt(e.target.value) || 1;
                                                    handleDishQuantityChange(dish.id, newQuantity, index);
                                                }}
                                            />
                                        </Form.Group>
                                    </td>
                                    <td className="text-center">
                                        <div
                                            onClick={() => {
                                                handleDeleteDish(dish.id);
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                className="mt-2 p-1"
                                                size="xl"
                                                icon={faTrashCan}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Tab>
            </Tabs>
        </div>
    );
}

export default AddMarketOrder;
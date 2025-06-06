import axios from 'axios';
import { Badge, Form, InputGroup, Button, Modal, Alert } from 'react-bootstrap';
import Url from '../../utils/url';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateDishs } from '../../pages/cook/DishsSlice';
import { dishsSelector } from '../../redux/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faLightbulb, faUtensils, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { userInfo } from '../../utils/userInfo';

import React from 'react';
import { convertToBaseUnit } from '../../utils/convertUnit';

interface SearchCookProps {
    onFilterContextChange: (readyToCook: boolean, groupCooking: boolean, groupName: string) => void;
}

function Search({ onFilterContextChange }: SearchCookProps) {
    const dispatch = useDispatch();
    const allDishs = useSelector(dishsSelector);

    const [name, setName] = useState('');
    const [status, setStatus] = useState<number>(3);
    const [type, setType] = useState('');
    const [isReadyToCook, setIsReadyToCook] = useState(false);
    const [ingredientsList, setIngredientsList] = useState<Record<number, any>>({});

    // States cho modal chọn chế độ nấu ăn
    const [showCookingModeModal, setShowCookingModeModal] = useState(false);
    const [isGroupCooking, setIsGroupCooking] = useState(false);
    const [selectedGroupName, setSelectedGroupName] = useState('');
    const [cookingMode, setCookingMode] = useState<'personal' | 'group' | null>(null);
    const [groupName, setGroupName] = useState('');
    const [modalError, setModalError] = useState('');

    const [listType, setListType] = useState([]);
    const [originalDishs, setOriginalDishs] = useState([]);

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

    // Kiểm tra trạng thái nguyên liệu dựa trên chế độ nấu ăn
    const checkIngredientsStatus = (dishId: number, ingredientsData: Record<number, any>) => {
        const dishData = ingredientsData[dishId];
        if (!dishData || !dishData.ingredients || dishData.ingredients.length === 0) {
            return 'no-ingredients';
        }

        const checkQuantities = getCheckQuantities(dishId, ingredientsData);
        const allReady = checkQuantities.every((quantity: number) => quantity > 0);
        return allReady ? 'ready' : 'not-ready';
    };

    const filterReadyToCookDishs = (dishs: any[], ingredientsData: Record<number, any>) => {

        const result = dishs.filter(dish => {
            const dishData = ingredientsData[dish.id];
            if (!dishData || !dishData.ingredients || dishData.ingredients.length === 0) {
                return false;
            }


            // Kiểm tra TẤT CẢ nguyên liệu đều phải đủ
            const allIngredientsReady = dishData.ingredients.every((ingredient: any, index: number) => {

                if (!ingredient.supportDishDto || ingredient.supportDishDto.length === 0) {
                    return false; // Không có thông tin support thì không đủ
                }

                const requiredQuantity = convertToBaseUnit(ingredient.measure, ingredient.quantity);
                let totalAvailable = 0;


                ingredient.supportDishDto.forEach((support: any, supIndex: number) => {

                    let shouldInclude = false;

                    if (isGroupCooking && selectedGroupName) {
                        // NẤU ĂN NHÓM: Gộp cả nguyên liệu từ nhóm + cá nhân
                        const positionName = support.positionName;

                        // Kiểm tra nguyên liệu từ nhóm được chọn - SỬA LẠI LOGIC
                        const isTargetGroup =
                            positionName === selectedGroupName ||
                            positionName === `Nhóm ${selectedGroupName}` ||
                            positionName.toLowerCase().includes(selectedGroupName.toLowerCase());

                        // Kiểm tra nguyên liệu từ kho cá nhân
                        const isPersonal = positionName === "Kho cá nhân" ||
                            positionName === "Tủ lạnh cá nhân";

                        shouldInclude = isTargetGroup || isPersonal;
                    } else {
                        // NẤU ĂN CÁ NHÂN: Chỉ dùng nguyên liệu cá nhân
                        shouldInclude = support.positionName === "Kho cá nhân" ||
                            support.positionName === "Tủ lạnh cá nhân";
                    }

                    if (shouldInclude) {
                        totalAvailable += convertToBaseUnit(support.measure, support.quantityDoublePresent);
                    }
                });

                const hasEnough = totalAvailable >= requiredQuantity;

                return hasEnough;
            });

            return allIngredientsReady;
        });

        return result;
    };

    const getCheckQuantities = (dishId: number, ingredientsData: Record<number, any>) => {
        const dishData = ingredientsData[dishId];
        if (!dishData || !dishData.ingredients || dishData.ingredients.length === 0) {
            return [];
        }

        return dishData.ingredients.map((item: any) => {
            const requiredQuantity = item.quantity;

            if (!item.supportDishDto || item.supportDishDto.length === 0) {
                return 0;
            }

            let totalAvailable = 0;

            if (isGroupCooking && selectedGroupName) {
                // NẤU ĂN NHÓM: Tính tổng từ cả nhóm + cá nhân
                totalAvailable = item.supportDishDto
                    .filter((support: any) => {
                        const positionName = support.positionName;

                        // Nguyên liệu từ nhóm được chọn - SỬA LẠI LOGIC
                        const isTargetGroup =
                            positionName === selectedGroupName ||
                            positionName === `Nhóm ${selectedGroupName}` ||
                            positionName.toLowerCase().includes(selectedGroupName.toLowerCase());

                        // Nguyên liệu từ kho cá nhân
                        const isPersonal = positionName === "Kho cá nhân" ||
                            positionName === "Tủ lạnh cá nhân";

                        return isTargetGroup || isPersonal;
                    })
                    .reduce((total: number, support: any) => total + support.quantityDoublePresent, 0);
            } else {
                // NẤU ĂN CÁ NHÂN: Chỉ tính từ kho cá nhân
                totalAvailable = item.supportDishDto
                    .filter((support: any) => {
                        const isPersonal = support.positionName === "Kho cá nhân" ||
                            support.positionName === "Tủ lạnh cá nhân";
                        return isPersonal;
                    })
                    .reduce((total: number, support: any) => total + support.quantityDoublePresent, 0);
            }

            return totalAvailable >= requiredQuantity ? 1 : 0;
        });
    };

    // Effect chính để fetch và filter data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await callApi2(name, status, type);
                setOriginalDishs(results || []);

                if (isReadyToCook && results && results.length > 0) {
                    const ingredientsData = await fetchAllDishesIngredients(results);
                    const readyDishs = filterReadyToCookDishs(results, ingredientsData);
                    dispatch(updateDishs(readyDishs));
                } else {
                    dispatch(updateDishs(results || []));
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [name, status, type, isReadyToCook, isGroupCooking, selectedGroupName]);

    // Fetch danh sách loại món ăn
    useEffect(() => {
        axios
            .get(Url(`dish_type`))
            .then((response) => response.data)
            .then((results) => setListType(results))
            .catch((error) => console.log(error));
    }, []);

    useEffect(() => {
        // Thông báo cho component parent về thay đổi filter context
        onFilterContextChange(isReadyToCook, isGroupCooking, selectedGroupName);
    }, [isReadyToCook, isGroupCooking, selectedGroupName, onFilterContextChange]);
    // Toggle gợi ý món ăn - hiện modal chọn chế độ
    const handleSuggestToggle = async () => {
        if (!isReadyToCook) {
            // Bật gợi ý: hiện modal chọn chế độ
            setShowCookingModeModal(true);
        } else {
            // Tắt gợi ý: reset về trạng thái ban đầu
            setIsReadyToCook(false);
            setIsGroupCooking(false);
            setSelectedGroupName('');
            setStatus(3);
        }
    };

    // Xử lý xác nhận chế độ nấu ăn từ modal
    const handleCookingModeConfirm = async (isGroup: boolean, groupName?: string) => {
        setIsGroupCooking(isGroup);
        setSelectedGroupName(groupName || '');
        setIsReadyToCook(true);
        setStatus(1); // Chỉ món ăn hoạt động
        setShowCookingModeModal(false);

        // Thông báo cho component parent
        onFilterContextChange(true, isGroup, groupName || '');

        // Lọc món ăn ngay sau khi chọn chế độ
        if (originalDishs.length > 0) {
            const ingredientsData = await fetchAllDishesIngredients(originalDishs);
            const readyDishs = filterReadyToCookDishs(originalDishs, ingredientsData);
            dispatch(updateDishs(readyDishs));
        }
    };

    // Xử lý đóng modal
    const handleCookingModeClose = () => {
        setShowCookingModeModal(false);
        setCookingMode(null);
        setGroupName('');
        setModalError('');
    };

    // Xử lý xác nhận trong modal
    const handleModalConfirm = () => {
        setModalError('');

        if (!cookingMode) {
            setModalError('Vui lòng chọn chế độ nấu ăn');
            return;
        }

        if (cookingMode === 'group') {
            if (!groupName.trim()) {
                setModalError('Vui lòng nhập tên nhóm');
                return;
            }
            handleCookingModeConfirm(true, groupName.trim());
        } else {
            handleCookingModeConfirm(false);
        }

        // Reset form
        setCookingMode(null);
        setGroupName('');
        setModalError('');
    };

    // Reset tất cả filter
    const resetFilters = () => {
        setName('');
        setStatus(3);
        setType('');
        setIsReadyToCook(false);
        setIsGroupCooking(false);
        setSelectedGroupName('');

        // Thông báo cho component parent
        onFilterContextChange(false, false, '');
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
                            <strong className="text-success">
                                {isGroupCooking
                                    ? `Đang hiển thị món ăn sẵn sàng nấu cho nhóm: ${selectedGroupName}`
                                    : 'Đang hiển thị món ăn sẵn sàng nấu cá nhân'
                                }
                            </strong>
                            <div className="text-muted small">
                                {isGroupCooking
                                    ? `Những món ăn có đủ nguyên liệu trong kho nhóm ${selectedGroupName} + kho cá nhân`
                                    : 'Những món ăn có đủ nguyên liệu trong kho cá nhân của bạn'
                                }
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

            {/* Modal chọn chế độ nấu ăn */}
            <Modal
                show={showCookingModeModal}
                onHide={handleCookingModeClose}
                backdrop="static"
                keyboard={false}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faUtensils} className="me-2 text-primary" />
                        Chọn chế độ nấu ăn
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="mb-4">
                        <p className="text-muted mb-3">
                            Bạn muốn tìm món ăn để nấu cho ai?
                        </p>

                        {modalError && (
                            <Alert variant="danger" className="mb-3">
                                {modalError}
                            </Alert>
                        )}

                        <div className="d-grid gap-2">
                            <div
                                className={`border rounded p-3 cursor-pointer ${cookingMode === 'personal' ? 'border-primary bg-light' : 'border-secondary'
                                    }`}
                                onClick={() => setCookingMode('personal')}
                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <div className="d-flex align-items-center">
                                    <Form.Check
                                        type="radio"
                                        name="cookingMode"
                                        checked={cookingMode === 'personal'}
                                        onChange={() => setCookingMode('personal')}
                                        className="me-3"
                                    />
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-2">
                                            <FontAwesomeIcon icon={faUser} className="me-2 text-info" />
                                            <strong>Nấu ăn cá nhân</strong>
                                        </div>
                                        <small className="text-muted">
                                            Tìm món ăn có đủ nguyên liệu trong kho cá nhân của bạn
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`border rounded p-3 cursor-pointer ${cookingMode === 'group' ? 'border-primary bg-light' : 'border-secondary'
                                    }`}
                                onClick={() => setCookingMode('group')}
                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <div className="d-flex align-items-center">
                                    <Form.Check
                                        type="radio"
                                        name="cookingMode"
                                        checked={cookingMode === 'group'}
                                        onChange={() => setCookingMode('group')}
                                        className="me-3"
                                    />
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-2">
                                            <FontAwesomeIcon icon={faUsers} className="me-2 text-success" />
                                            <strong>Nấu ăn cho nhóm</strong>
                                        </div>
                                        <small className="text-muted">
                                            Tìm món ăn có đủ nguyên liệu trong kho nhóm
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {cookingMode === 'group' && (
                            <div className="mt-3">
                                <Form.Group>
                                    <Form.Label>
                                        <strong>Tên nhóm muốn nấu ăn</strong>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tên nhóm..."
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        className="mt-2"
                                    />
                                    <Form.Text className="text-muted">
                                        Hệ thống sẽ tìm món ăn có đủ nguyên liệu trong kho của nhóm này
                                    </Form.Text>
                                </Form.Group>
                            </div>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCookingModeClose}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleModalConfirm}>
                        Xác nhận
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Search;
import axios from 'axios';
import { Badge, Button, Modal, Image, Table, Tabs, Tab, Form, Toast } from 'react-bootstrap';
import Url from '../../utils/url';
import { useEffect, useState } from 'react';
import { shoppingProps, userInfoProps } from '../../utils/interface/Interface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToiletPortable } from '@fortawesome/free-solid-svg-icons';
import { userInfo } from '../../utils/userInfo';

interface ModalDetailMarketOrderProps {
    show: boolean;
    hide: () => void;
    indexOrder: number;
    leaderId?: number;
    listMember?: userInfoProps[];
    fridgeId?: number;
}

function ModalDetailMarketOrder({
    show,
    hide,
    indexOrder,
    leaderId,
    listMember,
    fridgeId,
}: ModalDetailMarketOrderProps) {
    const [reload, setReload] = useState(0);
    const [shopping, setShopping] = useState<shoppingProps>({} as shoppingProps);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    const callApi = async () => {
        if (indexOrder === 0) return null;

        try {
            const response = await axios.get(Url(`market/show/detail/${indexOrder}`));
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await callApi();
                setShopping(results);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [show, reload, indexOrder]);

    const handleChangeAttributeStatus = async (
        status: 1 | 0 | null,
        ingredientId: number,
        measure: string,
    ) => {
        if (status === 1) {
            try {
                await axios.put(Url(`market/remove`), {
                    id: indexOrder,
                    attributeId: ingredientId,
                    measure,
                });
                setReload(Math.random());
            } catch (error) {
                console.log(error);
            }
        }
        if (status === 0) {
            try {
                await axios.put(Url(`market/active`), {
                    id: indexOrder,
                    attributeId: ingredientId,
                    measure,
                });
                setReload(Math.random());
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleChangeUserBuy = async (id: number, userId: string) => {
        try {
            await axios.put(Url(`group/attribute`), {
                id,
                userId: parseInt(userId),
            });
            setReload(Math.random());
        } catch (error: any) {
            console.log(error);
            alert(error.response.data.message);
        }
    };

    // Kiểm tra xem nguyên liệu có phải là gia vị hoặc gạo không
    const isSpiceOrRice = (ingredient: any) => {
        return ingredient.name.includes('Gạo');
    };

    // Kiểm tra nguyên liệu đã hết hạn chưa
    const isExpired = (expirationDate: string) => {
        if (!expirationDate) return false;
        
        const today = new Date();
        const expDate = new Date(expirationDate);
        
        // Reset time to compare only dates
        today.setHours(0, 0, 0, 0);
        expDate.setHours(0, 0, 0, 0);
        
        return expDate < today;
    };

    // Kiểm tra nguyên liệu sắp hết hạn (trong vòng 3 ngày)
    const isExpiringSoon = (expirationDate: string) => {
        if (!expirationDate) return false;
        
        const today = new Date();
        const expDate = new Date(expirationDate);
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);
        
        // Reset time to compare only dates
        today.setHours(0, 0, 0, 0);
        expDate.setHours(0, 0, 0, 0);
        threeDaysFromNow.setHours(0, 0, 0, 0);
        
        return expDate >= today && expDate <= threeDaysFromNow;
    };

    // Hiển thị thông báo
    const showToastMessage = (type: string, message: string) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
    };

    // Reset trạng thái mua của nguyên liệu hết hạn
    const resetBuyStatus = async (ingredientId: number, measure: string) => {
        try {
            await axios.put(Url(`market/remove`), {
                id: indexOrder,
                attributeId: ingredientId,
                measure,
            });
            setReload(Math.random());
        } catch (error) {
            console.log(error);
        }
    };

    // Thêm vào tủ lạnh
    const handleAddToFridge = async (
        ingredientId: number, 
        quantity: number, 
        measure: string, 
        exprided: string, 
        ingredient: any, 
        ingredientStatus: string
    ) => {
        // Kiểm tra xem có phải gia vị nêm không
        if (ingredientStatus === 'SEASONING') {
            showToastMessage('warning', 'Không nhất thiết phải thêm gia vị nêm vào tủ lạnh.');
            return;
        }
        
        // Kiểm tra xem có phải gạo không
        if (isSpiceOrRice(ingredient)) {
            showToastMessage('warning', `${ingredient.name} không nhất thiết phải thêm vào tủ lạnh.`);
            return;
        }

        // Kiểm tra nguyên liệu đã hết hạn chưa
        if (isExpired(exprided)) {
            showToastMessage(
                'danger', 
                `${ingredient.name} đã hết hạn sử dụng (${exprided}). Bạn cần mua lại nguyên liệu mới trước khi thêm vào tủ lạnh để đảm bảo an toàn thực phẩm.`
            );
            
            // Reset trạng thái mua về chưa mua để buộc người dùng mua lại
            await resetBuyStatus(ingredientId, measure);
            return;
        }

        // Kiểm tra nguyên liệu sắp hết hạn
        if (isExpiringSoon(exprided)) {
            showToastMessage(
                'warning', 
                `${ingredient.name} sắp hết hạn (${exprided}). Vui lòng sử dụng sớm hoặc cân nhắc mua lại.`
            );
            // Vẫn cho phép thêm vào tủ lạnh nhưng có cảnh báo
        }
        
        try {
            await axios.post(Url(`fridge/ingredients`), {
                fridgeId: fridgeId ? fridgeId : userInfo?.fridgeId,
                ingredientId,
                quantity,
                measure,
                exprided,
            });
            
            if (!isExpiringSoon(exprided)) {
                showToastMessage('success', 'Thêm vào tủ lạnh thành công');
            }
            setReload(Math.random());
        } catch (error: any) {
            console.log(error);
            alert(error.response.data.message);
        }
    };

    // Hàm để hiển thị trạng thái hết hạn
    const getExpirationStatus = (expirationDate: string) => {
        if (isExpired(expirationDate)) {
            return (
                <Badge pill bg="danger" className="ms-1">
                    Hết hạn
                </Badge>
            );
        }
        if (isExpiringSoon(expirationDate)) {
            return (
                <Badge pill bg="warning" className="ms-1">
                    Sắp hết hạn
                </Badge>
            );
        }
        return null;
    };

    return (
        <div>
            <Modal size="xl" show={show} onHide={hide}>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-3">
                        {shopping && shopping.code}
                        {shopping && (shopping.status === 1 ? (
                            <Badge className="ms-3" pill bg="success">
                                Hoàn thành
                            </Badge>
                        ) : (
                            <Badge className="ms-3" pill bg="warning">
                                Đang thực hiện
                            </Badge>
                        ))}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3 fs-5 d-flex justify-content-between">
                        <div>
                            <b>Người tạo đơn:</b> {shopping && shopping.user?.name}
                        </div>
                        <div>
                            <b>Ngày tạo đơn:</b> {shopping && shopping.createAt}
                        </div>
                    </div>
                    <Tabs defaultActiveKey="ingredients" className="mb-3" justify>
                        <Tab eventKey="ingredients" title="Nguyên liệu">
                            <Table bordered className="mt-4">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Người mua</th>
                                        <th>Ảnh</th>
                                        <th>Tên nguyên liệu</th>
                                        <th>Trạng thái</th>
                                        <th>Số lượng</th>
                                        <th>Đơn vị tính</th>
                                        <th>Loại</th>
                                        <th>Ngày mua</th>
                                        <th>Ngày hết hạn</th>
                                        <th style={{ width: '5%' }}>Mua</th>
                                        <th style={{ width: '5%' }}>Tủ lạnh</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(shopping && shopping.attributes) &&
                                        shopping.attributes.map((attribute, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    {leaderId === userInfo?.id ? (
                                                        <Form.Select
                                                            onChange={(e) =>
                                                                handleChangeUserBuy(
                                                                    attribute.id,
                                                                    e.target.value,
                                                                )
                                                            }
                                                        >
                                                            <option value={attribute.user.name}>
                                                                {attribute.user.name}
                                                            </option>
                                                            {listMember?.map((member, index) => {
                                                                if (member.id !== attribute.user.id)
                                                                    return (
                                                                        <option
                                                                            key={index}
                                                                            value={member.id}
                                                                        >
                                                                            {member.name}
                                                                        </option>
                                                                    );
                                                                return null;
                                                            })}
                                                        </Form.Select>
                                                    ) : (
                                                        attribute.user.name
                                                    )}
                                                </td>
                                                <td>
                                                    <Image
                                                        src={attribute.ingredients.image}
                                                        alt="anh"
                                                        style={{
                                                            width: '3rem',
                                                            aspectRatio: '1/1',
                                                        }}
                                                    />
                                                </td>
                                                <td>{attribute.ingredients.name}</td>
                                                <td>
                                                    {attribute.status === 1 ? (
                                                        <Badge pill bg="success">
                                                            Đã mua
                                                        </Badge>
                                                    ) : (
                                                        <Badge pill bg="warning">
                                                            Chưa mua
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td>{attribute.quantity}</td>
                                                <td>{attribute.measure}</td>
                                                <td>{attribute.ingredientStatus === 'INGREDIENT' ? (
                                                        <Badge pill bg="primary">
                                                            Nguyên liệu
                                                        </Badge>
                                                    ) : attribute.ingredientStatus === 'FRESH_INGREDIENT' ? (
                                                        <Badge pill bg="success">
                                                            Nguyên liệu tươi
                                                        </Badge>
                                                    ) : attribute.ingredientStatus === 'DRY_INGREDIENT' ? (
                                                        <Badge pill bg="secondary">
                                                            Nguyên liệu khô
                                                        </Badge>
                                                    ) : attribute.ingredientStatus === 'SEASONING' ? (
                                                        <Badge pill bg="warning">
                                                            Gia vị nêm
                                                        </Badge>
                                                    ) : null}</td>
                                                <td>{attribute.buyAt}</td>
                                                <td>
                                                    {attribute.exprided}
                                                    {getExpirationStatus(attribute.exprided)}
                                                </td>
                                                <td className="text-center">
                                                    <Form.Check
                                                        disabled={
                                                            leaderId === userInfo?.id
                                                                ? false
                                                                : userInfo?.id !== attribute.user.id
                                                        }
                                                        className="fs-5"
                                                        checked={attribute.status === 1}
                                                        onChange={() =>
                                                            handleChangeAttributeStatus(
                                                                attribute.status,
                                                                attribute.ingredients.id,
                                                                attribute.measure,
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    {attribute.status === 1 ? (
                                                        <div
                                                            onClick={() =>
                                                                handleAddToFridge(
                                                                    attribute.ingredients.id,
                                                                    attribute.quantity,
                                                                    attribute.measure,
                                                                    attribute.exprided,
                                                                    attribute.ingredients,
                                                                    attribute.ingredientStatus
                                                                )
                                                            }
                                                            style={{ cursor: 'pointer' }}
                                                            className={isExpired(attribute.exprided) ? 'text-danger' : ''}
                                                        >
                                                            <FontAwesomeIcon
                                                                size="xl"
                                                                icon={faToiletPortable}
                                                                className="p-1"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div></div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </Table>
                        </Tab>
                        <Tab eventKey="dishes" title="Món ăn">
                            <Table bordered className="mt-4">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Ảnh</th>
                                        <th>Tên món ăn</th>
                                        <th>Số lượng</th>
                                        <th>Ngày nấu</th>
                                        <th>Ngày hết hạn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(shopping && shopping.dishes) &&
                                        shopping.dishes.map((dish, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <Image
                                                        src={dish.dish.image}
                                                        alt="anh"
                                                        style={{
                                                            width: '3rem',
                                                            aspectRatio: '1/1',
                                                        }}
                                                    />
                                                </td>
                                                <td>{dish.dish.name}</td>
                                                <td>{dish.quantity}</td>
                                                <td>{dish.cookDate}</td>
                                                <td>
                                                    {dish.expride}
                                                    {getExpirationStatus(dish.expride)}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </Table>
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={hide}>Xong</Button>
                </Modal.Footer>
            </Modal>

            {/* Toast thông báo */}
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
                        {toastType === 'success' ? 'Thành công' : 
                         toastType === 'danger' ? 'Cảnh báo' : 'Lưu ý'}
                    </strong>
                </Toast.Header>
                <Toast.Body className={
                    toastType === 'success' ? 'bg-light' : 
                    toastType === 'danger' ? 'text-white' : 'text-dark'
                }>
                    {toastMessage}
                </Toast.Body>
            </Toast>
        </div>
    );
}

export default ModalDetailMarketOrder;
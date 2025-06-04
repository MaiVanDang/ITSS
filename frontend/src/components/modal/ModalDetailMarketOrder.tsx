import axios from 'axios';
import { Badge, Button, Modal, Image, Table, Tabs, Tab, Form, Toast } from 'react-bootstrap';
import Url from '../../utils/url';
import { useEffect, useState } from 'react';
import { shoppingProps, userInfoProps } from '../../utils/interface/Interface';
import { userInfo } from '../../utils/userInfo';

interface ModalDetailMarketOrderProps {
    show: boolean;
    hide: () => void;
    indexOrder: number;
    leaderId?: number;
    listMember?: userInfoProps[];
    fridgeId?: number;
    statusstore?: any;
}

// Enum cho các loại thông báo
enum ToastType {
    SUCCESS = 'success',
    ERROR = 'danger',
    WARNING = 'warning',
    INFO = 'info'
}

function ModalDetailMarketOrder({
    show,
    hide,
    indexOrder,
    leaderId,
    listMember,
    fridgeId,
    statusstore,
}: ModalDetailMarketOrderProps) {
    const [reload, setReload] = useState(0);
    const [shopping, setShopping] = useState<shoppingProps>({} as shoppingProps);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<ToastType>(ToastType.SUCCESS);

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
        quantity: number,
        buyAt?: string,
        exprided?: string,
        checkQuantity?: number,
    ) => {
        if (status === 0) {
            let confirmationMessage = 'Bạn có chắc chắn mua nguyên liệu này không! Nếu đã mua rồi thì không thể xóa đi mua lại!';
            console.log(checkQuantity);
            if (checkQuantity === 1) {
                confirmationMessage = 'Nguyên liệu hiện tại vẫn còn đủ trong kho. Bạn có chắc muốn mua thêm?';
            } else if (checkQuantity === 2) {
                confirmationMessage = 'Nguyên liệu hiện tại vẫn còn đủ trong tủ lạnh. Bạn có chắc muốn mua thêm?';
            } else if (checkQuantity === 3) {
                confirmationMessage = 'Nguyên liệu hiện tại vẫn còn đủ trong kho và tủ lạnh. Bạn có chắc muốn mua thêm?';
            }

            const isConfirmed = window.confirm(confirmationMessage);

            if (!isConfirmed) {
                return;
            }

            try {
                await axios.put(Url(`market/active`), {
                    id: indexOrder,
                    attributeId: ingredientId,
                    measure,
                    quantity,
                    buyAt: buyAt || new Date().toLocaleDateString('sv-SE'), // Sử dụng buyAt nếu có, không thì dùng ngày hiện tại
                    exprided,
                });

                setReload(Math.random());
                showToastMessage(ToastType.SUCCESS, 'Đã đánh dấu mua thành công');
            } catch (error) {
                console.log(error);
                showToastMessage(ToastType.ERROR, 'Có lỗi xảy ra khi cập nhật trạng thái mua');
            }
        } else if (status === 1) {
            window.alert('Nguyên liệu này đã được mua.');
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
            showToastMessage(ToastType.ERROR, error.response?.data?.message || 'Có lỗi xảy ra');
        }
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

    // Kiểm tra nguyên liệu sắp hết hạn (trong vòng 2 ngày)
    const isExpiringSoon = (expirationDate: string) => {
        if (!expirationDate) return false;

        const today = new Date();
        const expDate = new Date(expirationDate);
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 2);

        // Reset time to compare only dates
        today.setHours(0, 0, 0, 0);
        expDate.setHours(0, 0, 0, 0);
        threeDaysFromNow.setHours(0, 0, 0, 0);

        return expDate >= today && expDate <= threeDaysFromNow;
    };

    // Hiển thị thông báo - đã đồng nhất
    const showToastMessage = (type: ToastType, message: string) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
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

    // Hàm để lấy tiêu đề toast theo loại
    const getToastTitle = (type: ToastType) => {
        switch (type) {
            case ToastType.SUCCESS:
                return 'Thành công';
            case ToastType.ERROR:
                return 'Lỗi';
            case ToastType.WARNING:
                return 'Cảnh báo';
            case ToastType.INFO:
                return 'Thông tin';
            default:
                return 'Thông báo';
        }
    };

    // Hàm để lấy class CSS cho toast body
    const getToastBodyClass = (type: ToastType) => {
        switch (type) {
            case ToastType.SUCCESS:
                return 'text-white';
            case ToastType.ERROR:
                return 'text-white';
            case ToastType.WARNING:
                return 'text-dark';
            case ToastType.INFO:
                return 'text-white';
            default:
                return 'text-dark';
        }
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
                                                                attribute.quantity,
                                                                attribute.buyAt,
                                                                attribute.exprided,
                                                                attribute.checkQuantity,
                                                            )

                                                        }
                                                    />
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

            {/* Toast thông báo - đã đồng nhất */}
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
                        {getToastTitle(toastType)}
                    </strong>
                </Toast.Header>
                <Toast.Body className={getToastBodyClass(toastType)}>
                    {toastMessage}
                </Toast.Body>
            </Toast>
        </div>
    );
}

export default ModalDetailMarketOrder;
import axios from 'axios';
import { Badge, Button, Modal, Image, Table, Tabs, Tab, Form, Toast } from 'react-bootstrap';
import Url from '../../utils/url';
import { useEffect, useState } from 'react';
import { shoppingProps, userInfoProps } from '../../utils/interface/Interface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToiletPortable, faPlus } from '@fortawesome/free-solid-svg-icons';
import { userInfo } from '../../utils/userInfo';
// import { useDispatch } from 'react-redux';

interface ModalDetailMarketOrderProps {
    show: boolean;
    hide: () => void;
    indexOrder: number;
    leaderId?: number;
    listMember?: userInfoProps[];
    fridgeId?: number;
    onCreateOrder?: () => void; // Thêm prop để xử lý tạo đơn mới
}

function ModalDetailMarketOrder({
    show,
    hide,
    indexOrder,
    leaderId,
    listMember,
    fridgeId,
    onCreateOrder,
}: ModalDetailMarketOrderProps) {
    // const dispatch = useDispatch();
    const [reload, setReload] = useState(0);
    const [shopping, setShopping] = useState<shoppingProps | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const callApi = async () => {
        if (!indexOrder) {
            setIsLoading(false);
            return null;
        }
        
        try {
            setIsLoading(true);
            const response = await axios.get(Url(`market/show/detail/${indexOrder}`));
            setError(null);
            setIsLoading(false);
            return response.data;
        } catch (error) {
            setError('Không có đơn hàng nào');
            setIsLoading(false);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, reload, indexOrder]);

    const handleChangeAttributeStatus = async (
        status: 1 | 0 | null,
        ingredientId: number,
        measure: string,
    ) => {
        if (!shopping) return;
        
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

    // Thêm vào tủ lạnh
    const handleAddToFridge = async (ingredientId: number, quantity: number, measure: string) => {
        try {
            await axios.post(Url(`fridge/ingredients`), {
                fridgeId: fridgeId ? fridgeId : userInfo?.fridgeId,
                ingredientId,
                quantity,
                measure,
            });
            setShowToast(true);
            setReload(Math.random());
        } catch (error: any) {
            console.log(error);
            alert(error.response.data.message);
        }
    };

    // Hiển thị nội dung khi không có đơn hàng
    const renderNoOrderContent = () => {
        return (
            <div className="text-center py-5">
                <div className="mb-4">
                    <FontAwesomeIcon icon={faPlus} size="3x" className="text-secondary" />
                </div>
                <h4>Bạn chưa có đơn hàng nào</h4>
                <p className="text-muted">Hãy tạo đơn hàng mới để bắt đầu</p>
                {onCreateOrder && (
                    <Button variant="primary" onClick={onCreateOrder} className="mt-3">
                        Tạo đơn hàng mới
                    </Button>
                )}
            </div>
        );
    };

    // Hiển thị nội dung đơn hàng
    const renderOrderContent = () => {
        if (!shopping) return null;
        
        return (
            <>
                <div className="mb-3 fs-5 d-flex justify-content-between">
                    <div>
                        <b>Người tạo đơn:</b> {shopping.user?.name}
                    </div>
                    <div>
                        <b>Ngày tạo đơn:</b> {shopping.createAt}
                    </div>
                </div>
                <Tabs defaultActiveKey="ingredients" className="mb-3" justify>
                    <Tab eventKey="ingredients" title="Nguyên liệu">
                        <Table bordered className="mt-4 ">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Người mua</th>
                                    <th>Ảnh</th>
                                    <th>Tên nguyên liệu</th>
                                    <th>Trạng thái</th>
                                    <th>Số lượng</th>
                                    <th>Đơn vị tính</th>
                                    <th>Ngày mua</th>
                                    <th>Ngày hết hạn</th>
                                    <th style={{ width: '5%' }}>Mua</th>
                                    <th style={{ width: '5%' }}>Tủ lạnh</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shopping.attributes &&
                                    shopping.attributes.map((attribute, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {/* Nếu user là leader thì được select người đi mua */}
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
                                                    // Nếu không thì chỉ hiện tên người mua
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
                                            <td>{attribute.buyAt}</td>
                                            <td>{attribute.exprided}</td>
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
                                                            )
                                                        }
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
                        <Table bordered className="mt-4 ">
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
                                {shopping.dishes && shopping.dishes.length > 0 ? (
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
                                            <td>{dish.expride}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-3">
                                            Không có món ăn nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Tab>
                </Tabs>
            </>
        );
    };

    return (
        <div>
            <Modal size="xl" show={show} onHide={hide}>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-3">
                        {shopping?.code ? (
                            <>
                                {shopping.code}
                                {shopping.status === 1 ? (
                                    <Badge className="ms-3" pill bg="success">
                                        Hoàn thành
                                    </Badge>
                                ) : (
                                    <Badge className="ms-3" pill bg="warning">
                                        Đang thực hiện
                                    </Badge>
                                )}
                            </>
                        ) : (
                            "Chi tiết đơn hàng"
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                            <p className="mt-3">Đang tải dữ liệu...</p>
                        </div>
                    ) : shopping ? (
                        renderOrderContent()
                    ) : (
                        renderNoOrderContent()
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={hide}>
                        {shopping ? "Xong" : "Đóng"}
                    </Button>
                    {!shopping && onCreateOrder && (
                        <Button variant="primary" onClick={onCreateOrder}>
                            Tạo đơn hàng mới
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Toast thêm vào tủ lạnh thành công */}
            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={3000}
                autohide
                bg="success"
                className="position-absolute end-3 top-0"
                style={{ zIndex: 3000 }}
            >
                <Toast.Header>
                    <strong className="me-auto">Thành công</strong>
                </Toast.Header>
                <Toast.Body className="bg-light">Thêm vào tủ lạnh thành công</Toast.Body>
            </Toast>
        </div>
    );
}

export default ModalDetailMarketOrder;
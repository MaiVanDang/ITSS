import axios from 'axios';
import { Badge, Button, Modal, Image, Table, Tabs, Tab, Form, Toast } from 'react-bootstrap';
import Url from '../../utils/url';
import { useEffect, useState } from 'react';
import { shoppingProps, userInfoProps } from '../../utils/interface/Interface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToiletPortable } from '@fortawesome/free-solid-svg-icons';
import { userInfo } from '../../utils/userInfo';
// import { useDispatch } from 'react-redux';

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
    // const dispatch = useDispatch();
    const [reload, setReload] = useState(0);
    const [shopping, setShopping] = useState<shoppingProps>({} as shoppingProps);
    const [showToast, setShowToast] = useState(false);

    const callApi = async () => {
        if (indexOrder === 0) return null; // tránh gọi nếu chưa có indexOrder

        try {
            const response = await axios.get(Url(`market/show/detail/${indexOrder}`));
            return response.data;
        } catch (error) {
            console.error(error);
            // alert('Không lấy được shopping detail!!!'); // không cần cảnh báo khi không có đơn
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
                                    {(shopping && shopping.attributes) &&
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
                                        {/* <th>Trạng thái</th> */}
                                        <th>Số lượng</th>
                                        <th>Ngày nấu</th>
                                        <th>Ngày hết hạn</th>
                                        {/* <th style={{ width: '5%' }}></th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(shopping && shopping.attributes) &&
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
                                                {/* <td>
                                                    {dish.cook_status === 1 ? (
                                                        <Badge pill bg="success">
                                                            Đã mua
                                                        </Badge>
                                                    ) : (
                                                        <Badge pill bg="warning">
                                                            Chưa mua
                                                        </Badge>
                                                    )}
                                                </td> */}
                                                <td>{dish.quantity}</td>
                                                <td>{dish.cookDate}</td>
                                                <td>{dish.expride}</td>
                                                {/* <td className="text-center">
                                                    <Form.Check
                                                        className="fs-5"
                                                        checked={dish.cook_status === 1}
                                                        // onChange={() =>
                                                        //     handleChangeDishStatus(
                                                        //         dish.cook_status,
                                                        //         dish.dish.id,
                                                        //     )
                                                        // }
                                                    />
                                                </td> */}
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
import axios from 'axios';
import { Badge, Button, Col, Modal, Row, Image, Table } from 'react-bootstrap';
import Url from '../../utils/url';
import { useEffect, useState } from 'react';
import { dishsProps } from '../../utils/interface/Interface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

interface ModalDetailDish {
    show: boolean;
    hide: () => void;
    indexDish: number;
}

function ModalDetailDish({ show, hide, indexDish}: ModalDetailDish) {
    const [reload, setReload] = useState(0);
    const [dish, setDish] = useState<dishsProps>({} as dishsProps);
    
    const callApi = async () => {
        try {
            const response = await axios.get(Url(`dishs/${indexDish}`));
            return response.data;
        } catch (error) {
            alert('Không lấy được dish detail!!!');
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await callApi();
                setDish(results);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [indexDish, reload]);

    const deleteApi = async (id: number, ingredientId: number) => {
        try{
            const response = await axios.delete(Url(`dish_ingredient/${id}/${ingredientId}`));
            return response.data;
        } catch (error){
            alert('Không xóa được nguyên liệu!!!');
            return null;
        }
    };

    const handleDeleteIngredient = async (ingredientId: number) => {
        await deleteApi(indexDish, ingredientId);
        setReload(Math.random());
    };

    return (
        <Modal size="xl" show={show} onHide={hide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {dish.name}
                    {dish.status === 1 ? (
                        <Badge className="ms-3" pill bg="success">
                            Sẵn sàng đặt món
                        </Badge>
                    ) : (
                        <Badge className="ms-3" pill bg="danger">
                            Đã xóa
                        </Badge>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col xs={8}>
                        <div>
                            <b>Kiểu món ăn:</b> {dish.type}
                        </div>
                        <div>
                            <b>Mô tả:</b> {dish.descriptions}
                        </div>
                        <div>
                            <b>Cách nấu:</b> {dish.recipeDes}
                        </div>
                        <div>
                            <b>Ngày tạo món:</b> {dish.createAt}
                        </div>
                    </Col>
                    <Col xs={4}>
                        <Image
                            src={dish.image}
                            alt="Anh"
                            rounded
                            style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
                        />
                    </Col>
                </Row>
                <Table bordered hover className="mt-4">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Ảnh</th>
                            <th>Tên nguyên liệu</th>
                            <th>Trạng thái</th>
                            <th>Số lượng</th>
                            <th>Đơn vị tính</th>
                            <th>Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dish.ingredients &&
                            dish.ingredients.map((ingredient, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <Image
                                            src={ingredient.ingredient.image}
                                            alt="anh"
                                            style={{ width: '3rem', aspectRatio: '1/1' }}
                                        />
                                    </td>
                                    <td>{ingredient.ingredient.name}</td>
                                    <td>
                                        {ingredient.ingredient.status === 1 ? (
                                            <Badge pill bg="success">
                                                Sẵn sàng mua
                                            </Badge>
                                        ) : (
                                            <Badge pill bg="danger">
                                                Đã xóa
                                            </Badge>
                                        )}
                                    </td>
                                    <td>{ingredient.quantity}</td>
                                    <td>{ingredient.measure}</td>
                                    <td>
                                        <div
                                            onClick={() =>
                                                handleDeleteIngredient(ingredient.ingredient.id)
                                            }
                                        >
                                            <FontAwesomeIcon size="lg" icon={faTrashCan} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
                <Button onClick={hide}>Thêm nguyên liệu</Button>
                <Button onClick={hide}>Xong</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalDetailDish;
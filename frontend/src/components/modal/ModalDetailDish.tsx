import axios from 'axios';
import { Badge, Button, Modal, Image, Table, Tabs, Tab, Form, Toast } from 'react-bootstrap';
import Url from '../../utils/url';
import { useEffect, useState } from 'react';
import { shoppingProps, userInfoProps, dishIngredients } from '../../utils/interface/Interface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToiletPortable, faPlus } from '@fortawesome/free-solid-svg-icons';
import { userInfo } from '../../utils/userInfo';

interface ModalDetailMarketOrderProps {
    show: boolean;
    hide: () => void;
    dishId: number;
    leaderId?: number;
    listMember?: userInfoProps[];
    fridgeId?: number;
    onCreateOrder?: () => void;
}

// Interface cho dữ liệu món ăn chi tiết
interface DishDetail {
    id: number;
    name: string;
    image: string;
    descriptions: string;
    recipeDes: string;
    type: string;
    status: number;
    createAt: string;
    updateAt: string;
    ingredients: dishIngredients[];
}

function ModalDetailMarketOrder({
    show,
    hide,
    dishId,
    leaderId,
    listMember,
    fridgeId,
    onCreateOrder,
}: ModalDetailMarketOrderProps) {
    const [reload, setReload] = useState(0);
    const [shopping, setShopping] = useState<shoppingProps | null>(null);
    const [dishDetail, setDishDetail] = useState<DishDetail | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Ngăn cuộn khi modal mở
    useEffect(() => {
        if (show) {
            // Lưu vị trí cuộn hiện tại
            const scrollY = window.scrollY;
            
            // Thêm style để ngăn cuộn
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            
            return () => {
                // Khôi phục khi modal đóng
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [show]);

    const callApi = async () => {
        if (!dishId) {
            setIsLoading(false);
            return null;
        }
        console.log('Fetching order details for index:', dishId);
        try {
            setIsLoading(true);
            const response = await axios.get(Url(`dishs/show/detail/${dishId}`));
            setError(null);
            setIsLoading(false);
            console.log('Order details fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            setError('Chưa lên công thức nào');
            setIsLoading(false);
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await callApi();
                setDishDetail(results);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [show, reload, dishId]);

    const handleChangeAttributeStatus = async (
        status: 1 | 0 | null,
        ingredientId: number,
        measure: string,
    ) => {
        if (!shopping) return;
        
        if (status === 1) {
            try {
                await axios.put(Url(`market/remove`), {
                    id: dishId,
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
                    id: dishId,
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

    const renderNoOrderContent = () => {
        return (
            <div className="text-center py-5">
                <div className="mb-4">
                    <FontAwesomeIcon icon={faPlus} size="3x" className="text-secondary" />
                </div>
                <h4>Không tìm thấy thông tin món ăn</h4>
                <p className="text-muted">{error || "Dữ liệu không tồn tại"}</p>
                {onCreateOrder && (
                    <Button variant="primary" onClick={onCreateOrder} className="mt-3">
                        Tạo đơn hàng mới
                    </Button>
                )}
            </div>
        );
    };

    const renderOrderContent = () => {
        if (!dishDetail) return null;
        
        return (
            <div style={{ height: '70vh', overflowY: 'auto' }}>
                {/* Phần trên: Thông tin món ăn và công thức */}
                <div className="mb-4">
                    <div className="row">
                        {/* Bên trái: Ảnh và thông tin cơ bản */}
                        <div className="col-md-4">
                            <Image
                                src={dishDetail.image}
                                alt={dishDetail.name}
                                fluid
                                className="rounded"
                                style={{ maxHeight: '200px', objectFit: 'cover', width: '100%' }}
                            />
                            <div className="mt-3">
                                <h3>{dishDetail.name}</h3>
                                <p className="text-muted">{dishDetail.descriptions}</p>
                                <div className="mb-2">
                                    <Badge bg="info">{dishDetail.type}</Badge>
                                </div>
                            </div>
                        </div>
                        
                        {/* Bên phải: Công thức nấu ăn */}
                        <div className="col-md-8">
                            <h4 className="text-primary mb-3">Công thức nấu ăn</h4>
                            <div className="border rounded p-3 bg-light" style={{ height: '300px', overflowY: 'auto' }}>
                                {dishDetail.recipeDes ? (
                                    <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                                        {dishDetail.recipeDes}
                                    </div>
                                ) : (
                                    <p className="text-muted text-center mt-5">
                                        Chưa có công thức nấu ăn
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phần dưới: Bảng nguyên liệu */}
                <div className="mt-4">
                    <h4 className="text-primary mb-3">Nguyên liệu</h4>
                    <Table bordered>
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Tên nguyên liệu</th>
                                <th>Ảnh</th>
                                <th>Mô tả</th>
                                <th>Số lượng</th>
                                <th>Đơn vị tính</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dishDetail.ingredients && dishDetail.ingredients.length > 0 ? (
                                dishDetail.ingredients.map((ingredient, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td><strong>{ingredient.ingredient.name}</strong></td>
                                        <td>
                                            <Image
                                                src={ingredient.ingredient.image}
                                                alt="ingredient"
                                                style={{
                                                    width: '4rem',
                                                    height: '3rem',
                                                    objectFit: 'cover',
                                                }}
                                                className="rounded"
                                            />
                                        </td>
                                        <td>{ingredient.ingredient.description}</td>
                                        <td className="text-center"><strong>{ingredient.quantity}</strong></td>
                                        <td className="text-center">{ingredient.measure}</td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant="outline-success"
                                                onClick={() => handleAddToFridge(
                                                    ingredient.ingredient.id,
                                                    ingredient.quantity,
                                                    ingredient.measure
                                                )}
                                            >
                                                Thêm vào tủ lạnh
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-3">
                                        Không có nguyên liệu nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
        );
    };

    return (
        <div>
            <Modal 
                size="xl" 
                show={show} 
                onHide={hide}
                backdrop="static"
                keyboard={false}
                style={{ 
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxHeight: '90vh'
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title className="fs-3">
                        {dishDetail ? `Chi tiết món: ${dishDetail.name}` : 'Chi tiết món ăn'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {isLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                            <p className="mt-3">Đang tải dữ liệu...</p>
                        </div>
                    ) : dishDetail ? (
                        renderOrderContent()
                    ) : (
                        renderNoOrderContent()
                    )}
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>

            {/* Toast thêm vào tủ lạnh thành công */}
            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={3000}
                autohide
                bg="success"
                className="position-fixed end-0 top-0 m-3"
                style={{ zIndex: 3000 }}
            >
                <Toast.Header>
                    <strong className="me-auto">Thành công</strong>
                </Toast.Header>
                <Toast.Body className="text-white">
                    Thêm nguyên liệu vào tủ lạnh thành công
                </Toast.Body>
            </Toast>
        </div>
    );
}

export default ModalDetailMarketOrder;
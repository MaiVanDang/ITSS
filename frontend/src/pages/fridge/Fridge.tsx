import { faRightFromBracket, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import { fridgeProps, ingredientsProps } from '../../utils/interface/Interface';
import axios from 'axios';
import Url from '../../utils/url';
import { userInfo } from '../../utils/userInfo';
import ModalRemoveFridgeGroup from '../../components/modal/ModalRemoveFridgeGroup';
import './Fridge.css';
import { getExpiryStatus } from '../../utils/ingredientHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { ExpiryStatusBadge } from '../../components/shared/ExpiryStatusBadge';

function Fridge() {
    const [fridge, setFridge] = useState<fridgeProps>({} as fridgeProps);
    const [showModalRemoveFridgeGroup, setShowModalRemoveFridgeGroup] = useState(false);
    const [currentIngredient, setCurrentIngredient] = useState<ingredientsProps>({} as ingredientsProps);

    useEffect(() => {
        const fetchApiGroupFridge = async () => {
            try {
                const results = await axios.get(Url(`fridge/user/${userInfo?.id}`));
                setFridge(results.data);
            } catch (error: any) {
                alert(error.response.data.message);
                console.log(error);
            }
        };
        fetchApiGroupFridge();
    }, [showModalRemoveFridgeGroup]);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>
                    <FontAwesomeIcon icon={faSnowflake} className="me-2" />
                    Tủ lạnh của tôi
                </h2>
                <Button variant="outline-primary" onClick={() => window.location.reload()}>
                    Làm mới
                </Button>
            </div>

            {(!fridge.ingredients || fridge.ingredients.length === 0) ? (
                <div className="text-center p-4">
                    <FontAwesomeIcon icon={faSnowflake} size="3x" className="text-muted mb-3" />
                    <h5 className="text-muted">Tủ lạnh hiện chưa có thực phẩm nào</h5>
                    <p className="text-muted">Hãy thêm nguyên liệu từ kho lưu trữ để bắt đầu!</p>
                </div>
            ) : (
                <Table hover bordered responsive>
                    <thead className="text-center sticky-top table-dark">
                        <tr>
                            <th className="sticky-top border-bottom">STT</th>
                            <th className="sticky-top border-bottom">Ảnh</th>
                            <th className="sticky-top border-bottom">Tên nguyên liệu</th>
                            <th className="sticky-top border-bottom">Số lượng</th>
                            <th className="sticky-top border-bottom">Đơn vị tính</th>
                            <th className="sticky-top border-bottom">Ngày cho vào tủ</th>
                            <th className="sticky-top border-bottom">Ngày hết hạn</th>
                            <th className="sticky-top border-bottom">Trạng thái</th>
                            <th className="sticky-top border-bottom">Sử dụng</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {fridge.ingredients?.map((item, index) => {
                            const { status, style, tooltipText } = getExpiryStatus(item.exprided);

                            return (
                                <tr
                                    key={index}
                                    style={style}
                                    title={tooltipText}
                                >
                                    <td>{index + 1}</td>
                                    <td>
                                        <img
                                            src={item.ingredient.image}
                                            alt="anh"
                                            style={{ height: '3rem', width: '3rem' }}
                                        />
                                    </td>
                                    <td><strong>{item.ingredient.name}</strong></td>
                                    <td>{item.quantity}</td>
                                    <td>{item.measure}</td>
                                    <td>{formatDate(item.createAt)}</td>
                                    <td>{formatDate(item.exprided)}</td>
                                    <td><ExpiryStatusBadge status={status} /></td>
                                    <td className="text-center"
                                        onClick={() => {
                                            setCurrentIngredient(item);
                                            setShowModalRemoveFridgeGroup(true);
                                        }}
                                    >
                                        <Button variant="outline-danger" size="sm" title="Sử dụng / loại bỏ khỏi tủ">
                                            <FontAwesomeIcon icon={faRightFromBracket} />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            )}

            {/* Modal sử dụng / loại bỏ khỏi tủ */}
            {currentIngredient && (
                <ModalRemoveFridgeGroup
                    show={showModalRemoveFridgeGroup}
                    hide={() => setShowModalRemoveFridgeGroup(false)}
                    ingredient={currentIngredient}
                />
            )}
        </div>
    );
}

export default Fridge;

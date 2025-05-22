import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { fridgeProps, ingredientsProps } from '../../utils/interface/Interface';
import axios from 'axios';
import Url from '../../utils/url';
import { userInfo } from '../../utils/userInfo';
import ModalRemoveFridgeGroup from '../../components/modal/ModalRemoveFridgeGroup';
import './Fridge.css'; // Import CSS file for custom styles

function Fridge() {
    const [fridge, setFridge] = useState<fridgeProps>({} as fridgeProps);
    const [showModalRemoveFridgeGroup, setShowModalRemoveFridgeGroup] = useState(false);
    const [currentIngredient, setCurrentIngredient] = useState<ingredientsProps>(
        {} as ingredientsProps,
    );

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

    // Hàm tính trạng thái hạn sử dụng
    const calculateExpiryStatus = (createAt : any, exprided : any) => {
        // Xử lý ngày tháng - chuyển từ chuỗi sang đối tượng Date
        try {
            // Đảm bảo định dạng ngày tháng chính xác
            const createDate = new Date(createAt);
            const expiredDate = new Date(exprided);
            const currentDate = new Date();
            
            // Kiểm tra xem ngày có hợp lệ không
            if (isNaN(createDate.getTime()) || isNaN(expiredDate.getTime())) {
                console.error('Ngày không hợp lệ:', { createAt, exprided });
                return { status: "Không xác định", style: {}, daysLeft: null, tooltipText: "Không xác định ngày hết hạn" };
            }
            
            // Số ngày còn lại
            const daysLeft = Math.floor((expiredDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24) + 1);
            
            let tooltipText = "";
            
            if (daysLeft > 2) {
                tooltipText = `Nguyên liệu còn ${daysLeft} ngày nữa là hết hạn`;
                return { status: "Còn hạn", style: { backgroundColor: "transparent" }, daysLeft, tooltipText };
            } else if (daysLeft > 0) {
                tooltipText = `Nguyên liệu còn ${daysLeft} ngày nữa là hết hạn`;
                return { status: "Sắp hết hạn", style: { backgroundColor: "#FFEB3B" }, daysLeft, tooltipText };
            } else if (daysLeft === 0) {
                tooltipText = "Nguyên liệu hết hạn ngày hôm nay";
                return { status: "Sắp hết hạn", style: { backgroundColor: "#FFEB3B" }, daysLeft, tooltipText };
            } else {
                tooltipText = `Nguyên liệu đã hết hạn từ ${Math.abs(daysLeft)} ngày trước`;
                return { status: "Hết hạn", style: { backgroundColor: "#FF5252" }, daysLeft, tooltipText };
            }
        } catch (error) {
            console.error('Lỗi khi tính toán trạng thái hết hạn:', error);
            return { status: "Không xác định", style: {}, daysLeft: null, tooltipText: "Không xác định ngày hết hạn" };
        }
    };

    return (
        <Table hover bordered>
            <thead className="fs-5 ">
                <tr>
                    <th>STT</th>
                    <th>Ảnh</th>
                    <th>Tên nguyên liệu</th>
                    <th>Số lượng</th>
                    <th>Đơn vị tính</th>
                    <th>Ngày cho vào tủ </th>
                    <th>Ngày hết hạn</th>
                    <th>Trạng thái</th>
                    <th>Sử dụng</th>
                </tr>
            </thead>
            <tbody>
                {fridge.ingredients?.map((item, index) => {
                    const { status, style, tooltipText } = calculateExpiryStatus(item.createAt, item.exprided);
                    
                    return (
                        <tr 
                            key={index} 
                            style={{...style, backgroundColor: style.backgroundColor || 'inherit'}}
                            className={
                                status === "Sắp hết hạn" ? "expiring-soon" : 
                                status === "Hết hạn" ? "expired" : ""
                            }
                            title={tooltipText} // Thêm tooltip sử dụng attribute title
                        >
                            <td style={{...style, backgroundColor: style.backgroundColor || 'inherit'}}>{index + 1}</td>
                            <td style={{...style, backgroundColor: style.backgroundColor || 'inherit'}}>
                                <img
                                    src={item.ingredient.image}
                                    alt="anh"
                                    style={{ height: '3rem', width: '3rem' }}
                                />
                            </td>
                            <td style={{...style, backgroundColor: style.backgroundColor || 'inherit'}}>{item.ingredient.name}</td>
                            <td style={{...style, backgroundColor: style.backgroundColor || 'inherit'}}>{item.quantity}</td>
                            <td style={{...style, backgroundColor: style.backgroundColor || 'inherit'}}>{item.measure}</td>
                            <td style={{...style, backgroundColor: style.backgroundColor || 'inherit'}}>{item.createAt}</td>
                            <td style={{...style, backgroundColor: style.backgroundColor || 'inherit'}}>{item.exprided}</td>
                            <td style={{...style, backgroundColor: style.backgroundColor || 'inherit'}}><strong>{status}</strong></td>
                            <td style={{...style, backgroundColor: style.backgroundColor || 'inherit'}}
                                onClick={() => {
                                    setCurrentIngredient(item);
                                    setShowModalRemoveFridgeGroup(true);
                                }}
                            >
                                <FontAwesomeIcon size="lg" icon={faRightFromBracket} />
                            </td>
                        </tr>
                    );
                })}

                {/* ModalRemoveFridgeGroup */}
                {currentIngredient && (
                    <ModalRemoveFridgeGroup
                        show={showModalRemoveFridgeGroup}
                        hide={() => setShowModalRemoveFridgeGroup(false)}
                        ingredient={currentIngredient}
                    />
                )}
            </tbody>
        </Table>
    );
}

export default Fridge;
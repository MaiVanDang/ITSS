import { 
  faRightFromBracket, 
  faSnowflake,
  faChartPie,
  faClock,
  faExclamationTriangle,
  faCheck,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Table, Button, Card, Row, Col, Alert, Badge } from 'react-bootstrap';
import { fridgeProps, ingredientsProps } from '../../utils/interface/Interface';
import axios from 'axios';
import Url from '../../utils/url';
import { userInfo } from '../../utils/userInfo';
import ModalRemoveFridgeGroup from '../../components/modal/ModalRemoveFridgeGroup';
import './Fridge.css';
import { getExpiryStatus } from '../../utils/ingredientHelpers';
import { formatDate } from '../../utils/dateHelpers';
import { ExpiryStatusBadge } from '../../components/shared/ExpiryStatusBadge';
import { toast } from 'react-toastify';

type FilterType = {
  expiryStatus?: 'expired' | 'aboutToExpire' | 'fresh';
  ingredientType?: 'dry' | 'seasoning' | 'fresh' | 'other';
};

function Fridge() {
    // Giữ nguyên các state gốc
    const [fridge, setFridge] = useState<fridgeProps>({} as fridgeProps);
    const [showModalRemoveFridgeGroup, setShowModalRemoveFridgeGroup] = useState(false);
    const [currentIngredient, setCurrentIngredient] = useState<ingredientsProps>({} as ingredientsProps);
    
    // Thêm state mới cho filter
    const [activeFilter, setActiveFilter] = useState<FilterType>({});
    const [filteredIngredients, setFilteredIngredients] = useState<ingredientsProps[]>([]);

    useEffect(() => {
        const fetchApiGroupFridge = async () => {
            try {
                const results = await axios.get(Url(`fridge/user/${userInfo?.id}`));
                setFridge(results.data);
                setFilteredIngredients(results.data.ingredients || []);
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi tải dữ liệu.");
                console.error(error);
            }
        };
        fetchApiGroupFridge();
    }, [showModalRemoveFridgeGroup]);

    // Thêm useEffect để áp dụng filter
    useEffect(() => {
        applyFilters();
    }, [fridge.ingredients, activeFilter]);

    // Hàm áp dụng bộ lọc
    const applyFilters = () => {
        if (!fridge.ingredients) return;
        
        let result = [...fridge.ingredients];
        
        if (activeFilter.expiryStatus) {
            result = result.filter(item => {
                const { status } = getExpiryStatus(item.exprided);
                switch (activeFilter.expiryStatus) {
                    case 'expired': return status === 'Đã hết hạn';
                    case 'aboutToExpire': return status === 'Sắp hết hạn';
                    case 'fresh': return status === 'Còn hạn';
                    default: return true;
                }
            });
        }
        
        if (activeFilter.ingredientType) {
            result = result.filter(item => {
                switch (activeFilter.ingredientType) {
                    case 'dry': return item.ingredient.ingredientStatus === 'DRY_INGREDIENT';
                    case 'seasoning': return item.ingredient.ingredientStatus === 'SEASONING';
                    case 'fresh': return item.ingredient.ingredientStatus === 'FRESH_INGREDIENT';
                    case 'other': return item.ingredient.ingredientStatus === 'INGREDIENT';
                    default: return true;
                }
            });
        }
        
        setFilteredIngredients(result);
    };

    const handleFilterClick = (filter: FilterType) => {
        if (
            (filter.expiryStatus && activeFilter.expiryStatus === filter.expiryStatus) ||
            (filter.ingredientType && activeFilter.ingredientType === filter.ingredientType)
        ) {
            setActiveFilter({});
        } else {
            setActiveFilter(filter);
        }
    };

    const clearAllFilters = () => {
        setActiveFilter({});
    };

    // Hàm tính toán thống kê
    const calculateStatistics = () => {
        if (!fridge.ingredients) return {
            expiryStatus: { expired: 0, aboutToExpire: 0, fresh: 0 },
            ingredientType: { dry: 0, seasoning: 0, fresh: 0, other: 0 }
        };

        const stats = {
            expiryStatus: {
                expired: 0,
                aboutToExpire: 0,
                fresh: 0
            },
            ingredientType: {
                dry: 0,
                seasoning: 0,
                fresh: 0,
                other: 0
            }
        };

        fridge.ingredients.forEach(item => {
            // Thống kê theo trạng thái hạn sử dụng
            const { status } = getExpiryStatus(item.exprided);
            if (status === 'Đã hết hạn') {
                stats.expiryStatus.expired++;
            } else if (status === 'Sắp hết hạn') {
                stats.expiryStatus.aboutToExpire++;
            } else {
                stats.expiryStatus.fresh++;
            }

            // Thống kê theo loại nguyên liệu
            switch (item.ingredient.ingredientStatus) {
                case 'DRY_INGREDIENT':
                    stats.ingredientType.dry++;
                    break;
                case 'SEASONING':
                    stats.ingredientType.seasoning++;
                    break;
                case 'FRESH_INGREDIENT':
                    stats.ingredientType.fresh++;
                    break;
                case 'INGREDIENT':
                    stats.ingredientType.other++;
                    break;
                default:
                    stats.ingredientType.other++;
            }
        });

        return stats;
    };

    const stats = calculateStatistics();
    const hasExpiredItems = stats.expiryStatus.expired > 0;
    const displayItems = filteredIngredients.length > 0 || Object.keys(activeFilter).length > 0 
        ? filteredIngredients 
        : fridge.ingredients || [];

    return (
        <div className="fridge-container">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    <FontAwesomeIcon icon={faSnowflake} className="me-2" />
                    Tủ lạnh của tôi
                </h2>
                <div>
                    {Object.keys(activeFilter).length > 0 && (
                        <Button 
                            variant="outline-secondary" 
                            className="me-2"
                            onClick={clearAllFilters}
                            size="sm"
                        >
                            Xóa bộ lọc
                        </Button>
                    )}
                    <Button variant="outline-primary" onClick={() => window.location.reload()}>
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Khu vực Thống kê */}
            {fridge.ingredients && fridge.ingredients.length > 0 && (
                <Card className="mb-4 shadow-sm">
                    <Card.Body>
                        <h4 className="mb-4">
                            <FontAwesomeIcon icon={faChartPie} className="me-2 text-primary" />
                            Thống kê tủ lạnh
                        </h4>
                        
                        <Row>
                            {/* Cột thống kê trạng thái hạn sử dụng */}
                            <Col md={6} className="mb-3 mb-md-0">
                                <div className="border-end pe-md-3">
                                    <h5 className="mb-3 text-center">Theo trạng thái hạn sử dụng</h5>
                                    <Row>
                                        {[
                                            { type: 'expired', icon: faExclamationTriangle, color: 'danger', label: 'Hết hạn' },
                                            { type: 'aboutToExpire', icon: faClock, color: 'warning', label: 'Sắp hết hạn' },
                                            { type: 'fresh', icon: faCheck, color: 'success', label: 'Còn hạn' }
                                        ].map((item) => (
                                            <Col sm={4} key={item.type}>
                                                <Card 
                                                    className={`text-center h-100 cursor-pointer ${activeFilter.expiryStatus === item.type ? 'border-primary' : ''}`}
                                                    onClick={() => handleFilterClick({ expiryStatus: item.type as any })}
                                                >
                                                    <Card.Body>
                                                        <Card.Title>
                                                            <FontAwesomeIcon 
                                                                icon={activeFilter.expiryStatus === item.type ? faFilter : item.icon} 
                                                                className={`me-2 ${activeFilter.expiryStatus === item.type ? 'text-primary' : `text-${item.color}`}`} 
                                                            />
                                                            {item.label}
                                                        </Card.Title>
                                                        <Card.Text className="display-6">
                                                            {stats.expiryStatus[item.type as keyof typeof stats.expiryStatus]}
                                                        </Card.Text>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </Col>

                            {/* Cột thống kê loại nguyên liệu */}
                            <Col md={6}>
                                <h5 className="mb-3 text-center">Theo loại nguyên liệu</h5>
                                <Row>
                                    {[
                                        { type: 'dry', color: 'secondary', label: 'Khô' },
                                        { type: 'seasoning', color: 'warning', label: 'Gia vị' },
                                        { type: 'fresh', color: 'success', label: 'Tươi' },
                                        { type: 'other', color: 'primary', label: 'Khác' }
                                    ].map((item) => (
                                        <Col sm={3} key={item.type}>
                                            <Card 
                                                className={`text-center h-100 cursor-pointer ${activeFilter.ingredientType === item.type ? 'border-primary' : ''}`}
                                                onClick={() => handleFilterClick({ ingredientType: item.type as any })}
                                            >
                                                <Card.Body>
                                                    <Card.Title>
                                                        <Badge bg={activeFilter.ingredientType === item.type ? 'primary' : item.color}>
                                                            {activeFilter.ingredientType === item.type && (
                                                                <FontAwesomeIcon icon={faFilter} className="me-1" />
                                                            )}
                                                            {item.label}
                                                        </Badge>
                                                    </Card.Title>
                                                    <Card.Text className="display-6">
                                                        {stats.ingredientType[item.type as keyof typeof stats.ingredientType]}
                                                    </Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* Thông báo hết hạn */}
            {hasExpiredItems && (
                <Alert variant="danger" className="text-center mb-3">
                    Một số nguyên liệu trong tủ lạnh đã hết hạn. Vui lòng kiểm tra và không sử dụng để đảm bảo sức khỏe.
                </Alert>
            )}

            {/* Khu vực Bảng dữ liệu */}
            <Card className="shadow-sm">
                <Card.Body>
                    {/* Thông báo active filter */}
                    {Object.keys(activeFilter).length > 0 && (
                        <Alert variant="info" className="mb-3">
                            <strong>Đang lọc:</strong> 
                            {activeFilter.expiryStatus === 'expired' && ' Thực phẩm đã hết hạn'}
                            {activeFilter.expiryStatus === 'aboutToExpire' && ' Thực phẩm sắp hết hạn'}
                            {activeFilter.expiryStatus === 'fresh' && ' Thực phẩm còn hạn'}
                            {activeFilter.ingredientType === 'dry' && ' Nguyên liệu khô'}
                            {activeFilter.ingredientType === 'seasoning' && ' Gia vị'}
                            {activeFilter.ingredientType === 'fresh' && ' Nguyên liệu tươi'}
                            {activeFilter.ingredientType === 'other' && ' Nguyên liệu khác'}
                            <Button variant="link" className="p-0 ms-2" onClick={clearAllFilters}>
                                (Bỏ lọc)
                            </Button>
                        </Alert>
                    )}

                    {/* Nội dung bảng */}
                    {displayItems.length === 0 ? (
                        <div className="text-center p-4">
                            <FontAwesomeIcon icon={faSnowflake} size="3x" className="text-muted mb-3" />
                            <h5 className="text-muted">
                                {(!fridge.ingredients || fridge.ingredients.length === 0) 
                                    ? 'Tủ lạnh hiện chưa có thực phẩm nào' 
                                    : 'Không tìm thấy thực phẩm phù hợp với bộ lọc'}
                            </h5>
                            <p className="text-muted">
                                {(!fridge.ingredients || fridge.ingredients.length === 0) 
                                    ? 'Hãy thêm nguyên liệu từ kho lưu trữ để bắt đầu!'
                                    : 'Vui lòng thử lại với bộ lọc khác'}
                            </p>
                            {fridge.ingredients && fridge.ingredients.length > 0 && (
                                <Button variant="outline-primary" onClick={clearAllFilters} className="mt-2">
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover bordered className="mb-0">
                                <thead className="text-center sticky-top table-dark">
                                    <tr>
                                        <th>STT</th>
                                        <th>Ảnh</th>
                                        <th>Tên nguyên liệu</th>
                                        <th>Số lượng</th>
                                        <th>Đơn vị tính</th>
                                        <th>Ngày cho vào tủ</th>
                                        <th>Ngày hết hạn</th>
                                        <th>Trạng thái</th>
                                        <th>Sử dụng</th>
                                    </tr>
                                </thead>
                                <tbody className="text-center">
                                    {displayItems.map((item, index) => {
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
                                                <td>
                                                    <strong>{item.ingredient.name}</strong>
                                                    {status === 'Đã hết hạn' && (
                                                        <div className="text-danger small mt-1">
                                                            Hiện tại nguyên liệu đã hết hạn.<br />
                                                            Vui lòng không sử dụng để đảm bảo sức khỏe.
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{item.quantity}</td>
                                                <td>{item.measure}</td>
                                                <td>{formatDate(item.createAt)}</td>
                                                <td>{formatDate(item.exprided)}</td>
                                                <td><ExpiryStatusBadge status={status} /></td>
                                                <td className="text-center">
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        title="Sử dụng / loại bỏ khỏi tủ"
                                                        onClick={() => {
                                                            if (status === 'Đã hết hạn') {
                                                                toast.warn("Nguyên liệu đã hết hạn. Vui lòng không sử dụng để đảm bảo sức khỏe.");
                                                                return;
                                                            }
                                                            setCurrentIngredient(item);
                                                            setShowModalRemoveFridgeGroup(true);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faRightFromBracket} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

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
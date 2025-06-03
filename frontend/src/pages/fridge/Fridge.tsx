import { 
  faRightFromBracket, 
  faSnowflake,
  faChartPie,
  faClock,
  faExclamationTriangle,
  faCheck,
  faFilter,
  faRefresh
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
        <div className="fridge-container" >
            {/* Header */}
            <div className="fridge-header d-flex justify-content-between align-items-center">
                <h2>
                    <FontAwesomeIcon icon={faSnowflake} className="me-2" />
                    Tủ lạnh của tôi
                </h2>
                <div className="d-flex gap-2">
                    {Object.keys(activeFilter).length > 0 && (
                        <Button 
                            variant="outline-light" 
                            size="sm"
                            onClick={clearAllFilters}
                            className="action-btn"
                        >
                            <FontAwesomeIcon icon={faFilter} className="me-1" />
                            Xóa bộ lọc
                        </Button>
                    )}
                    <Button 
                        variant="outline-light" 
                        onClick={() => window.location.reload()}
                        className="action-btn"
                    >
                        <FontAwesomeIcon icon={faRefresh} className="me-1" />
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Thông báo hết hạn */}
            {hasExpiredItems && (
                <Alert variant="danger" className="expiry-alert text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    Một số nguyên liệu trong tủ lạnh đã hết hạn. Vui lòng kiểm tra và không sử dụng để đảm bảo sức khỏe.
                </Alert>
            )}

            {/* Khu vực Thống kê */}
            {fridge.ingredients && fridge.ingredients.length > 0 && (
                <div className="stats-section">
                    <Card className="stats-card">
                        <Card.Header>
                            <FontAwesomeIcon icon={faChartPie} className="me-2" />
                            Thống kê tủ lạnh
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                {/* Cột thống kê trạng thái hạn sử dụng */}
                                <Col lg={6} className="mb-4 mb-lg-0">
                                    <h5 className="text-center mb-3 text-gradient">Theo trạng thái hạn sử dụng</h5>
                                    <div className="stats-grid expiry-stats">
                                        {[
                                            { 
                                                type: 'expired', 
                                                icon: faExclamationTriangle, 
                                                label: 'Hết hạn',
                                                className: 'expired'
                                            },
                                            { 
                                                type: 'aboutToExpire', 
                                                icon: faClock, 
                                                label: 'Sắp hết hạn',
                                                className: 'aboutToExpire'
                                            },
                                            { 
                                                type: 'fresh', 
                                                icon: faCheck, 
                                                label: 'Còn hạn',
                                                className: 'fresh'
                                            }
                                        ].map((item) => (
                                            <div
                                                key={item.type}
                                                className={`stat-item ${item.className} ${activeFilter.expiryStatus === item.type ? 'active' : ''}`}
                                                onClick={() => handleFilterClick({ expiryStatus: item.type as any })}
                                            >
                                                <FontAwesomeIcon 
                                                    icon={activeFilter.expiryStatus === item.type ? faFilter : item.icon} 
                                                    className="stat-icon"
                                                />
                                                <div className="stat-label">{item.label}</div>
                                                <div className="stat-number">
                                                    {stats.expiryStatus[item.type as keyof typeof stats.expiryStatus]}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Col>

                                {/* Cột thống kê loại nguyên liệu */}
                                <Col lg={6}>
                                    <h5 className="text-center mb-3 text-gradient">Theo loại nguyên liệu</h5>
                                    <div className="stats-grid ingredient-stats">
                                        {[
                                            { type: 'dry', label: 'Khô', color: 'secondary' },
                                            { type: 'seasoning', label: 'Gia vị', color: 'warning' },
                                            { type: 'fresh', label: 'Tươi', color: 'success' },
                                            { type: 'other', label: 'Khác', color: 'primary' }
                                        ].map((item) => (
                                            <div
                                                key={item.type}
                                                className={`stat-item ${activeFilter.ingredientType === item.type ? 'active' : ''}`}
                                                onClick={() => handleFilterClick({ ingredientType: item.type as any })}
                                            >
                                                <Badge 
                                                    bg={activeFilter.ingredientType === item.type ? 'primary' : item.color}
                                                    className="stat-icon"
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    {activeFilter.ingredientType === item.type && (
                                                        <FontAwesomeIcon icon={faFilter} className="me-1" />
                                                    )}
                                                    {item.label}
                                                </Badge>
                                                <div className="stat-number">
                                                    {stats.ingredientType[item.type as keyof typeof stats.ingredientType]}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </div>
            )}

            {/* Khu vực Bảng dữ liệu */}
            <Card className="main-content-card">
                <Card.Body>
                    {/* Thông báo active filter */}
                    {Object.keys(activeFilter).length > 0 && (
                        <Alert variant="info" className="filter-alert">
                            <strong>
                                <FontAwesomeIcon icon={faFilter} className="me-2" />
                                Đang lọc:
                            </strong> 
                            {activeFilter.expiryStatus === 'expired' && ' Thực phẩm đã hết hạn'}
                            {activeFilter.expiryStatus === 'aboutToExpire' && ' Thực phẩm sắp hết hạn'}
                            {activeFilter.expiryStatus === 'fresh' && ' Thực phẩm còn hạn'}
                            {activeFilter.ingredientType === 'dry' && ' Nguyên liệu khô'}
                            {activeFilter.ingredientType === 'seasoning' && ' Gia vị'}
                            {activeFilter.ingredientType === 'fresh' && ' Nguyên liệu tươi'}
                            {activeFilter.ingredientType === 'other' && ' Nguyên liệu khác'}
                            <Button variant="link" className="p-0 ms-2 fw-bold" onClick={clearAllFilters}>
                                (Bỏ lọc)
                            </Button>
                        </Alert>
                    )}

                    {/* Nội dung bảng */}
                    {displayItems.length === 0 ? (
                        <div className="empty-state">
                            <FontAwesomeIcon icon={faSnowflake} className="empty-icon" />
                            <h5>
                                {(!fridge.ingredients || fridge.ingredients.length === 0) 
                                    ? 'Tủ lạnh hiện chưa có thực phẩm nào' 
                                    : 'Không tìm thấy thực phẩm phù hợp với bộ lọc'}
                            </h5>
                            <p>
                                {(!fridge.ingredients || fridge.ingredients.length === 0) 
                                    ? 'Hãy thêm nguyên liệu từ kho lưu trữ để bắt đầu!'
                                    : 'Vui lòng thử lại với bộ lọc khác'}
                            </p>
                            {fridge.ingredients && fridge.ingredients.length > 0 && (
                                <Button variant="primary" onClick={clearAllFilters} className="action-btn">
                                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="table-container">
                            <div className="table-responsive">
                                <Table hover className="mb-0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '60px' }}>STT</th>
                                            <th style={{ width: '80px' }}>Ảnh</th>
                                            <th>Tên nguyên liệu</th>
                                            <th style={{ width: '100px' }}>Số lượng</th>
                                            <th style={{ width: '100px' }}>Đơn vị</th>
                                            <th style={{ width: '130px' }}>Ngày thêm</th>
                                            <th style={{ width: '130px' }}>Ngày hết hạn</th>
                                            <th style={{ width: '120px' }}>Trạng thái</th>
                                            <th style={{ width: '100px' }}>Sử dụng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayItems.map((item, index) => {
                                            const { status, style, tooltipText } = getExpiryStatus(item.exprided);

                                            return (
                                                <tr
                                                    key={index}
                                                    style={style}
                                                    title={tooltipText}
                                                >
                                                    <td className="text-center fw-bold">{index + 1}</td>
                                                    <td className="text-center">
                                                        <img
                                                            src={item.ingredient.image}
                                                            alt="Nguyên liệu"
                                                            className="ingredient-image"
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold text-dark">{item.ingredient.name}</div>
                                                        {status === 'Đã hết hạn' && (
                                                            <small className="text-danger fw-medium">
                                                                Đã hết hạn - Không nên sử dụng
                                                            </small>
                                                        )}
                                                    </td>
                                                    <td className="text-center fw-medium">{item.quantityDouble}</td>
                                                    <td className="text-center">{item.measure}</td>
                                                    <td className="text-center">{formatDate(item.createAt)}</td>
                                                    <td className="text-center">{formatDate(item.exprided)}</td>
                                                    <td className="text-center">
                                                        <ExpiryStatusBadge status={status} />
                                                    </td>
                                                    <td className="text-center">
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            className="action-btn"
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
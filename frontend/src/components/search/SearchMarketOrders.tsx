import { faArrowRight, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { Form, InputGroup } from 'react-bootstrap';
import Url from '../../utils/url';
import { useEffect, useState } from 'react';
import { updateMarkets } from '../../pages/market/MarketSlice';
import { useDispatch } from 'react-redux';
import { userInfoProps } from '../../utils/interface/Interface';

function SearchMarketOrders() {
    // Lấy thông tin người dùng
    const userInfoString: string | null = localStorage.getItem('userInfo');
    const userInfo: userInfoProps | null = userInfoString ? JSON.parse(userInfoString) : null;
    const dispatch = useDispatch();
    const [code, setCode] = useState('');
    const [status, setStatus] = useState(3);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const callApi2 = async (code: string, status: number) => {
        try {
            const response = await axios.get(Url(`market/filter/${userInfo?.id}`), {
                params: { code, status, minCreateAt: startDate, maxCreateAt: endDate },
            });
            return response.data;
        } catch (error) {
            alert('Không tìm được đơn hàng!!!');
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await callApi2(code, status);
                dispatch(updateMarkets(results));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [code, status, startDate, endDate]);

    return (
        <div className="">
            <Form className="d-flex">
                {/* Mã đơn hàng */}
                <InputGroup size="lg" style={{ width: '25%' }}>
                    <InputGroup.Text id="basic-addon1">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </InputGroup.Text>
                    <Form.Control
                        type="text"
                        placeholder="Nhập mã đơn hàng"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                </InputGroup>

                {/* Trạng thái món ăn */}
                <InputGroup size="lg" className="ms-4" style={{ width: '25%' }}>
                    <InputGroup.Text>Trạng thái</InputGroup.Text>
                    <Form.Select
                        value={status}
                        onChange={(e) => setStatus(parseInt(e.currentTarget.value))}
                    >
                        <option value="3">ALL</option>
                        <option value="1">Hoàn thành</option>
                        <option value="0">Chưa xong</option>
                    </Form.Select>
                </InputGroup>

                {/* Thời gian tạo */}
                <InputGroup size="lg" className="ms-4" style={{ width: '50%' }}>
                    <InputGroup.Text>Thời gian tạo</InputGroup.Text>
                    <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.currentTarget.value)}
                    ></Form.Control>
                    <div className="mx-3 my-auto">
                        <FontAwesomeIcon icon={faArrowRight} />
                    </div>
                    <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.currentTarget.value)}
                    ></Form.Control>
                </InputGroup>
            </Form>
        </div>
    );
}

export default SearchMarketOrders;

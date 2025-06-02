/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { Form, InputGroup } from 'react-bootstrap';
import Url from '../../utils/url';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { updateIngredients } from '../../pages/ingredient/IngredientSlice';

function SearchIngredients() {
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [status, setStatus] = useState<number>(3);
    const [type, setType] = useState<string>('ALL');

    const callApi2 = async (name: string, status: number, type: string) => {
        try {
            const response = await axios.get(Url(`ingredient/search`), {
                params: { name: name, status: status, type: type },
            });
            return response.data;
        } catch (error) {
            alert('Không tìm được Ingredients!!!');
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await callApi2(name, status, type);
                dispatch(updateIngredients(results));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [name, status, type, dispatch]);

    return (
        <div className="">
            <Form className="d-flex">
                {/* Tên món ăn */}
                <InputGroup size="lg" style={{ width: '30%' }}>
                    <InputGroup.Text id="basic-addon1">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </InputGroup.Text>
                    <Form.Control
                        type="text"
                        placeholder="Nhập tên nguyên liệu"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </InputGroup>

                {/* Trạng thái món ăn */}
                <InputGroup size="lg" className="ms-4" style={{ width: '30%' }}>
                    <InputGroup.Text>Trạng thái</InputGroup.Text>
                    <Form.Select
                        value={status}
                        onChange={(e) => setStatus(parseInt(e.currentTarget.value))}
                    >
                        <option value="3">Tất cả</option>
                        <option value="1">Sẵn sàng đặt món</option>
                        <option value="0">Đã xóa</option>
                    </Form.Select>
                </InputGroup>

                {/*Loại nguyên liệu */}
                <InputGroup size="lg" className="ms-4" style={{ width: '35%' }}>
                    <InputGroup.Text>Loại nguyên liệu</InputGroup.Text>
                    <Form.Select
                        value={type}
                        onChange={(e) => setType(e.currentTarget.value)}
                    >
                        <option value="ALL">Tất cả</option>
                        <option value="INGREDIENT">Nguyên liệu</option>
                        <option value="FRESH_INGREDIENT">Nguyên liệu tươi</option>
                        <option value="DRY_INGREDIENT">Nguyên liệu khô</option>
                        <option value="SEASONING">Gia vị nêm</option>
                    </Form.Select>
                </InputGroup>
            </Form>
        </div>
    );
}

export default SearchIngredients;

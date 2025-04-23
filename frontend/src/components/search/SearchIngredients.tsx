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

    const callApi2 = async (name: string, status: number) => {
        try {
            const response = await axios.get(Url(`ingredient/search`), {
                params: { name: name, status: status },
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
                const results = await callApi2(name, status);
                dispatch(updateIngredients(results));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [name, status]);

    return (
        <div className="">
            <Form className="d-flex">
                {/* Tên món ăn */}
                <InputGroup size="lg" style={{ width: '40%' }}>
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
                <InputGroup size="lg" className="ms-4" style={{ width: '25%' }}>
                    <InputGroup.Text>Trạng thái</InputGroup.Text>
                    <Form.Select
                        value={status}
                        onChange={(e) => setStatus(parseInt(e.currentTarget.value))}
                    >
                        <option value="3">ALL</option>
                        <option value="1">Sẵn sàng đặt món</option>
                        <option value="0">Đã xóa</option>
                    </Form.Select>
                </InputGroup>
            </Form>
        </div>
    );
}

export default SearchIngredients;

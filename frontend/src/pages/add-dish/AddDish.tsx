import { faArrowLeft, faMagnifyingGlass, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Form, Image, InputGroup, Row, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ingredientsSelector } from '../../redux/selectors';
import axios from 'axios';
import Url from '../../utils/url';
import { updateIngredients } from '../ingredient/IngredientSlice';
import { ingredientProps } from '../../utils/interface/Interface';

function AddMarketOrder() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const listIngredients = useSelector(ingredientsSelector);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [type, setType] = useState('Bữa chính');
    const [recipeDes, setRecipeDes] = useState('');

    // Tab ingredients
    const [nameIngre, setNameIngre] = useState('');
    const [showResultIngredient, setShowResultIngredient] = useState(false);
    const [ingredientsSelected, setIngredientsSelected] = useState<ingredientProps[]>([]);
    const [measureIngredient, setMeasureIngredient] = useState(['']);
    const [quantityIngredient, setQuantityIngredient] = useState(['']);

    const callApi2 = async (name: string) => {
        try {
            const response = await axios.get(Url(`ingredient/search`), {
                params: { name: name, status: 1 },
            });
            return response.data;
        } catch (error) {
            alert('Không tìm được nguyên liệu!!!');
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await callApi2(nameIngre);
                dispatch(updateIngredients(results));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [nameIngre]);

    const handleClickItemIngredient = (item: ingredientProps) => {
        if (!ingredientsSelected.includes(item)) setIngredientsSelected((prev) => [...prev, item]);
    };

    const handleDeleteIngredient = (id: number) => {
        setIngredientsSelected(ingredientsSelected.filter((item) => item.id !== id));
    };

    const [listMeasure, setListMeasure] = useState<any>([]);

    useEffect(() => {
        const fetchMeasure = async () => {
            try {
                const result = await axios.get(Url('market/attribute/measures'));
                setListMeasure(result.data);
            } catch (error) {
                alert(error);
            }
        };
        fetchMeasure();
    }, []);

    const handleSubmit = async () => {
        // Format dataSubmit trước khi post Api
        const dataSubmit: any = {};
        dataSubmit.name = name;
        dataSubmit.descriptions = description;
        dataSubmit.image = image;
        dataSubmit.type = type;
        dataSubmit.recipeDes = recipeDes;

        dataSubmit.ingredients = [];
        ingredientsSelected.forEach((ingredient, index) => {
            dataSubmit.ingredients.push({
                ingredient: ingredient,
                measure: measureIngredient[index],
                quantity: quantityIngredient[index],
            });
        });

        // Gọi api tạo đơn đi chợ
        try {
            await axios.post(Url('dish'), dataSubmit);
        } catch (error: any) {
            alert(error.response.data.message);
        }

        setTimeout(() => {
            navigate('/cook');
        }, 200);
    };

    return (
        <div>
            <div className="mb-3 d-flex justify-content-between">
                <div className="d-flex">
                    <Link to="/cook" className="me-3 text-dark">
                        <FontAwesomeIcon icon={faArrowLeft} size="2xl" className="p-2" />
                    </Link>
                    <h2>Tạo món ăn mới</h2>
                </div>
                <Button className="fs-5 me-3" style={{ width: '15%' }} onClick={handleSubmit}>
                    Tạo món ăn
                </Button>
            </div>
            <Form className="me-3">
                <Row>
                    <Col>
                        {/* Name */}
                        <Form.Group className="mb-3" controlId="nameDish">
                            <Form.Label>Tên món ăn</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên món ăn"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>

                        {/* Description  */}
                        <Form.Group className="mb-3" controlId="desDish">
                            <Form.Label>Mô tả món ăn</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập mô tả món ăn"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>

                        {/* Image  */}
                        <Form.Group className="mb-3" controlId="ImageDish">
                            <Form.Label>Link ảnh món ăn</Form.Label>
                            <Form.Control
                                type="text"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                        </Form.Group>
                    </Col>

                    <Col>
                        {/* Type */}
                        <Form.Group className="mb-3" controlId="typeDish">
                            <Form.Label>Loại món ăn</Form.Label>
                            <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="Bữa chính">Bữa chính</option>
                                <option value="Bữa phụ">Bữa phụ</option>
                            </Form.Select>
                        </Form.Group>

                        {/* recipeDes */}
                        <Form.Group className="mb-3" controlId="recipeDes">
                            <Form.Label>Cách nấu món ăn</Form.Label>
                            <Form.Control
                                className="pb-3"
                                as="textarea"
                                rows={4}
                                value={recipeDes}
                                onChange={(e) => setRecipeDes(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>

            <hr />

            <InputGroup className="position-relative" size="lg" style={{ width: '40%' }}>
                <InputGroup.Text id="basic-addon1">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder="Nhập tên nguyên liệu"
                    value={nameIngre}
                    onChange={(e) => setNameIngre(e.target.value)}
                    onFocus={() => setShowResultIngredient(true)}
                    onBlur={() =>
                        setTimeout(() => {
                            setShowResultIngredient(false);
                        }, 200)
                    }
                />
                {showResultIngredient && (
                    <div
                        className="position-absolute bg-light top-110 start-0 end-0 border border-dark-subtle overflow-y-scroll"
                        style={{ maxHeight: '15rem' }}
                    >
                        {listIngredients.map((item, index) => (
                            <div
                                className="hover p-1 d-flex align-items-center border"
                                key={index}
                                onClick={() => handleClickItemIngredient(item)}
                            >
                                <Image
                                    src={item.image}
                                    alt="item"
                                    style={{ width: '3rem', height: '3rem' }}
                                />
                                <div className="ms-3">{item.name}</div>
                            </div>
                        ))}
                    </div>
                )}
            </InputGroup>

            <Table bordered className="mt-3">
                <thead className="fs-5 ">
                    <tr>
                        <th>STT</th>
                        <th>Ảnh</th>
                        <th>Tên nguyên liệu</th>
                        <th>Đơn vị tính</th>
                        <th>Số lượng</th>
                        <th className="text-center">Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {ingredientsSelected.map((ingredient, index) => (
                        <tr key={index}>
                            <td style={{ width: '5%' }}>{index + 1}</td>
                            <td>
                                <img
                                    src={ingredient.image}
                                    alt="anh"
                                    style={{ height: '3rem', width: '3rem' }}
                                />
                            </td>
                            <td>{ingredient.name}</td>
                            <td style={{ width: '15%' }}>
                                <Form.Group controlId={`measure ${index}`}>
                                    <Form.Control
                                        type="text"
                                        list="listMeasure"
                                        value={measureIngredient[index]}
                                        onChange={(e) => {
                                            const updatedmeasureIngredient = [...measureIngredient];
                                            updatedmeasureIngredient[index] = e.target.value;
                                            setMeasureIngredient(updatedmeasureIngredient);
                                        }}
                                    />
                                </Form.Group>
                                <datalist id="listMeasure">
                                    {listMeasure.map((measure: any, index: any) => (
                                        <option value={measure} key={index}>
                                            {measure}
                                        </option>
                                    ))}
                                    {/* <option value="quả">quả</option>
                                            <option value="quả">quả</option>
                                            <option value="quả">quả</option> */}
                                </datalist>
                            </td>
                            <td style={{ width: '15%' }}>
                                <Form.Group controlId={`quantity ${index}`}>
                                    <Form.Control
                                        type="number"
                                        value={quantityIngredient[index]}
                                        onChange={(e) => {
                                            const updatedQuantityIngredient = [
                                                ...quantityIngredient,
                                            ];
                                            updatedQuantityIngredient[index] = e.target.value;
                                            setQuantityIngredient(updatedQuantityIngredient);
                                        }}
                                    />
                                </Form.Group>
                            </td>
                            <td className="text-center">
                                <div
                                    onClick={() => {
                                        handleDeleteIngredient(ingredient.id);
                                    }}
                                >
                                    <FontAwesomeIcon
                                        className="mt-2 p-1"
                                        size="xl"
                                        icon={faTrashCan}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default AddMarketOrder;

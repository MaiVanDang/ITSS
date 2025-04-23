import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Url from '../../utils/url';
import { userInfo } from '../../utils/userInfo';
import { groupsProps } from '../../utils/interface/Interface';
import CardGroup from '../../components/card-group/CardGroup';
import { Button, Form, Modal } from 'react-bootstrap';

function Group() {
    const [listGroup, setListGroup] = useState<groupsProps[]>([]);
    const [showModalAddGroup, setShowModalAddGroup] = useState(false);
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    useEffect(() => {
        const fetchApi = async () => {
            try {
                const results = await axios.get(Url(`user/groups/${userInfo?.id}`));
                setListGroup(results.data);
            } catch (error: any) {
                alert(error.response.data.message);
                console.log(error);
            }
        };
        fetchApi();
    }, [showModalAddGroup]);

    const handleAddGroup = async () => {
        try {
            await axios.post(Url(`group`), {
                name,
                leader: userInfo,
                image,
            });
            setShowModalAddGroup(false);
        } catch (error: any) {
            console.log(error);
            alert(error.response.data.message);
        }
    };

    return (
        <div className="d-flex flex-wrap">
            {listGroup?.map((group, index) => (
                <CardGroup key={index} group={group} />
            ))}
            <div
                className="ms-3 me-4 mb-5 border border-black shadow-sm center flex-column"
                style={{
                    width: '17.5vw',
                    aspectRatio: '1/1',
                    background: 'var(--background-color)',
                }}
                onClick={() => setShowModalAddGroup(true)}
            >
                <FontAwesomeIcon icon={faPlus} style={{ width: 170, height: 170 }} />
                <div className="fw-medium fs-4">Thêm nhóm</div>
            </div>
            <Modal show={showModalAddGroup} onHide={() => setShowModalAddGroup(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Tạo nhóm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {' '}
                        <Form.Group className="mb-3" controlId="ControlInput1">
                            <Form.Label>Tên nhóm</Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="ControlTextarea1">
                            <Form.Label>Link ảnh nhóm</Form.Label>
                            <Form.Control
                                type="text"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalAddGroup(false)}>
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleAddGroup}>Xác nhận</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Group;
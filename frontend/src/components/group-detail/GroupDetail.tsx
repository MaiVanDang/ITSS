import {
    faArrowLeft,
    faPlus,
    faRightFromBracket,
    faTrashCan,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Url from '../../utils/url';
import {
    fridgeProps,
    groupsProps,
    ingredientsProps,
    marketProps,
    userInfoProps,
} from '../../utils/interface/Interface';
import { Badge, Button, Form, Modal, Tab, Table, Tabs, Toast } from 'react-bootstrap';
import { userInfo } from '../../utils/userInfo';
import ModalDetailMarketOrder from '../modal/ModalDetailMarketOrder';
import ModalAddMemberToGroup from '../modal/ModalAddMemberToGroup';
import ModalRemoveFridgeGroup from '../modal/ModalRemoveFridgeGroup';

function GroupDetail() {
    const param = useParams();
    const navigate = useNavigate();

    const [showModalDetailMarketOrder, setShowModalDetailMarketOrder] = useState(false);
    const [currentIdMarketOrder, setCurrentIdMarketOrder] = useState(1);
    const [showModalDeleteMember, setShowModalDeleteMember] = useState(false);
    const [showModalAddMember, setShowModalAddMember] = useState(false);
    const [currentMember, setCurrentMember] = useState<userInfoProps>({} as userInfoProps);
    const [showToast, setShowToast] = useState(false);
    const [fridge, setFridge] = useState<fridgeProps>({} as fridgeProps);
    const [currentIngredient, setCurrentIngredient] = useState<ingredientsProps>(
        {} as ingredientsProps,
    );
    const [showModalRemoveFridgeGroup, setShowModalRemoveFridgeGroup] = useState(false);

    const [group, setGroup] = useState<groupsProps>({} as groupsProps);
    const [marketOrder, setMarketOrder] = useState<marketProps[]>([]);

    const [editNameGroup, setEditNameGroup] = useState('');
    const [editImageGroup, setEditImageGroup] = useState('');
    const [showModalDeleteGroup, setShowModalDeleteGroup] = useState(false);

    const [reload, setReload] = useState(2);

    useEffect(() => {
        const fetchApiGroupDetail = async () => {
            try {
                const results = await axios.get(Url(`group/${param.id}`));
                setGroup(results.data);
            } catch (error: any) {
                alert(error.response.data.message);
                console.log(error);
            }
        };

        const fetchApiGroupMkOrder = async () => {
            try {
                const results = await axios.get(Url(`market/group/${param.id}`));
                setMarketOrder(results.data);
            } catch (error: any) {
                alert(error.response.data.message);
                console.log(error);
            }
        };

        const fetchApiGroupFridge = async () => {
            try {
                const results = await axios.get(Url(`fridge/group/${param.id}`));
                setFridge(results.data);
            } catch (error: any) {
                alert(error.response.data.message);
                console.log(error);
            }
        };

        fetchApiGroupDetail();
        fetchApiGroupMkOrder();
        fetchApiGroupFridge();
    }, [
        reload,
        param,
        showToast,
        showModalDetailMarketOrder,
        showModalAddMember,
        showModalRemoveFridgeGroup,
    ]);

    const handleDeleteMember = async (memberId: number) => {
        try {
            const groupId = parseInt(param.id!);
            const result = await axios.delete(Url(`group/member`), {
                data: { groupId, memberId },
            });
            setShowModalDeleteMember(false);
            if (result.data === 'success') {
                setShowToast(true);
            }
        } catch (error: any) {
            alert(error.response.data.message);
        }
    };

    const handleDeleteGroup = async () => {
        try {
            await axios.delete(Url(`group/${group.id}`));
            navigate('/group');
        } catch (error: any) {
            alert(error.response.data.message);
            console.log(error);
        }
    };

    const handleEditNameGroup = async () => {
        try {
            await axios.put(Url(`group`), {
                id: group.id,
                name: editNameGroup,
                image: '',
            });
            setReload(Math.random());
        } catch (error: any) {
            alert(error.response.data.message);
            console.log(error);
        }
    };

    const handleEditImage = async () => {
        try {
            await axios.put(Url(`group`), {
                id: group.id,
                name: '',
                image: editImageGroup,
            });
            setReload(Math.random());
        } catch (error: any) {
            alert(error.response.data.message);
            console.log(error);
        }
    };

    return (
        <div className="position-relative">
            <div className="d-flex">
                <Link to="/group" className="me-3 text-dark">
                    <FontAwesomeIcon icon={faArrowLeft} size="2xl" className="p-2" />
                </Link>
                <h2>{group.name}</h2>
            </div>
            <div className="mt-3">
                {/* Tab đơn đi chợ của nhóm */}
                <Tabs defaultActiveKey="home" id="uncontrolled-tab-example" className="mb-3">
                    <Tab eventKey="home" title="Đơn đi chợ">
                        <div>
                            <div className="overflow-y-scroll" style={{ height: '92vh' }}>
                                <Table hover bordered>
                                    <thead className="fs-5 ">
                                        <tr>
                                            <th>STT</th>
                                            <th>Mã đơn</th>
                                            <th>Người tạo đơn</th>
                                            <th>Trạng thái</th>
                                            <th>Ngày tạo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {marketOrder.map((order, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <div>{order.code}</div>
                                                </td>
                                                <td
                                                    onClick={() => {
                                                        setCurrentIdMarketOrder(order.id);
                                                        setShowModalDetailMarketOrder(true);
                                                    }}
                                                >
                                                    {order.user.name}
                                                </td>
                                                <td>
                                                    {order.status === 1 ? (
                                                        <Badge pill bg="success">
                                                            Hoàn thành
                                                        </Badge>
                                                    ) : (
                                                        <Badge pill bg="warning">
                                                            Chưa xong
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td>{order.createAt}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                <ModalDetailMarketOrder
                                    show={showModalDetailMarketOrder}
                                    hide={() => setShowModalDetailMarketOrder(false)}
                                    indexOrder={currentIdMarketOrder}
                                    leaderId={group.leader?.id}
                                    listMember={group.groupMembers}
                                    fridgeId={fridge.id}
                                />
                            </div>
                        </div>
                    </Tab>

                    {/* Tab member */}
                    {group.leader?.id && userInfo?.id && (
                        <Tab eventKey="member" title="Thành viên">
                            <div>
                                <div className="mt-4 fs-5 fw-medium d-flex justify-content-around">
                                    <div className="">Tên thành viên</div>
                                    <div className=""></div>
                                    <div className=""></div>
                                    <div className="">Role</div>
                                </div>
                                <hr className="mb-0" />
                                <div className="d-flex flex-column">
                                    {group.groupMembers.map((member, index) => (
                                        <div key={index} className="position-relative">
                                            <div
                                                className="w-100 d-flex align-items-center"
                                                style={{ minHeight: '4rem' }}
                                            >
                                                <img
                                                    src={member.avatar}
                                                    alt="avatar"
                                                    style={{
                                                        marginLeft: '6.5rem',
                                                        width: '2.5rem',
                                                        height: '2.5rem',
                                                    }}
                                                />
                                                <div className="ms-3 flex-grow-1">
                                                    {member.name}
                                                </div>
                                                <div
                                                    className="fs-5"
                                                    style={{ marginRight: '9rem' }}
                                                >
                                                    {member.id === group.leader.id
                                                        ? 'Owner'
                                                        : 'Member'}
                                                </div>
                                                <div className="position-absolute end-2">
                                                    {group.leader.id === userInfo?.id &&
                                                        member.id !== userInfo?.id && (
                                                            <div
                                                                onClick={() => {
                                                                    setShowModalDeleteMember(true);
                                                                    setCurrentMember(member);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={faXmark}
                                                                    size="xl"
                                                                    className="p-1"
                                                                />
                                                            </div>
                                                        )}
                                                    {member.id === userInfo?.id && (
                                                        <div className="fw-light fs-5">Bạn</div>
                                                    )}
                                                </div>
                                            </div>
                                            <hr className="m-0" />
                                        </div>
                                    ))}
                                    {userInfo?.id === group.leader.id && (
                                        <Button
                                            className="mt-3 fs-5 p-2 border"
                                            style={{
                                                marginLeft: '6rem',
                                                width: '14rem',
                                                minHeight: '3rem',
                                                backgroundColor: '#DDA0DD',
                                                color: 'black',
                                            }}
                                            onClick={() => setShowModalAddMember(true)}
                                        >
                                            Thêm thành viên
                                            <FontAwesomeIcon className="ms-2" icon={faPlus} />
                                        </Button>
                                    )}
                                </div>

                                {/* Modal delete member */}
                                <Modal
                                    show={showModalDeleteMember}
                                    onHide={() => setShowModalDeleteMember(false)}
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title>Xóa thành viên</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        Bạn có chắc chắn xóa <b>{currentMember.name}</b> khỏi nhóm?
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setShowModalDeleteMember(false)}
                                        >
                                            Hủy bỏ
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => {
                                                handleDeleteMember(currentMember.id);
                                                setShowModalDeleteMember(false);
                                            }}
                                        >
                                            Xoá
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                {/* Toast xóa thành viên thành công */}
                                <Toast
                                    onClose={() => setShowToast(false)}
                                    show={showToast}
                                    delay={3000}
                                    autohide
                                    bg="success"
                                    className="position-absolute end-3 top-3"
                                >
                                    <Toast.Header>
                                        <strong className="me-auto">Thành công</strong>
                                    </Toast.Header>
                                    <Toast.Body className="bg-light">
                                        Đã xóa {currentMember.name} khỏi nhóm
                                    </Toast.Body>
                                </Toast>

                                {/* Modal Add member */}
                                <ModalAddMemberToGroup
                                    show={showModalAddMember}
                                    hide={() => setShowModalAddMember(false)}
                                    groupId={parseInt(param.id!)}
                                />
                            </div>
                        </Tab>
                    )}
                    <Tab eventKey="fridge" title="Tủ lạnh">
                        <div className="overflow-y-scroll" style={{ height: '92vh' }}>
                            <Table hover bordered>
                                <thead className="fs-5 ">
                                    <tr>
                                        <th>STT</th>
                                        <th>Ảnh</th>
                                        <th>Tên nguyên liệu</th>
                                        <th>Số lượng</th>
                                        <th>Đơn vị tính</th>
                                        <th>Ngày cho vào tủ</th>
                                        <th>Ngày hết hạn</th>
                                        <th>Sử dụng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fridge.ingredients?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <img
                                                    src={item.ingredient.image}
                                                    alt="anh"
                                                    style={{ height: '3rem', width: '3rem' }}
                                                />
                                            </td>
                                            <td>{item.ingredient.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.measure}</td>
                                            <td>{item.createAt}</td>
                                            <td>{item.exprided}</td>
                                            <td
                                                onClick={() => {
                                                    setCurrentIngredient(item);
                                                    setShowModalRemoveFridgeGroup(true);
                                                }}
                                            >
                                                <FontAwesomeIcon
                                                    size="lg"
                                                    icon={faRightFromBracket}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {/* ModalRemoveFridgeGroup */}
                            {currentIngredient && (
                                <ModalRemoveFridgeGroup
                                    show={showModalRemoveFridgeGroup}
                                    hide={() => setShowModalRemoveFridgeGroup(false)}
                                    ingredient={currentIngredient}
                                />
                            )}
                        </div>
                    </Tab>

                    {/* Tab cài đặt */}
                    <Tab eventKey="setting" title="Cài đặt">
                        <Form className="mb-5 w-100">
                            <div className="mb-3 d-flex align-items-end">
                                <Form.Group className="w-75" controlId="nameGroup1">
                                    <Form.Label>Tên nhóm</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tên nhóm mới"
                                        value={editNameGroup}
                                        onChange={(e) => setEditNameGroup(e.target.value)}
                                    />
                                </Form.Group>
                                <Button
                                    className="ms-3"
                                    style={{ width: '10%', height: 38 }}
                                    onClick={handleEditNameGroup}
                                >
                                    Xác nhận
                                </Button>
                            </div>

                            <div className="mb-3 d-flex align-items-end">
                                <Form.Group className="w-75" controlId="imageGroup1">
                                    <Form.Label>Link ảnh nhóm</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập link ảnh mới"
                                        value={editImageGroup}
                                        onChange={(e) => setEditImageGroup(e.target.value)}
                                    />
                                </Form.Group>
                                <Button
                                    className="ms-3"
                                    style={{ width: '10%', height: 38 }}
                                    onClick={handleEditImage}
                                >
                                    Xác nhận
                                </Button>
                            </div>
                        </Form>

                        {/* Xóa nhóm */}
                        <Button variant="danger" onClick={() => setShowModalDeleteGroup(true)}>
                            Xóa nhóm
                        </Button>
                        <Modal
                            show={showModalDeleteGroup}
                            onHide={() => setShowModalDeleteGroup(false)}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Xóa nhóm</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>Bạn có chắc chắn muốn xóa {group.name} không?</Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowModalDeleteGroup(false)}
                                >
                                    Hủy bỏ
                                </Button>
                                <Button variant="danger" onClick={handleDeleteGroup}>
                                    Xoá
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}

export default GroupDetail;

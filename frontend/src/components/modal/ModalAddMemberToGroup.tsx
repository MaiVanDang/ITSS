import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';
import Url from '../../utils/url';
import { useDispatch } from 'react-redux';
import { marketProps, userInfoProps } from '../../utils/interface/Interface';
import { deleteMarket } from '../../pages/market/MarketSlice';
import { useEffect, useState } from 'react';

interface ModalAddMemberToGroupProps {
    show: boolean;
    hide: () => void;
    groupId: number;
}

function ModalAddMemberToGroup({ show, hide, groupId }: ModalAddMemberToGroupProps) {
    const [listUsers, setListUsers] = useState<userInfoProps[]>([]);
    const [addedMembers, setAddedMembers] = useState<number[]>([]);
    // Xóa đơn đi chợ
    // const handleDeleteMarketOrder = async () => {
    //     try {
    //         await axios.delete(Url(`shopping/${order.id}`));
    //         dispatch(deleteMarket(order.id));
    //         hide();
    //     } catch (error: any) {
    //         alert(error.response.data.message);
    //     }
    // };
    useEffect(() => {
        const fetchApiListUsers = async () => {
            try {
                const result = await axios.get(Url('group-users/' + groupId));
                setListUsers(result.data);
            } catch (error: any) {
                alert(error.response.data.message);
            }
        };

        fetchApiListUsers();
    }, [groupId, show]);

    const handleAddMember = async (memberId: number) => {
        try {
            if (addedMembers.includes(memberId)) {
                return; // Nếu thành viên đã được thêm, không thực hiện gì cả
            }
            await axios.post(Url('group/adding'), {
                id: groupId,
                memberId,
            });
            setAddedMembers([...addedMembers, memberId]);
        } catch (error: any) {
            alert(error.response.data.message);
        }
    };

    return (
        <Modal show={show} onHide={hide}>
            <Modal.Header closeButton>
                <Modal.Title>Thêm thành viên</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {listUsers.map((member, index) => (
                    <div key={index} className="position-relative">
                        <div
                            className="w-100 d-flex align-items-center"
                            style={{ minHeight: '4rem' }}
                        >
                            <img
                                src={member.avatar}
                                alt="avatar"
                                style={{
                                    marginLeft: '1rem',
                                    width: '2.5rem',
                                    height: '2.5rem',
                                }}
                            />
                            <div className="ms-3 flex-grow-1">{member.name}</div>
                            <Button
                                onClick={() => handleAddMember(member.id)}
                                disabled={addedMembers.includes(member.id)}
                            >
                                Thêm
                            </Button>
                        </div>
                        <hr className="m-0" />
                    </div>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>
                    Xong
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalAddMemberToGroup;

import { faShareFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal, Table } from 'react-bootstrap';
import { groupsProps, marketProps } from '../../utils/interface/Interface';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Url from '../../utils/url';
import { userInfo } from '../../utils/userInfo';

interface ModalShareMarketOrderkProps {
    order: marketProps;
    show: boolean;
    hide: () => void;
}

function ModalShareMarketOrder({ order, show, hide }: ModalShareMarketOrderkProps) {
    const [listGroup, setListGroup] = useState<groupsProps[]>([]);

    //     Call API lấy list group
    useEffect(() => {
        const fetchListGroups = async () => {
            try {
                const results = await axios.get(Url(`user/leader/${userInfo?.id}`));
                setListGroup(results.data);
            } catch (error: any) {
                alert(error.response.data.message);
            }
        };

        fetchListGroups();
    }, [show]);

    const handleShareSubmit = async (group: groupsProps) => {
        try {
            const result = await axios.post(Url(`group/share`), {
                shoppingId: order.id,
                groupId: group.id,
            });
            console.log(result);
        } catch (error: any) {
            alert(error.response.data.message);
        }
    };

    return (
        <Modal show={show} onHide={hide}>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faShareFromSquare} />
                    <div className="ms-2"> Chia sẻ đơn đi chợ</div>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="fs-5">
                <Table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tên nhóm</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {listGroup.map((group, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{group.name}</td>
                                <td className="d-flex justify-content-end">
                                    <Button
                                        // disabled={job.group_shared?.includes(group.name)}
                                        onClick={() => handleShareSubmit(group)}
                                    >
                                        Chia sẻ
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>
                    Xong
                </Button>

                {/* <Button variant="danger" onClick={handleShareSubmit}>
			Xóa
		    </Button> */}
            </Modal.Footer>
        </Modal>
    );
}

export default ModalShareMarketOrder;

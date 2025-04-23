import { Figure, Modal, Tab, Tabs } from 'react-bootstrap';
import { useState } from 'react';

import './cardgroup.scss';
import { groupsProps } from '../../utils/interface/Interface';
import { Link } from 'react-router-dom';

interface CardGroupProps {
    group: groupsProps;
}

function CardGroup({ group }: CardGroupProps) {
    return (
        <Link className="text-dark" to={`/group/${group.id}`}>
            <div
                className="ms-3 me-4 mb-5 border border-black shadow-sm center flex-column"
                style={{
                    width: '17.5vw',
                    aspectRatio: '1/1',
                    background: 'var(--background-color)',
                    cursor: 'pointer',
                }}
            >
                <Figure className="mb-4">
                    <Figure.Image
                        alt="Ảnh nhóm"
                        src={group.image}
                        style={{ objectFit: 'cover', width: 200, height: 200 }}
                    />
                </Figure>
                <div className="fw-medium fs-4">{group.name}</div>
            </div>
        </Link>
    );
}

export default CardGroup;

import { faAngleRight} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import './navitem.scss';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

interface NavItemProps {
    text: string;
    classN?: string;
    icon: IconProp;
    href: string;
}

const NavItem : React.FC<NavItemProps> = ({ text, classN, icon, href}) =>{
    const btnRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        if (btnRef.current) {
            if (window.location.pathname.includes(href)) {
                btnRef.current.classList.add('nav_active');
            } else btnRef.current.classList.remove('nav_active');
        }
    }, [window.location.pathname]);
    
    return (
        <Link to={`${href}`} style={{ textDecoration: 'none' }}>
            <Button
                ref={btnRef}
                className={`nav-button w-100 d-flex justify-content-start align-items-center ${classN}`}
            >
                {icon && (
                    <span className="me-3">
                        <FontAwesomeIcon icon={icon} />
                    </span>
                )}
                <span className="flex-grow-1 text-start">{text}</span>
                <span className="nav-icons">
                    <FontAwesomeIcon icon={faAngleRight} />
                </span>
            </Button>
        </Link>
    );
};

export default NavItem;
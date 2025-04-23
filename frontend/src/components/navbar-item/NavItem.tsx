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
        <Link to={`${href}`}>
            <Button
                ref={btnRef}
                variant="dark"
                className={`nav-button border text-dark -sm mt-4 fs-6 w-100 d-flex justify-content-start align-items-center position-relative ${classN}`}
                style={{ backgroundColor: '#E6E6FA', minHeight: 70 }}
            >
                {icon && (
                    <span className="me-2 fs-6">
                        <FontAwesomeIcon icon={icon} />
                    </span>
                )}
                {text}
                <span className="nav-icons position-absolute end-15 ">
                    <FontAwesomeIcon icon={faAngleRight} />
                </span>
            </Button>
        </Link>
    );
};
export default NavItem;
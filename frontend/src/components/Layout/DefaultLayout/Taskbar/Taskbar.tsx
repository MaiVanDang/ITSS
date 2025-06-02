/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBell,
    faCircleUser,
    faHeart,
    faHouse,
    faKitchenSet,
    faPeopleGroup,
    faPlus,
    faStore,
    faToiletPortable,
    faUtensils,
} from '@fortawesome/free-solid-svg-icons';

import NavItem from '../../../navbar-item/NavItem';
import SignOut from '../../../sign-out/SignOut';
import './Taskbar.scss';
import { useSelector } from 'react-redux';
import { isLoginSelector } from '../../../../redux/selectors';
import { getUserInfo } from '../../../../utils/userInfo';

function Taskbar() {
    const isLogin = useSelector(isLoginSelector);
    const userInfo = getUserInfo();

    return (
        <div className="d-flex flex-column taskbar-container h-100">
            {/* Header section */}
            <div className="taskbar-header">
                {/* Nếu chưa đăng nhập */}
                {!isLogin && (
                    <div className="login-section">
                        <FontAwesomeIcon icon={faCircleUser} className="fa-circle-user" />
                        <div>
                            <Link to="/sign-up" className="taskbar_link me-2">
                                Đăng ký
                            </Link>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>/</span>
                            <Link to="/sign-in" className="taskbar_link ms-2">
                                Đăng nhập
                            </Link>
                        </div>
                    </div>
                )}
                
                {/* Nếu đã đăng nhập */}
                {isLogin && (
                    <>
                        {userInfo?.avatar ? (
                            <img
                                src={userInfo.avatar}
                                alt="Avatar"
                                className="taskbar-img"
                            />
                        ) : (
                            <div className="taskbar-avatar">
                                MVD
                            </div>
                        )}
                        <div className="taskbar-user-name">
                            {userInfo?.name || 'Mai Văn Đăng'}
                        </div>
                        <div className="taskbar-user-role">
                            Quản lý bếp
                        </div>
                    </>
                )}
            </div>

            {/* Navigation Menu */}
            {isLogin && (
                <div className="nav-menu flex-grow-1">
                    <NavItem text="Món ăn" icon={faUtensils} href="/cook" />
                    <NavItem text="Nguyên liệu" icon={faKitchenSet} href="/ingredients" />
                    <NavItem text="Đơn đi chợ" icon={faStore} href="/market" />
                    <NavItem text="Tủ lạnh" icon={faToiletPortable} href="/fridge" />
                    <NavItem text="Nhà kho" icon={faHouse} href="/store" />
                    <NavItem text="Xem nhóm" icon={faPeopleGroup} href="/group" />
                    
                    <div className="mt-auto">
                        <SignOut/>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Taskbar;
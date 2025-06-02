import { ReactNode } from 'react';
import Container from 'react-bootstrap/Container';
import Taskbar from './Taskbar/Taskbar';

interface DefaultLayoutProps {
    children?: ReactNode;
}

function DefaultLayout({ children }: DefaultLayoutProps) {
    return (
        <Container fluid className="p-0">
            <div className="d-flex bg-light" style={{ height: '100vh' }}>
                {/* Thanh taskbar */}
                <div
                    className="m-3"
                    style={{
                        height: 'calc(100vh - 24px)',
                        width: '300px',
                        minWidth: '280px'
                    }}
                >
                    <Taskbar />
                </div>
                
                {/* Cột content */}
                <div className="flex-grow-1 mt-3 me-3" style={{ height: 'calc(100vh - 24px)' }}>
                    {children}
                </div>
            </div>
        </Container>
    );
}

export default DefaultLayout;
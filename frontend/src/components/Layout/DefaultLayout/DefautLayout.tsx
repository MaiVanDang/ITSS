import { ReactNode } from 'react';
import Container from 'react-bootstrap/Container';
import Taskbar from './Taskbar/Taskbar';

interface DefaultLayoutProps {
    children?: ReactNode;
}

function DefaultLayout({ children }: DefaultLayoutProps) {
    return (
        /* <Header /> */

        <Container fluid className="p-0">
            <div className="d-flex bg-light" style={{ height: '100vh' }}>
                {/* Thanh taskbar */}
                <div
                    className="mt-2 ms-2 px-0 border border-dark-subtle rounded-4"
                    style={{
                        height: '100vh',
                        width: '17.5vw',
                        backgroundColor: 'var(--background-color)',
                    }}
                >
                    <Taskbar />
                </div>
                {/* Cột content */}
                <div className="ms-3 mt-2" style={{ height: '100vh', width: '81.5vw' }}>
                    {children}
                </div>
            </div>
        </Container>
    );
}

export default DefaultLayout;
